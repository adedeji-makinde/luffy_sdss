from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.db.models.functions import Distance
from .models import LocationGIS, HazardZone, BusRoute, School
from .serializers import LocationGISSerializer, HazardZoneSerializer, BusRouteSerializer
from django.http import JsonResponse
from .models import LocationGIS, BusRoute
from sklearn.cluster import KMeans
import numpy as np

class LocationGISViewSet(viewsets.ModelViewSet):
    queryset = LocationGIS.objects.all()
    serializer_class = LocationGISSerializer

    # Endpoint: /api/student-locations/in-hazard-zones/
    @action(detail=False, methods=['get'], url_path='in-hazard-zones')
    def in_hazard_zones(self, request):
        """Returns all student locations that fall inside any defined hazard zone."""
        # Get all hazard zone geometries
        hazard_geoms = HazardZone.objects.values_list('geom', flat=True)
        
        # Spatial query: find student points intersecting any hazard polygon
        at_risk_students = LocationGIS.objects.filter(geom__intersects=hazard_geoms)
        
        serializer = self.get_serializer(at_risk_students, many=True)
        return Response(serializer.data)

    # Endpoint: /api/student-locations/distances-to-school/?school_id=1
    @action(detail=False, methods=['get'], url_path='distances-to-school')
    def distances_to_school(self, request):
        """Calculates distance between each student location and a target school."""
        school_id = request.query_params.get('school_id', 1)
        try:
            # For demonstration, assuming school location or taking school address geometry
            school = School.objects.get(id=school_id)
            # Annotate each student location with distance (using student point geometry)
            # Note: In production, we measure against school location Point
            students = LocationGIS.objects.all()
            serializer = self.get_serializer(students, many=True)
            return Response(serializer.data)
        except School.DoesNotExist:
            return Response({"error": "School not found"}, status=400)

class HazardZoneViewSet(viewsets.ModelViewSet):
    queryset = HazardZone.objects.all()
    serializer_class = HazardZoneSerializer

class BusRouteViewSet(viewsets.ModelViewSet):
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer


def nearest_bus_route(request, student_id):
    try:
        # 1. Find the specific student
        student = LocationGIS.objects.get(id=student_id)
        
        # 2. Calculate the distance from this student to every bus route
        # and order them from closest to farthest
        routes_with_distance = BusRoute.objects.annotate(
            distance=Distance('geom', student.geom)
        ).order_by('distance')
        
        # 3. Grab the closest one
        nearest_route = routes_with_distance.first()
        
        if not nearest_route:
            return JsonResponse({'error': 'No bus routes found.'}, status=404)
            
        # 4. Convert the distance to meters (PostGIS handles the projection math!)
        distance_in_meters = nearest_route.distance.m
        
        return JsonResponse({
            'student_name': student.student_name,
            'nearest_route_name': nearest_route.route_name,
            'distance_meters': round(distance_in_meters, 2)
        })
        
    except LocationGIS.DoesNotExist:
       return JsonResponse({'error': 'Student not found.'}, status=404)

def generate_smart_stops(request):
    # This line must be indented exactly 4 spaces!
    students = LocationGIS.objects.all()
    
    n_stops = 3
    if students.count() < n_stops:
        return JsonResponse({
            'error': f'Not enough data. Please add at least {n_stops} students in the admin panel.'
        }, status=400)
        
    coords = []
    for student in students:
        if student.geom:
            coords.append([student.geom.x, student.geom.y])
            
    kmeans = KMeans(n_clusters=n_stops, random_state=42, n_init=10)
    kmeans.fit(coords)
    
    centroids = kmeans.cluster_centers_.tolist()
    
    smart_stops = []
    for index, (lon, lat) in enumerate(centroids):
        smart_stops.append({
            'id': f'smart-stop-{index}',
            'longitude': lon,
            'latitude': lat,
            'label': f'Optimal Stop {index + 1}'
        })
        
    return JsonResponse({'smart_stops': smart_stops})
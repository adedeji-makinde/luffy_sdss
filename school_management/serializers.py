from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import LocationGIS, HazardZone, BusRoute, Student, School

class LocationGISSerializer(GeoFeatureModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.__str__')

    class Meta:
        model = LocationGIS
        geo_field = "geom"
        fields = ('id', 'student', 'student_name', 'flood_risk')

class HazardZoneSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = HazardZone
        geo_field = "geom"
        fields = ('id', 'hazard_type', 'risk_level', 'description')

class BusRouteSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = BusRoute
        geo_field = "geom"
        fields = ('id', 'school', 'route_name', 'description')
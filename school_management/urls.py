from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationGISViewSet, HazardZoneViewSet, BusRouteViewSet
from . import views

router = DefaultRouter()
router.register(r'student-locations', LocationGISViewSet)
router.register(r'hazard-zones', HazardZoneViewSet)
router.register(r'bus-routes', BusRouteViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/student/<int:student_id>/nearest-route/', views.nearest_bus_route, name='nearest_route'),    
    path('api/smart-stops/', views.generate_smart_stops, name='smart_stops'),
]
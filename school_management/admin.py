from django.contrib import admin
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.forms.widgets import OSMWidget
from .models import LocationGIS, HazardZone, BusRoute, Student

# 1. Force the POINT tool for Students
@admin.register(LocationGIS)
class LocationGISAdmin(admin.ModelAdmin):
    formfield_overrides = {
        gis_models.GeometryField: {'widget': OSMWidget(attrs={
            'geom_type': 'POINT',
            'default_lon': 3.3792,
            'default_lat': 6.5244,
            'default_zoom': 12,
        })},
        gis_models.PointField: {'widget': OSMWidget(attrs={
            'default_lon': 3.3792,
            'default_lat': 6.5244,
            'default_zoom': 12,
        })},
    }

# 2. Force the POLYGON tool for Hazards
@admin.register(HazardZone)
class HazardZoneAdmin(admin.ModelAdmin):
    formfield_overrides = {
        gis_models.GeometryField: {'widget': OSMWidget(attrs={
            'geom_type': 'POLYGON',
            'default_lon': 3.3792,
            'default_lat': 6.5244,
            'default_zoom': 11,
        })},
        gis_models.PolygonField: {'widget': OSMWidget(attrs={
            'default_lon': 3.3792,
            'default_lat': 6.5244,
            'default_zoom': 11,
        })},
    }

# 3. Force the LINE tool for Bus Routes
@admin.register(BusRoute)
class BusRouteAdmin(admin.ModelAdmin):
    formfield_overrides = {
        gis_models.GeometryField: {'widget': OSMWidget(attrs={
            'geom_type': 'LINESTRING',
            'default_lon': 3.3792,
            'default_lat': 6.5244,
            'default_zoom': 11,
        })},
        gis_models.LineStringField: {'widget': OSMWidget(attrs={
            'default_lon': 3.3792,
            'default_lat': 6.5244,
            'default_zoom': 11,
        })},
    }

admin.site.register(Student)
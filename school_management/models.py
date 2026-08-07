from django.contrib.gis.db import models

class School(models.Model):
    school_name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return self.school_name

class BusRoute(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    route_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    # LineStringField stores the physical road paths the bus takes
    geom = models.LineStringField(srid=4326) 

    def __str__(self):
        return self.route_name

class HazardZone(models.Model):
    hazard_type = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    # PolygonField stores the boundary shapes of flood-prone areas
    geom = models.PolygonField(srid=4326) 

    def __str__(self):
        return f"{self.hazard_type} ({self.risk_level})"

class Student(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=10)
    date_of_birth = models.DateField()

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class LocationGIS(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE)
    # PointField stores the exact GPS coordinates (Longitude/Latitude)
    geom = models.PointField(srid=4326) 
    flood_risk = models.BooleanField(default=False)

    def __str__(self):
        return f"Location for {self.student.first_name}"
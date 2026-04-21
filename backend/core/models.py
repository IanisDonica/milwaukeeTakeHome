from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid

class User(AbstractUser):
    country = models.CharField(max_length=50, null=True)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=200)

    USERNAME_FIELD = 'username'

class Token(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return str(self.key)

class RequestLog(models.Model):
    token = models.ForeignKey(Token, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    time_of_request = models.DateTimeField(auto_now_add=True)
    request_info = models.JSONField()
    success = models.BooleanField(default=False)

    def __str__(self):
        status = "Success" if self.success else "Failure"
        return f"Request by {self.user.username} at {self.time_of_request} - {status}"

class Tool(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    manufactured_date = models.DateField()
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tools')

    def __str__(self):
        return self.name

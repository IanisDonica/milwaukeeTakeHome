from django.urls import path

from . import views

urlpatterns = [
    path("auth/token/", views.auth, name="auth"),
    path("transfer/", views.transfer, name="transfer"),
    path("tools/", views.tools_view, name="tools"),
    path("inspect/", views.inspect, name="inspect"),
    path("logs/", views.logs, name="logs"),
]

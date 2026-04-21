from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Token, RequestLog, Tool


admin.site.register(User, UserAdmin)
admin.site.register(Token)
admin.site.register(RequestLog)
admin.site.register(Tool)

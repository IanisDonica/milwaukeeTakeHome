from functools import wraps
from django.http import JsonResponse
from .models import Token, User
from .messages import get_message, get_language
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import MultipleObjectsReturned
import datetime

def token_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        lang = get_language(request)
        token_key = request.headers.get('Authorization')
        if not token_key:
            return JsonResponse({'error': get_message('no_permission', lang)}, status=401)

        try:
            # Assuming token_key is in the format "Token <key>"
            token_key = token_key.split(' ')[1]
            token = Token.objects.get(key=token_key, is_active=True)
            
            # Check for token expiration
            token_age = timezone.now() - token.created_at
            if token_age.total_seconds() > settings.TOKEN_EXPIRATION_SECONDS:
                return JsonResponse({'error': get_message('expired_session', lang)}, status=401)

            request.user = token.user
        except (Token.DoesNotExist, IndexError):
            return JsonResponse({'error': get_message('expired_session', lang)}, status=401)
        except MultipleObjectsReturned:
            # If for some reason there are multiple active tokens with the same key, fail safely.
            return JsonResponse({'error': get_message('server_problem', lang)}, status=500)
        return view_func(request, *args, **kwargs)
    return wrapper

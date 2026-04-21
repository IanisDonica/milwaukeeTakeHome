from django.utils.deprecation import MiddlewareMixin
from .models import RequestLog, Token
from django.core.exceptions import MultipleObjectsReturned
import json

class RequestLoggingMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if request.path.startswith('/logs/'):
            return response

        user = getattr(request, 'user', None)
        if user and not user.is_authenticated:
            user = None
            
        token = None
        
        # If user is not attached but auth header exists, try to resolve it manually
        if not user:
            token_key = request.headers.get('Authorization')
            if token_key:
                try:
                    token_key = token_key.split(' ')[1]
                    # We might have multiple inactive tokens, but keys should still be unique.
                    token = Token.objects.get(key=token_key)
                    user = token.user
                except (Token.DoesNotExist, IndexError):
                    pass
        elif hasattr(user, 'token'):
             # Handle the case where user.token might raise an error or return a RelatedManager if it's a ForeignKey
             # Actually, since it's a reverse ForeignKey, user.token_set is the manager, let's just fall back.
             pass

        # Fallback to finding the *active* token for the user if we don't have the token object yet
        # But wait, if token_key was provided in Authorization, we SHOULD log that specific token
        # If the user logged in successfully (auth view), the token isn't in the request headers yet.
        # But for other views it is.
        if not token:
            token_key = request.headers.get('Authorization')
            if token_key:
                try:
                    token_key = token_key.split(' ')[1]
                    token = Token.objects.get(key=token_key)
                except (Token.DoesNotExist, IndexError):
                    pass

        if not token and user:
            # Maybe the auth view just generated a token. Let's get the active one.
            try:
                token = Token.objects.get(user=user, is_active=True)
            except Token.DoesNotExist:
                token = None
            except MultipleObjectsReturned:
                # In case something went wrong and there are multiple active tokens, grab the latest one
                token = Token.objects.filter(user=user, is_active=True).order_by('-created_at').first()


        body = None
        if request.body:
            try:
                body = json.loads(request.body.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                body = request.body.decode('utf-8', errors='ignore') # fallback to string

        request_info = {
            'method': request.method,
            'path': request.path,
            'headers': dict(request.headers),
            'body': body,
            'status_code': response.status_code,
        }

        success = 200 <= response.status_code < 400

        if user:
            try:
                RequestLog.objects.create(
                    token=token,
                    user=user,
                    request_info=request_info,
                    success=success
                )
            except Exception as e:
                print(f"Error logging request: {e}")

        return response

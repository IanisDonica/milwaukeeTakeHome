from django.shortcuts import render
from django.contrib.auth import authenticate
from .models import Token, RequestLog, Tool, User
from django.http import HttpResponse, JsonResponse
from .decorators import token_required
from .messages import get_message, get_language
import json
from django.views.decorators.http import require_http_methods
from django.db import transaction
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
import uuid
from django.utils import timezone
from django.core.exceptions import MultipleObjectsReturned

@require_http_methods(["POST"])
def auth(request):
    lang = get_language(request)
    
    try:
        data = json.loads(request.body)
        username, password = data.get('username'), data.get('password')

    except json.JSONDecodeError:
        return JsonResponse({'error': get_message('invalid_json', lang)}, status=400)

    if not username or not password:
        return JsonResponse({'error': get_message('wrong_login', lang)}, status=400)

    user = authenticate(username=username, password=password)

    if user is not None:
        # Invalidate old tokens by marking them inactive instead of deleting them.
        # This preserves the token history in the RequestLog.
        Token.objects.filter(user=user, is_active=True).update(is_active=False)
        token = Token.objects.create(user=user)
            
        return JsonResponse({'token': str(token.key)})
    else:
        return JsonResponse({'error': get_message('wrong_login', lang)}, status=401)

@token_required
@require_http_methods(["POST"])
def transfer(request):
    lang = get_language(request)

    try:
        data = json.loads(request.body)
        tool_names = data.get('tools')

        if not isinstance(tool_names, list):
            return JsonResponse({'error': get_message('invalid_tools_list', lang)}, status=400)

        with transaction.atomic():
            tools_to_transfer = Tool.objects.filter(name__in=tool_names)
            
            for tool in tools_to_transfer:
                tool.assigned_to = request.user
                tool.save()

        return JsonResponse({'message': get_message('transfer_success', lang)})

    except json.JSONDecodeError:
        return JsonResponse({'error': get_message('invalid_json', lang)}, status=400)
    except Exception as e:
        return JsonResponse({'error': get_message('server_problem', lang)}, status=500)


@token_required
def tools_view(request):
    lang = get_language(request)
    
    def format_tools(queryset, include_owner=False):
        tools_data = []
        for tool in queryset:
            tool_dict = {
                'name': tool.name,
                'description': tool.description,
                'manufactured_date': tool.manufactured_date.strftime('%Y-%m-%d')
            }
            if include_owner:
                tool_dict['assigned_to'] = tool.assigned_to.username if tool.assigned_to else None
            tools_data.append(tool_dict)
        return tools_data

    try:
        user_role = 'warehouse' if request.user.username == 'warehouse' else 'field_user'

        if user_role == 'warehouse':
            all_tools = Tool.objects.select_related('assigned_to').all()
            central_data = format_tools(all_tools, include_owner=True)
            self_data = []
        else:
            warehouse_user = User.objects.get(username='warehouse')
            central_tools = Tool.objects.filter(assigned_to=warehouse_user)
            central_data = format_tools(central_tools)
            
            self_tools = Tool.objects.filter(assigned_to=request.user)
            self_data = format_tools(self_tools)

        response = {
            'meta': {
                'user_role': user_role
            },
            'data': {
                'central': central_data,
                'self': self_data
            }
        }
        
        return JsonResponse(response)

    except User.DoesNotExist:
        return JsonResponse({'error': get_message('server_problem', lang)}, status=404)
    except Exception as e:
        return JsonResponse({'error': get_message('server_problem', lang)}, status=500)

@token_required
@require_http_methods(["POST"])
def inspect(request):
    lang = get_language(request)

    if request.user.username != 'warehouse':
        return JsonResponse({'error': get_message('no_permission', lang)}, status=403)

    try:
        data = json.loads(request.body)
        tool_name = data.get('tool_name')

        if not tool_name:
            return JsonResponse({'error': get_message('missing_tool_name', lang)}, status=400)

        if not Tool.objects.filter(name=tool_name).exists():
            return JsonResponse({'error': get_message('tool_not_found', lang)}, status=404)

        all_logs = RequestLog.objects.select_related('user', 'token').order_by('time_of_request')
        
        history = []
        for log in all_logs:
            try:
                body = log.request_info.get('body')
                if isinstance(body, dict):
                    tools_in_log = body.get('tools')
                    if isinstance(tools_in_log, list) and tool_name in tools_in_log:
                        history.append({
                            'transferred_to_user': log.user.username,
                            'token_used': str(log.token.key) if log.token else None,
                            'timestamp': log.time_of_request.isoformat()
                        })
            except (AttributeError, TypeError):
                continue

        response = {
            'tool_name': tool_name,
            'transfer_history': history
        }

        return JsonResponse(response)

    except json.JSONDecodeError:
        return JsonResponse({'error': get_message('invalid_json', lang)}, status=400)
    except Exception as e:
        return JsonResponse({'error': get_message('server_problem', lang)}, status=500)

@token_required
def logs(request):
    lang = get_language(request)

    if request.user.username != 'warehouse':
        return JsonResponse({'error': get_message('no_permission', lang)}, status=403)

    log_list = RequestLog.objects.all().order_by('-time_of_request')
    paginator = Paginator(log_list, 25)

    page = request.GET.get('page')
    try:
        logs_page = paginator.page(page)
    except PageNotAnInteger:
        logs_page = paginator.page(1)
    except EmptyPage:
        logs_page = paginator.page(paginator.num_pages)

    data = []
    for log in logs_page:
        data.append({
            'id': log.id,
            'user': log.user.username,
            'token': str(log.token.key) if log.token else None,
            'timestamp': log.time_of_request.isoformat(),
            'action': log.request_info.get('path', 'N/A'),
            'successful': log.success
        })

    return JsonResponse({
        'count': paginator.count,
        'num_pages': paginator.num_pages,
        'current_page': logs_page.number,
        'next': logs_page.next_page_number() if logs_page.has_next() else None,
        'previous': logs_page.previous_page_number() if logs_page.has_previous() else None,
        'results': data
    })

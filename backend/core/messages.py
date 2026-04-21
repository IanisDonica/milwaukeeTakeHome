MESSAGES = {
    'en': {
        'wrong_login': 'Your login details are incorrect. Please check and try again.',
        'expired_session': 'Your session has expired. Please log in again.',
        'no_permission': 'You do not have permission to do this.',
        'server_problem': 'Something went wrong. Please try again in a moment.',
        'transfer_success': 'Tools have been successfully transferred to your account.',
        'tool_not_found': 'The specified tool could not be found.',
        'invalid_json': 'Invalid JSON data provided.',
        'missing_tool_name': 'Tool name is required.',
        'invalid_tools_list': 'The "tools" field must be a list of tool names.',
    },
    'de': {
        'wrong_login': 'Ihre Anmeldedaten sind falsch. Bitte überprüfen Sie diese und versuchen Sie es erneut.',
        'expired_session': 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
        'no_permission': 'Sie haben keine Berechtigung dazu.',
        'server_problem': 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es in einem Moment erneut.',
        'transfer_success': 'Werkzeuge wurden erfolgreich auf Ihr Konto übertragen.',
        'tool_not_found': 'Das angegebene Werkzeug konnte nicht gefunden werden.',
        'invalid_json': 'Ungültige JSON-Daten angegeben.',
        'missing_tool_name': 'Werkzeugname ist erforderlich.',
        'invalid_tools_list': 'Das Feld "tools" muss eine Liste von Werkzeugnamen sein.',
    },
    'ro': {
        'wrong_login': 'Detaliile dvs. de conectare sunt incorecte. Vă rugăm să verificați și să încercați din nou.',
        'expired_session': 'Sesiunea dvs. a expirat. Vă rugăm să vă autentificați din nou.',
        'no_permission': 'Nu aveți permisiunea de a face acest lucru.',
        'server_problem': 'Ceva nu a mers bine. Vă rugăm să încercați din nou într-un moment.',
        'transfer_success': 'Uneltele au fost transferate cu succes în contul dvs.',
        'tool_not_found': 'Unealta specificată nu a putut fi găsită.',
        'invalid_json': 'Date JSON invalide furnizate.',
        'missing_tool_name': 'Numele uneltei este obligatoriu.',
        'invalid_tools_list': 'Câmpul "tools" trebuie să fie o listă de nume de unelte.',
    }
}

def get_message(key, language='en'):
    if not language or language not in MESSAGES:
        language = 'en'
    return MESSAGES[language].get(key, MESSAGES['en'].get(key, ''))

def get_language(request):
    lang = request.GET.get('language')
    if lang:
        return lang
    
    if request.body:
        try:
            import json
            data = json.loads(request.body)
            if isinstance(data, dict):
                return data.get('language', 'en')
        except Exception:
            pass
            
    return 'en'

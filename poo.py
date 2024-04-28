import requests

def get_access_token(client_id, client_secret, authorization_code, redirect_uri):
    url = "https://api.intra.42.fr/oauth/token"
    payload = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': authorization_code,
        'redirect_uri': redirect_uri
    }
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    response = requests.post(url, headers=headers, data=payload)
    return response.json()
client_id = "u-s4t2ud-16b6c7462b738938b4c6b763f4d804a957769bb2e68fc5e727f86a1e219347e5"
client_secret = "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"
authorization_code = '4b65d1d35e0adc29adf65bd7a1c18745e41ce976814b33acb9ecf26bd816c920'
redirect_uri = 'https://myawesomeweb.site/callback'

access_token_response = get_access_token(client_id, client_secret, authorization_code, redirect_uri)

# Erişim jetonunu ve diğer bilgileri yazdırın
print(access_token_response)

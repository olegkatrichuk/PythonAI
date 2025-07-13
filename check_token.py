import base64
import json
import datetime

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrYXRyaWNodWtvbGVnQGdtYWlsLmNvbSIsImV4cCI6MTc1MjQxMTUzMH0.p3Cgi6hv-WKIQf5VkOdBnKs-RlRmCmD7C_yoDMxQLYc'

# Разбиваем токен на части
parts = token.split('.')
if len(parts) != 3:
    print('Invalid token format')
    exit()

# Декодируем payload (вторая часть)
payload_encoded = parts[1]
# Добавляем padding если нужно
padding = 4 - len(payload_encoded) % 4
if padding != 4:
    payload_encoded += '=' * padding

try:
    payload_decoded = base64.urlsafe_b64decode(payload_encoded)
    payload = json.loads(payload_decoded)
    print(f'Token payload: {payload}')
    print(f'Subject (email): {payload.get("sub")}')
    print(f'Expiry timestamp: {payload.get("exp")}')
    
    if payload.get('exp'):
        exp_time = datetime.datetime.fromtimestamp(payload['exp'])
        current_time = datetime.datetime.now()
        print(f'Expiry time: {exp_time}')
        print(f'Current time: {current_time}')
        print(f'Token expired: {current_time > exp_time}')
except Exception as e:
    print(f'Error decoding token: {e}')
from backend.app.auth.jwt import create_access_token, decode_access_token


payload = {
    "sub": "1",
    "email": "test@example.com",
}

token = create_access_token(payload)

print("Generated token:")
print(token)

decoded = decode_access_token(token)

print("\nDecoded payload:")
print(decoded)
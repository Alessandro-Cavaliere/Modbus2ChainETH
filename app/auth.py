from flask import jsonify
import jwt
import datetime
import os
from bson import ObjectId
import secrets
import json


# Funzione middleware per l'autenticazione dell'app
def authenticate_token_app(auth_header):
    if auth_header:
        # Estrae il token dal formato "Bearer <token>"
        token = auth_header.split(' ')[1]
        print(token)
        print(os.getenv('SECRET_APP'))
        # Verifica il token (implementa la tua logica di verifica qui)
        if secrets.compare_digest(token, os.getenv('SECRET_APP')):
            return True
    return False

# Funzione middleware per l'autenticazione


def authenticate_token(auth_header):
    token = auth_header and auth_header.split(' ')[1]
    if not token:
        return False
    try:
        jwt.decode(token, os.environ['JWT_SECRET'], algorithms=["HS256"])
        return True
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Unauthorized"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Unauthorized"}), 401


def serialize_object_id(obj):
    if isinstance(obj, ObjectId):
        return str(obj)  # Converti l'ObjectId in una stringa
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def generate_jwt_token(user):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    payload = {
        "exp": expiration_time,
        # Serializza ObjectId
        "user": json.loads(json.dumps(user, default=serialize_object_id)),
    }
    token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm="HS256")
    return token

# app/routes.py
from flask import Blueprint, request # <- EXTERNO (deve ser ignorado)
from app.utils import get_user_data

api_routes = Blueprint('api', __name__)

@api_routes.route('/user')
def user():
    return get_user_data(request)

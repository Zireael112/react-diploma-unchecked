from django.urls import path
from .views import (
    # DeleteAccountView,
    GetUsersView,
    UserRegister,
    GetCSRFToken,
    UserLogin,
    UserLogout,
    CheckAuthenticatedView,
)

urlpatterns = [
    path("register", UserRegister.as_view()),
    path("csrf_cookie", GetCSRFToken.as_view()),
    path("authenticate", CheckAuthenticatedView.as_view()),
    path("login", UserLogin.as_view()),
    path("logout", UserLogout.as_view()),
    path("get_users", GetUsersView.as_view()),
    path("get_users/<int:user_id>", GetUsersView.as_view()),
]

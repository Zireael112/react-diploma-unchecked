from user_api.serializers import (
    GetUsersViewSerializer,
    UserLoginSerializer,
    UserResiterSerializer,
    UserSerializer,
)
from user_api.validations import custom_validation
from .models import Users
from django.db.models import Count, Sum, F, ExpressionWrapper, FloatField
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAdminUser
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from rest_framework import serializers


@method_decorator(csrf_protect, name="dispatch")
class CheckAuthenticatedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        is_authenticated = request.user.is_authenticated

        if is_authenticated:
            return Response({"authenticated": True})
        else:
            return Response({"authenticated": False})


@method_decorator(csrf_protect, name="dispatch")
class UserRegister(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        try:
            clean_data = custom_validation(request.data)
            serializer = UserResiterSerializer(data=clean_data)

            if serializer.is_valid(raise_exception=True):
                self.perform_create(serializer)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            # Convert the ValidationError detail to a flat dictionary for response
            errors = {key: value for key, value in e.detail.items()}
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        user = serializer.save()


@method_decorator(ensure_csrf_cookie, name="dispatch")
class GetCSRFToken(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        return Response({"success": "CSRF cookie set"})


@method_decorator(csrf_protect, name="dispatch")
class UserLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            serializer = UserLoginSerializer(data=data)
            serializer.is_valid(raise_exception=True)

            user = authenticate(username=data["email"], password=data["password"])

            if user is not None:
                login(request, user)
                user_serializer = UserSerializer(user)
                return Response(user_serializer.data, status=status.HTTP_200_OK)
            else:
                # Authentication failed
                raise AuthenticationFailed(
                    "Incorrect email or password.", code="invalid_credentials"
                )

        except serializers.ValidationError as e:
            errors = e.detail
            return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)


class UserLogout(APIView):
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        try:
            logout(request)
            return Response({"success": "Logout"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetUsersView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAdminUser]

    # NOTE: Getting all users by admin user
    def get(self, request):
        try:
            users = (
                Users.objects.annotate(
                    num_files=Count("userfile"), size_files=Sum("userfile__size")
                )
                .prefetch_related("userfile_set")
                .all()
            )

            serializer = GetUsersViewSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # NOTE: Attributing admin function to selected user
    def put(self, request, user_id):
        try:
            user = Users.objects.get(id=user_id)
            serializer = UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # NOTE: Deleting selected user by admin
    def delete(self, request, user_id):
        try:
            user = Users.objects.get(id=user_id)
            user.delete()
            return Response({"success": "User deleted"}, status=status.HTTP_200_OK)
        except Users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import SessionAuthentication
from rest_framework import generics
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.utils import timezone
from files_api.serializers import UserFileUploadSerializer, UserFileSerializer
from .models import UserFile
from user_api.models import Users


class UserFileUploadView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    parser_classes = [FormParser, MultiPartParser]

    def post(self, request):
        try:
            serializer = UserFileUploadSerializer(data=request.data)
            if serializer.is_valid():
                user = request.user
                file = serializer.validated_data["file"]
                comment = serializer.validated_data["comment"]

                user_file = UserFile(
                    user=user,
                    file=file,
                    name=file.name,
                    comment=comment,
                    size=file.size,
                )
                user_file.save()

                return Response(
                    {"message": "File uploaded successfully"},
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserFileListCreateView(
    generics.ListCreateAPIView, generics.UpdateAPIView, generics.DestroyAPIView
):
    serializer_class = UserFileSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return UserFile.objects.filter(user=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


def Serve_file(request):
    file_path = UserFile.file.path
    UserFile.last_download_date = timezone.now()
    UserFile.save()
    response = FileResponse(open(file_path, "rb"))
    response["Content-Type"] = "application/octet-stream"
    response["Content-Disposition"] = 'attachment; filename="{filename}"'.format(
        filename=UserFile.file.name
    )
    return response


class UserFileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserFileSerializer
    authentication_classes = (SessionAuthentication,)
    permission_classes = (IsAdminUser,)

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response(
                {"error": "User ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = get_object_or_404(Users, id=user_id)

        user_files = UserFile.objects.filter(user=user)

        serializer = self.get_serializer(user_files, many=True)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        user_id = request.query_params.get("user_id")
        file_id = request.query_params.get("file_id")

        if not user_id or not file_id:
            return Response(
                {"error": "User ID and file ID are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(Users, id=user_id)
        user_file = get_object_or_404(UserFile, id=file_id, user=user)
        serializer = self.get_serializer(user_file, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        user_id = request.query_params.get("user_id")
        file_id = request.query_params.get("file_id")

        if not user_id or not file_id:
            return Response(
                {"error": "User ID and file ID are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = get_object_or_404(Users, id=user_id)
        user_file = get_object_or_404(UserFile, id=file_id, user=user)
        self.perform_destroy(user_file)
        return Response(status=status.HTTP_204_NO_CONTENT)

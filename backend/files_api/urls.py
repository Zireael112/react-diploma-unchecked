from django.urls import path
from .views import (
    UserFileUploadView,
    UserFileListCreateView,
    Serve_file,
    UserFileDetailView,
)

urlpatterns = [
    path("upload", UserFileUploadView.as_view()),
    path("get_files", UserFileListCreateView.as_view()),
    path("<str:uuid>/", Serve_file, name="serve_file"),
    path("update/<int:pk>/", UserFileListCreateView.as_view()),
    path("delete/<int:pk>/", UserFileListCreateView.as_view()),
    path("admin", UserFileDetailView.as_view()),
]

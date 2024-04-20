# serializers.py
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

Users = get_user_model()


class UserResiterSerializer(serializers.ModelSerializer):
    storage_path = serializers.CharField(required=False)

    class Meta:
        model = Users
        fields = "__all__"

    def create(self, clean_data):
        try:
            user_obj = Users.objects.create_user(
                email=clean_data["email"],
                password=clean_data["password"],
            )
            user_obj.username = clean_data["username"]
            user_obj.save()
            return user_obj
        except Exception as e:
            raise serializers.ValidationError({"error": str(e)})


# Checks user credentials, returns invalid credentials error if credentials are invalid
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        user = authenticate(
            username=clean_data["email"], password=clean_data["password"]
        )
        if not user:
            raise AuthenticationFailed("Invalid email or password.")
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = (
            "id",
            "email",
            "username",
            "is_staff",
            "storage_path",
        )

    # Overrides the update method to handle the 'is_staff' field
    def update(self, instance, validated_data):
        # Update the user instance with the validated data
        instance.is_staff = validated_data.get("is_staff", instance.is_staff)

        # Call the parent class's update method to handle the remaining fields
        instance = super().update(instance, validated_data)

        instance.save()
        return instance


class GetUsersViewSerializer(serializers.ModelSerializer):
    num_files = serializers.IntegerField()
    size_files = serializers.IntegerField()

    class Meta:
        model = Users
        fields = (
            "id",
            "email",
            "username",
            "is_staff",
            "storage_path",
            "num_files",
            "size_files",
        )

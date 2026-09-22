from django.contrib.auth import password_validation
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, RoleAccess

class LoginSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "phone", "role", "last_login", "is_active")
        read_only_fields = ("id", "role", "last_login", "is_active")

class UserAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ("id", "email", "username", "first_name", "last_name", "phone", "role", "is_active", "is_staff", "password", "last_login", "date_joined")
        read_only_fields = ("id", "last_login", "date_joined")
    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password: user.set_password(password)
        else: user.set_unusable_password()
        user.save()
        return user
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=("password",))
        return instance

class RoleAccessSerializer(serializers.ModelSerializer):
    role_label = serializers.CharField(source="get_role_display", read_only=True)
    class Meta:
        model = RoleAccess
        fields = ("id", "role", "role_label", "permissions", "updated_at")
        read_only_fields = ("id", "role", "role_label", "updated_at")

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    def validate_new_password(self, value):
        password_validation.validate_password(value, self.context["request"].user)
        return value

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

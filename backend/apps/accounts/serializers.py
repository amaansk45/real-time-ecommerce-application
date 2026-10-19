import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Address

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes JWT claims and login response to include user profile data and roles.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Custom claims embedded inside JWT
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['full_name'] = user.full_name
        token['is_staff'] = user.is_staff
        token['is_admin'] = user.is_admin

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Append structured user profile directly into login response
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.full_name,
            'role': self.user.role,
            'phone_number': self.user.phone_number,
            'is_verified': self.user.is_verified,
            'is_staff': self.user.is_staff,
            'avatar': self.user.avatar.url if self.user.avatar else None,
        }
        return data


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for customer account registration.
    Enforces strong password rules and email uniqueness.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'password',
            'password_confirm',
        )
        read_only_fields = ('id',)

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError('A user with this email address already exists.')
        return normalized

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        # All self-registrations default to CUSTOMER role
        user = User.objects.create_user(
            password=password,
            role=User.RoleChoices.CUSTOMER,
            **validated_data
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing customer and admin user profile data.
    """

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'phone_number',
            'role',
            'avatar',
            'is_verified',
            'is_staff',
            'date_joined',
        )
        read_only_fields = ('id', 'email', 'role', 'is_verified', 'is_staff', 'date_joined')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating personal profile details.
    """

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone_number', 'avatar')


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for authenticated password change.
    """

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'New passwords do not match.'})
        validate_password(attrs['new_password'])
        return attrs


class AddressSerializer(serializers.ModelSerializer):
    """
    Serializer for customer shipping and billing addresses.
    """

    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Address
        fields = (
            'id',
            'user',
            'full_name',
            'phone_number',
            'street_address',
            'apartment_suite',
            'city',
            'state',
            'postal_code',
            'country',
            'address_type',
            'is_default',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_postal_code(self, value):
        cleaned = value.strip().replace(' ', '')
        if not re.match(r'^\d{6}$', cleaned):
            raise serializers.ValidationError('Please provide a valid 6-digit Indian PIN code.')
        return cleaned

    def validate_phone_number(self, value):
        cleaned = value.strip().replace(' ', '').replace('-', '')
        if not re.match(r'^(\+91)?\d{10}$', cleaned):
            raise serializers.ValidationError('Please provide a valid 10-digit mobile number.')
        return cleaned

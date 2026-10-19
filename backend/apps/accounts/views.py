from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.common.permissions import IsAdminUserRole
from .models import Address
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    AddressSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Takes email and password credentials and returns JWT access and refresh tokens
    along with full user profile details.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    Customer registration endpoint.
    On successful registration, returns user data and ready-to-use JWT tokens.
    """
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for instant seamless login
        refresh = RefreshToken.for_user(user)

        # Inject custom claims into token payload
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['first_name'] = user.first_name
        refresh['full_name'] = user.full_name
        refresh['is_staff'] = user.is_staff
        refresh['is_admin'] = user.is_admin

        user_data = UserSerializer(user, context={'request': request}).data

        return Response(
            {
                'message': 'Registration successful! Welcome to Indian Bazar.',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': user_data,
            },
            status=status.HTTP_201_CREATED
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile details.
    """
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """
    Endpoint for logged-in users to securely change their password.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': ['Current password is incorrect.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'message': 'Password has been successfully updated.'},
            status=status.HTTP_200_OK
        )


class AddressViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for managing customer delivery addresses.
    Customers can only access and modify their own addresses.
    """
    serializer_class = AddressSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='set-default')
    def set_default(self, request, pk=None):
        """Toggle an address to be the customer's default shipping destination."""
        address = self.get_object()
        address.is_default = True
        address.save()
        return Response(
            {'message': 'Default address updated successfully.', 'address': AddressSerializer(address).data},
            status=status.HTTP_200_OK
        )


class AdminCustomerListView(generics.ListAPIView):
    """
    Admin-only endpoint to list all registered customers in Indian Bazar.
    """
    permission_classes = (IsAuthenticated, IsAdminUserRole)
    serializer_class = UserSerializer
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering_fields = ('date_joined', 'email', 'first_name')
    ordering = ('-date_joined',)

    def get_queryset(self):
        return User.objects.filter(role=User.RoleChoices.CUSTOMER)


class AuthStatusView(APIView):
    """
    Health check & status view for accounts subsystem.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "accounts",
                "message": "Accounts and Auth service active with custom User model."
            },
            status=status.HTTP_200_OK
        )

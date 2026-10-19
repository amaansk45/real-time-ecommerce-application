from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class AuthStatusView(APIView):
    """
    Health check & status view for accounts/auth subsystem.
    """
    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "accounts",
                "message": "Accounts and Auth service active."
            },
            status=status.HTTP_200_OK
        )

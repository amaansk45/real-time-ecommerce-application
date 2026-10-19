from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class ApiRootHealthView(APIView):
    """
    Root health-check and metadata endpoint for Indian Bazar API.
    """
    permission_classes = []

    def get(self, request):
        return Response(
            {
                "app": "Indian Bazar E-Commerce API",
                "version": "1.0.0",
                "status": "operational",
                "timestamp": timezone.now().isoformat(),
                "endpoints": {
                    "health": "/api/health/",
                    "admin": "/admin/",
                    "accounts": "/api/auth/status/",
                    "products": "/api/products/status/",
                    "orders": "/api/orders/status/",
                    "payments": "/api/payments/status/",
                }
            },
            status=status.HTTP_200_OK
        )

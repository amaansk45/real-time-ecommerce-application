from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class OrderStatusView(APIView):
    """
    Health check & status view for orders subsystem.
    """
    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "orders",
                "message": "Orders and Cart service active."
            },
            status=status.HTTP_200_OK
        )

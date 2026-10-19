from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class ProductStatusView(APIView):
    """
    Health check & status view for products subsystem.
    """
    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "products",
                "message": "Products and Catalog service active."
            },
            status=status.HTTP_200_OK
        )

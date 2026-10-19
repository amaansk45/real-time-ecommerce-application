from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status


class PaymentStatusView(APIView):
    """
    Health check & status view for payments subsystem.
    """
    def get(self, request):
        return Response(
            {
                "status": "healthy",
                "service": "payments",
                "message": "Payments and Razorpay service active."
            },
            status=status.HTTP_200_OK
        )

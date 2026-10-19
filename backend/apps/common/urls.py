from django.urls import path
from .views import ApiRootHealthView

urlpatterns = [
    path('health/', ApiRootHealthView.as_view(), name='api-health'),
]

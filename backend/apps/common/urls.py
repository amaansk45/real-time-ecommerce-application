from django.urls import path
from .views import ApiRootHealthView, AdminDashboardMetricsView

urlpatterns = [
    path('health/', ApiRootHealthView.as_view(), name='api-health'),
    path('admin/metrics/', AdminDashboardMetricsView.as_view(), name='admin-dashboard-metrics'),
]

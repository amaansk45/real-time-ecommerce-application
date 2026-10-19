from rest_framework.permissions import BasePermission


class IsAdminUserRole(BasePermission):
    """
    Allows access only to authenticated users who have role='ADMIN' or is_staff/is_superuser.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            getattr(request.user, 'role', None) == 'ADMIN' or
            request.user.is_staff or
            request.user.is_superuser
        )


class IsCustomerUserRole(BasePermission):
    """
    Allows access to authenticated customers.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return getattr(request.user, 'role', None) in ['CUSTOMER', 'ADMIN']

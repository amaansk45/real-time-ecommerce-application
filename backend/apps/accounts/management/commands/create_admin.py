from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    """
    Idempotent management command to create a store admin account for Indian Bazar.
    Usage:
        python manage.py create_admin
        python manage.py create_admin --email admin@indianbazar.com --password mypass123
    """
    help = 'Create an initial store administrator account for Indian Bazar'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='admin@indianbazar.com', help='Admin email')
        parser.add_argument('--password', type=str, default='Admin@12345', help='Admin password')
        parser.add_argument('--first-name', type=str, default='Store', help='Admin first name')
        parser.add_argument('--last-name', type=str, default='Admin', help='Admin last name')

    def handle(self, *args, **options):
        email = options['email'].strip().lower()
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': User.RoleChoices.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'is_verified': True,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully created store administrator account: {email}"
                )
            )
        else:
            user.role = User.RoleChoices.ADMIN
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.WARNING(
                    f"Admin account {email} already exists; updated credentials and admin permissions."
                )
            )

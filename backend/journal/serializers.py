import re
from datetime import date, timedelta
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from .models import Entry
from .security import sanitize_text


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        min_length=3,
        max_length=30,
        required=True
    )
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        max_length=254
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate_username(self, value):
        cleaned = value.strip()
        if not re.match(r'^[a-zA-Z0-9_.-]+$', cleaned):
            raise serializers.ValidationError(
                'Username may only contain alphanumeric characters, underscores, dots, and hyphens.'
            )
        if User.objects.filter(username__iexact=cleaned).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return cleaned

    def validate_email(self, value):
        if not value:
            return ""
        cleaned = value.strip().lower()
        if User.objects.filter(email__iexact=cleaned).exists():
            raise serializers.ValidationError('A user with this email address is already registered.')
        return cleaned

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class EntrySerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    content = serializers.CharField(
        max_length=5000,
        required=True
    )

    class Meta:
        model = Entry
        fields = ['id', 'date', 'content', 'owner_username', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner_username', 'created_at', 'updated_at']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Gratitude entry content cannot be empty.')
        if len(value.strip()) > 5000:
            raise serializers.ValidationError('Content exceeds the maximum permitted limit of 5,000 characters.')
        # Strip unprintable control characters and escape HTML entities
        return sanitize_text(value)

    def validate_date(self, value):
        # Prevent distant future dates (allow at most today + 1 day for timezone differences)
        today = timezone.localdate() if hasattr(timezone, 'localdate') else date.today()
        max_future_date = today + timedelta(days=1)
        min_past_date = date(1970, 1, 1)

        if value > max_future_date:
            raise serializers.ValidationError('Cannot create gratitude entries for future dates.')
        if value < min_past_date:
            raise serializers.ValidationError('Date is outside the acceptable journal range.')
        return value


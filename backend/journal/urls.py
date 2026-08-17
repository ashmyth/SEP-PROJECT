from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import EntryViewSet, RegisterView, CurrentUserView
from .security import AuthRateThrottle


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [AuthRateThrottle]


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = [AuthRateThrottle]


router = DefaultRouter()
router.register(r'entries', EntryViewSet, basename='entry')

urlpatterns = [
    # Authentication endpoints with brute-force protection
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', ThrottledTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', ThrottledTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_me'),
    
    # API endpoints
    path('', include(router.urls)),
]


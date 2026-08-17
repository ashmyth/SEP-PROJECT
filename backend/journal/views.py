from datetime import date, timedelta
from django.shortcuts import render
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Entry
from .serializers import EntrySerializer, RegisterSerializer, UserSerializer
from .security import AuthRateThrottle, EntryRateThrottle, sanitize_text


from django.views.decorators.cache import never_cache


@never_cache
def index(request):
    """Serve the single-page React frontend with no-cache headers."""
    response = render(request, "index.html")
    response["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    return response



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Account created successfully.'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class EntryViewSet(viewsets.ModelViewSet):
    serializer_class = EntrySerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [EntryRateThrottle]

    def get_queryset(self):
        """
        Scoped strictly to the authenticated user only.
        Users can never access or modify another user's journal entries.
        """
        queryset = Entry.objects.filter(owner=self.request.user).order_by('-date')

        # Optional filter by month / year
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        if year and month:
            try:
                queryset = queryset.filter(date__year=int(year), date__month=int(month))
            except (ValueError, TypeError):
                pass
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-date')
    def by_date(self, request):
        """
        Retrieve journal entry for a specific date (YYYY-MM-DD).
        """
        target_date_str = request.query_params.get('date')
        if not target_date_str:
            return Response(
                {'error': 'date query parameter is required (format: YYYY-MM-DD).'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            target_date = date.fromisoformat(target_date_str)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        entry = Entry.objects.filter(owner=request.user, date=target_date).first()
        if not entry:
            return Response({'entry': None, 'date': target_date_str}, status=status.HTTP_200_OK)
        return Response({'entry': EntrySerializer(entry).data, 'date': target_date_str}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='upsert')
    def upsert_by_date(self, request):
        """
        Create or update journal entry for a specific date with validation.
        """
        target_date_str = request.data.get('date')
        raw_content = request.data.get('content', '')

        serializer = EntrySerializer(data={'date': target_date_str, 'content': raw_content})
        serializer.is_valid(raise_exception=True)

        target_date = serializer.validated_data['date']
        clean_content = serializer.validated_data['content']

        entry, created = Entry.objects.update_or_create(
            owner=request.user,
            date=target_date,
            defaults={'content': clean_content}
        )
        return Response(
            EntrySerializer(entry).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Calculate gratitude metrics: streaks, total entries, active dates list.
        """
        entries = Entry.objects.filter(owner=request.user).order_by('date')
        total_entries = entries.count()

        dates_set = {e.date for e in entries}
        active_dates = [d.isoformat() for d in sorted(dates_set)]

        today = timezone.localdate() if hasattr(timezone, 'localdate') else date.today()
        current_streak = 0
        longest_streak = 0

        # Current streak: check backwards from today or yesterday
        check_date = today
        if check_date not in dates_set:
            check_date = today - timedelta(days=1)

        while check_date in dates_set:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Longest streak calculation
        sorted_dates = sorted(dates_set)
        if sorted_dates:
            temp_streak = 1
            longest_streak = 1
            for i in range(1, len(sorted_dates)):
                if sorted_dates[i] == sorted_dates[i - 1] + timedelta(days=1):
                    temp_streak += 1
                else:
                    temp_streak = 1
                if temp_streak > longest_streak:
                    longest_streak = temp_streak

        # This month count
        this_month_count = Entry.objects.filter(
            owner=request.user,
            date__year=today.year,
            date__month=today.month
        ).count()

        return Response({
            'total_entries': total_entries,
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'this_month_count': this_month_count,
            'active_dates': active_dates,
            'today': today.isoformat()
        })


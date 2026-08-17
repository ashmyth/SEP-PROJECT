from datetime import date, timedelta
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Entry


class JournalAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='ComplexPassword123!'
        )
        self.user2 = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='ComplexPassword123!'
        )

        # Generate JWT tokens for test users
        refresh1 = RefreshToken.for_user(self.user1)
        self.user1_access = str(refresh1.access_token)
        self.user1_refresh = str(refresh1)

        refresh2 = RefreshToken.for_user(self.user2)
        self.user2_access = str(refresh2.access_token)
        self.user2_refresh = str(refresh2)

    def test_user_registration(self):
        url = reverse('auth_register')
        payload = {
            'username': 'charlie',
            'email': 'charlie@example.com',
            'password': 'StrongPassword789!',
            'password_confirm': 'StrongPassword789!'
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'charlie')

    def test_token_refresh(self):
        url = reverse('token_refresh')
        response = self.client.post(url, {'refresh': self.user1_refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_unauthenticated_request_rejected(self):
        url = reverse('entry-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_data_isolation(self):
        # Alice creates an entry
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user1_access}')
        today = date.today().isoformat()
        
        response = self.client.post(reverse('entry-list'), {
            'date': today,
            'content': 'I am deeply grateful for the warm cup of morning coffee and peaceful sunrise.'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        entry_id = response.data['id']

        # Alice sees her entry in list
        list_response = self.client.get(reverse('entry-list'))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]['id'], entry_id)

        # Bob logs in and checks list - MUST BE EMPTY (strict scoping)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user2_access}')
        bob_list = self.client.get(reverse('entry-list'))
        self.assertEqual(bob_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(bob_list.data), 0)

        # Bob cannot access Alice's entry detail
        bob_detail = self.client.get(reverse('entry-detail', kwargs={'pk': entry_id}))
        self.assertEqual(bob_detail.status_code, status.HTTP_404_NOT_FOUND)

    def test_by_date_and_upsert(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user1_access}')
        target_date = (date.today() - timedelta(days=2)).isoformat()

        # Upsert new entry
        upsert_url = reverse('entry-upsert-by-date')
        resp1 = self.client.post(upsert_url, {
            'date': target_date,
            'content': 'Grateful for a kind gesture from a stranger on the train.'
        }, format='json')
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)

        # Query by date
        by_date_url = f"{reverse('entry-by-date')}?date={target_date}"
        resp2 = self.client.get(by_date_url)
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(resp2.data['entry'])
        self.assertEqual(resp2.data['entry']['content'], 'Grateful for a kind gesture from a stranger on the train.')

        # Upsert update existing entry
        resp3 = self.client.post(upsert_url, {
            'date': target_date,
            'content': 'Updated: Grateful for a kind gesture and serene evening walk.'
        }, format='json')
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
        self.assertEqual(resp3.data['content'], 'Updated: Grateful for a kind gesture and serene evening walk.')

    def test_stats_and_streak(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user1_access}')
        today = date.today()

        # Create 3 consecutive entries
        for i in range(3):
            d = (today - timedelta(days=i)).isoformat()
            Entry.objects.create(
                owner=self.user1,
                date=d,
                content=f'Gratitude for day -{i}'
            )

        stats_url = reverse('entry-stats')
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_entries'], 3)
        self.assertGreaterEqual(response.data['current_streak'], 3)

    def test_security_headers_present(self):
        """Verify defense-in-depth security headers on all responses."""
        response = self.client.get(reverse('auth_register'))
        self.assertEqual(response.headers.get('X-Frame-Options'), 'DENY')
        self.assertEqual(response.headers.get('X-Content-Type-Options'), 'nosniff')
        self.assertEqual(response.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin')
        self.assertIn("default-src 'self'", response.headers.get('Content-Security-Policy', ''))

    def test_input_sanitization_and_xss_protection(self):
        """Verify HTML script injection is escaped in stored reflections."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user1_access}')
        upsert_url = reverse('entry-upsert-by-date')

        xss_payload = '<script>alert("hacked")</script> Grateful for safety!'
        response = self.client.post(upsert_url, {
            'date': (date.today() - timedelta(days=1)).isoformat(),
            'content': xss_payload
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('<script>', response.data['content'])
        self.assertIn('&lt;script&gt;', response.data['content'])


"""
Security utilities, middleware, and throttling policies for Solis Gratitude Journal.
"""
import re
import html
from django.utils.deprecation import MiddlewareMixin
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware that attaches defense-in-depth security headers to every HTTP response.
    """

    def process_response(self, request, response):
        # Prevent Clickjacking
        response['X-Frame-Options'] = 'DENY'

        # Prevent MIME-type sniffing
        response['X-Content-Type-Options'] = 'nosniff'

        # Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Hardware & Feature Permissions Policy
        response['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=()'

        # Cross-Origin Protection
        response['Cross-Origin-Opener-Policy'] = 'same-origin'

        # Content-Security-Policy (Permits local scripts/styles and Google Fonts / CDNs)
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]
        response['Content-Security-Policy'] = "; ".join(csp_directives)

        return response


class AuthRateThrottle(AnonRateThrottle):
    """
    Strict rate limit for sensitive authentication endpoints (login, register, token refresh)
    to protect against brute-force attacks and credential stuffing.
    """
    scope = 'auth'


class EntryRateThrottle(UserRateThrottle):
    """
    Burst and sustained throttle for journal write operations.
    """
    scope = 'entry_write'


def sanitize_text(text: str) -> str:
    """
    Sanitize user-submitted text by escaping HTML entities and stripping unprintable control characters.
    """
    if not isinstance(text, str):
        return ""
    # Strip null bytes and non-printable control characters (except newline, tab, carriage return)
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    # Escape HTML to prevent stored XSS
    return html.escape(cleaned.strip())

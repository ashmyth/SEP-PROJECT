# Daily Gratitude Journal (Solis)

A private, mindful web application to write and preserve one paragraph of gratitude a day. Built with a **Django REST Framework (DRF)** backend and a pure **React** frontend featuring a bespoke, editorial design.

---

## Tech Stack

### Backend
- **Django**: Web framework and ORM.
- **Django REST Framework (DRF)**: RESTful API architecture and ViewSets.
- **djangorestframework-simplejwt**: JWT token-based authentication (`TokenObtainPairView`, `TokenRefreshView`).
- **django-cors-headers**: Cross-Origin Resource Sharing handling.
- **SQLite**: Database storage.

### Frontend
- **React**: Component-based user interface and state management.
- **Tailwind CSS**: Utility-first styling with custom double-bezel hardware styling and typographic hierarchy.
- **Axios**: HTTP client configured with request & response interceptors for automatic JWT token attachment and 401 token refresh retry.
- **Canvas Confetti**: Visual celebration on entry preservation.
- **Web Audio API**: Synthesized resonant audio chime for tactile feedback.

---

## App Features & Architecture

### 1. App-Specific Functionality
- **One Paragraph a Day Writing Sanctuary**:
  - Focus-mode text editor with word count tracking and sweet-spot indicator (~30–120 words for one thoughtful daily paragraph).
  - Daily inspiration prompts to spark deep reflection across various categories (Sensory Delights, Human Kindness, Inner Resilience, Living World, Self Gratitude, Serendipity, Roots & Wisdom, Quiet Sanctuary).
  - Quick date navigation (`← Prev Day`, `Next Day →`, `Today`).
  - Tactile commitment with golden confetti celebration and soothing audio chime.
- **Interactive Calendar Sanctuary**:
  - Month matrix view displaying daily reflection status indicators (glowing ember checkmarks for recorded days).
  - Jump directly to any past or present date to pen or revisit entries.
  - Real-time monthly reflection stats (% of days chronicled).
- **Chronicle Timeline Archive**:
  - Searchable stream of all previous gratitude reflections.
  - Filter by month or search by keyword/date.
  - Export full reflection archive to `.txt`.
- **Gratitude Insights & Streaks**:
  - Current streak tracking (consecutive daily entries).
  - All-time record streak counter.
  - Total chronicled reflections and monthly count.

### 2. Common Baseline: Django + React JWT Auth Architecture
- **Token Generation & Lifecycles**:
  - Login via Simple JWT's `TokenObtainPairView` returns an **Access Token** (1 hour expiry) and a **Refresh Token** (1 day expiry).
- **Security & Data Scoping**:
  - Global default permission set to `IsAuthenticated` in DRF settings.
  - The `Entry` model includes `owner = models.ForeignKey(User, on_delete=models.CASCADE)`.
  - `EntryViewSet` overrides `get_queryset()` to return `Entry.objects.filter(owner=request.user)`, strictly isolating each user's private journal.
- **Global Auth State (`AuthContext`)**:
  - Manages `user`, `login()`, `register()`, and `logout()` across the entire app.
- **Axios Interceptors**:
  - Outgoing request interceptor automatically injects `Authorization: Bearer <token>`.
  - Response interceptor catches `401 Unauthorized` errors, requests a new access token via `/api/auth/refresh/` using the refresh token, and retries the original request.
- **Protected Routes (`<ProtectedRoute>`)**:
  - Route guard checking authentication state and redirecting unauthenticated users to the Login/Register screens.

---

## Project Structure

```
SEP-PROJECT/
├── backend/
│   ├── journal/
│   │   ├── models.py         # Entry model (owner, date, content, created_at, updated_at)
│   │   ├── serializers.py    # EntrySerializer, RegisterSerializer, UserSerializer
│   │   ├── views.py          # EntryViewSet, RegisterView, CurrentUserView, index view
│   │   ├── urls.py           # API endpoints routing
│   │   └── tests.py          # Automated test suite (Auth, Scoping, CRUD, Stats)
│   ├── journal_project/
│   │   ├── settings.py       # DRF, SimpleJWT, CORS, and Staticfiles configuration
│   │   ├── urls.py           # Root URL routing
│   │   └── wsgi.py
│   └── manage.py
├── frontend/
│   ├── index.html            # Main HTML shell loading vendored libraries and app.js
│   ├── app.js                # React components, AuthContext, Axios interceptors, Calendar, Editor, Timeline
│   ├── input.css             # Tailwind source stylesheet
│   ├── dist/
│   │   └── output.css        # Compiled production CSS
│   ├── tailwind.config.js    # Tailwind configuration and theme tokens
│   ├── package.json          # Frontend build scripts
│   └── vendor/               # Vendored React, ReactDOM, Axios, Framer Motion, Confetti
└── README.md
```

---

## Setup & Running Locally

### 1. Backend Setup
1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```
2. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
3. (Optional) Run the automated test suite:
   ```bash
   python manage.py test
   ```
4. Start the Django server:
   ```bash
   python manage.py runserver
   ```
   The backend server will run on `http://127.0.0.1:8000/`.

### 2. Frontend Setup
1. Open a terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. (Optional) Rebuild CSS if you make style modifications:
   ```bash
   npm run build
   ```
3. Open `http://127.0.0.1:8000/` in your browser. Django serves the React application directly at the root URL.

---

## API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register new user account & obtain initial tokens | No |
| `POST` | `/api/auth/login/` | Obtain Access & Refresh token pair | No |
| `POST` | `/api/auth/refresh/` | Refresh Access Token using Refresh Token | No |
| `GET` | `/api/auth/me/` | Fetch authenticated user profile | Yes |
| `GET` | `/api/entries/` | List all gratitude entries for current user | Yes |
| `POST` | `/api/entries/` | Create a gratitude entry | Yes |
| `GET` | `/api/entries/<id>/` | Retrieve specific entry | Yes |
| `PUT/PATCH` | `/api/entries/<id>/` | Update specific entry | Yes |
| `DELETE` | `/api/entries/<id>/` | Delete specific entry | Yes |
| `GET` | `/api/entries/by-date/?date=YYYY-MM-DD` | Retrieve entry for an exact calendar date | Yes |
| `POST` | `/api/entries/upsert/` | Upsert (create or update) entry for a date | Yes |
| `GET` | `/api/entries/stats/` | Retrieve streak, total reflections, active dates | Yes |

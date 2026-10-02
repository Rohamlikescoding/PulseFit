# Django + PostgreSQL Backend Guide for PulseFit Sanctuary

This guide details how to build a production-grade backend for **PulseFit Sanctuary** using **Python, Django, Django REST Framework (DRF), and PostgreSQL** ("a good database").

---

## 1. Tech Stack Recommendation

- **Backend**: Python 3.11+ with **Django 5.x** & **Django REST Framework (DRF)**
- **Database**: **PostgreSQL 16+** (Native JSONField, UUID primary keys, B-tree indexes, ACID transactions)
- **Authentication**: **SimpleJWT** (`djangorestframework-simplejwt`) for stateless JWT Bearer token authentication
- **CORS Handling**: `django-cors-headers`
- **WSGI / ASGI Server**: Gunicorn / Uvicorn + Whitenoise

---

## 2. Project Setup & Dependencies

### Quickstart Commands
```bash
# 1. Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install required packages
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers psycopg[binary] python-dotenv

# 3. Create Django project and workout app
django-admin startproject sanctuary_backend .
python manage.py startapp workouts
```

---

## 3. Django Configuration (`settings.py`)

Add the installed apps, CORS configuration, DRF settings, and PostgreSQL database settings:

```python
# sanctuary_backend/settings.py
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-secure-production-secret-key')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # 3rd-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Local apps
    'workouts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sanctuary_backend.urls'

# PostgreSQL Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'pulsefit_db'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'CONN_MAX_AGE': 60,
    }
}

# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
}

# SimpleJWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS Configuration (Allows frontend React Vite server)
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all during local development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True
```

---

## 4. Database Fields Specification for Django Models

| Django Model | Field Name | Django Field Type | Key Attributes & Constraints | Purpose in Frontend |
|---|---|---|---|---|
| **UserSettings** | `user` | `OneToOneField(User)` | `on_delete=models.CASCADE, related_name='settings'` | Associates settings to Django auth user |
| | `weight_unit` | `CharField(max_length=4)` | `choices=[('kg','kg'), ('lb','lb')], default='kg'` | Unit toggled in settings / session logger |
| | `default_loop_duration` | `IntegerField()` | `default=90` | Rest interval loop timer default in seconds |
| | `theme` | `CharField(max_length=10)` | `choices=[('dark','dark'), ('light','light'), ('system','system')], default='dark'` | Theme preference |
| | `updated_at` | `DateTimeField()` | `auto_now=True` | Last timestamp updated |
| **Exercise** | `id` | `CharField(max_length=64)` | `primary_key=True` | Unique slug (e.g. `ex_barbell_bench_press`) |
| | `name` | `CharField(max_length=255)` | `db_index=True` | Name shown in search / modal |
| | `body_part` | `CharField(max_length=100)` | `db_index=True` | Muscle category (`chest`, `back`, `legs`, etc.) |
| | `target` | `CharField(max_length=100)` | `blank=True, null=True, db_index=True` | Specific target muscle |
| | `equipment` | `CharField(max_length=100)` | `blank=True, null=True` | Equipment required (`barbell`, `dumbbell`, etc.) |
| | `gif_url` | `URLField(max_length=1000)` | `blank=True, null=True` | Animated demonstration GIF |
| | `difficulty` | `CharField(max_length=50)` | `blank=True, null=True` | Skill level (`beginner`, `intermediate`, `advanced`) |
| | `mechanics` | `CharField(max_length=50)` | `blank=True, null=True` | `compound` vs `isolation` |
| | `force` | `CharField(max_length=50)` | `blank=True, null=True` | `push`, `pull`, or `static` |
| | `secondary_muscles` | `JSONField()` | `default=list, blank=True` | Array of synergist muscle names |
| | `instructions` | `JSONField()` | `default=list, blank=True` | Array of step-by-step form execution steps |
| | `tips` | `JSONField()` | `default=list, blank=True` | Array of biomechanical injury prevention cues |
| **Routine** | `id` | `UUIDField()` | `primary_key=True, default=uuid.uuid4, editable=False` | Routine ID |
| | `user` | `ForeignKey(User)` | `on_delete=models.CASCADE, related_name='routines'` | Routine owner |
| | `name` | `CharField(max_length=255)` | - | Program title (e.g. Push/Pull/Legs) |
| | `days_per_week` | `PositiveSmallIntegerField()` | `default=3` | Target frequency (1-7) |
| | `is_active` | `BooleanField()` | `default=False` | Currently active program for streak & dashboard |
| | `created_at` | `DateTimeField()` | `auto_now_add=True` | Creation timestamp |
| | `updated_at` | `DateTimeField()` | `auto_now=True` | Last modification timestamp |
| **WorkoutDay** | `id` | `UUIDField()` | `primary_key=True, default=uuid.uuid4, editable=False` | Day ID |
| | `routine` | `ForeignKey(Routine)` | `on_delete=models.CASCADE, related_name='days'` | Parent routine |
| | `weekday` | `PositiveSmallIntegerField()` | `0` to `6` (0=Sun, 1=Mon, ..., 6=Sat) | Scheduled weekday |
| | `name` | `CharField(max_length=255)` | - | Day title (e.g. `Monday Upper Power`) |
| | `sort_order` | `PositiveIntegerField()` | `default=0` | Display ordering |
| **PlannedExercise** | `id` | `UUIDField()` | `primary_key=True, default=uuid.uuid4, editable=False` | Planned exercise ID |
| | `workout_day` | `ForeignKey(WorkoutDay)` | `on_delete=models.CASCADE, related_name='exercises'` | Parent day |
| | `exercise_id` | `CharField(max_length=64)` | - | Reference to catalog exercise |
| | `name` | `CharField(max_length=255)` | - | Exercise name snapshot |
| | `gif_url` | `URLField(max_length=1000)` | `blank=True, null=True` | Media link |
| | `target_sets` | `PositiveIntegerField()` | `default=3` | Prescribed target set count |
| | `sort_order` | `PositiveIntegerField()` | `default=0` | Order in workout |
| **SessionLog** | `id` | `UUIDField()` | `primary_key=True, default=uuid.uuid4, editable=False` | Session log ID |
| | `user` | `ForeignKey(User)` | `on_delete=models.CASCADE, related_name='sessions'` | User |
| | `routine` | `ForeignKey(Routine)` | `on_delete=models.SET_NULL, null=True, blank=True` | Associated routine |
| | `date` | `DateField()` | `db_index=True` | ISO date `YYYY-MM-DD` for streak & heatmap |
| | `routine_name` | `CharField(max_length=255)` | `blank=True, null=True` | Routine title snapshot |
| | `workout_day_name` | `CharField(max_length=255)` | `blank=True, null=True` | Day title snapshot |
| | `completed_at` | `DateTimeField()` | `blank=True, null=True` | Session completion timestamp |
| | `created_at` | `DateTimeField()` | `auto_now_add=True` | Record creation timestamp |
| **ExerciseLog** | `id` | `UUIDField()` | `primary_key=True, default=uuid.uuid4, editable=False` | Exercise log ID |
| | `session` | `ForeignKey(SessionLog)` | `on_delete=models.CASCADE, related_name='exercises'` | Parent session |
| | `exercise_id` | `CharField(max_length=64)` | - | Canonical exercise slug |
| | `name` | `CharField(max_length=255)` | - | Exercise name (e.g. `Barbell Squat`) |
| | `body_part` | `CharField(max_length=100)` | `blank=True, null=True` | Body part category for pie chart analytics |
| | `sort_order` | `PositiveIntegerField()` | `default=0` | Order in session |
| **SetLog** | `id` | `UUIDField()` | `primary_key=True, default=uuid.uuid4, editable=False` | Set ID |
| | `exercise_log` | `ForeignKey(ExerciseLog)` | `on_delete=models.CASCADE, related_name='sets'` | Parent exercise log |
| | `reps` | `PositiveIntegerField()` | `default=0` | Rep count |
| | `weight` | `DecimalField(max_digits=7, decimal_places=2)` | `default=0.00` | Load lifted |
| | `completed` | `BooleanField()` | `default=True` | Gym floor completion checkbox tick |
| | `set_order` | `PositiveIntegerField()` | `default=0` | Set index in exercise (Set 1, Set 2...) |

---

## 5. Django Models Code (`workouts/models.py`)

Here are the complete models mapped to the frontend types (`Routine`, `WorkoutDay`, `SessionLog`, `SetLog`, etc.):

```python
# workouts/models.py
import uuid
from django.db import models
from django.contrib.auth.models import User

class UserSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    weight_unit = models.CharField(max_length=4, choices=[('kg', 'kg'), ('lb', 'lb')], default='kg')
    default_loop_duration = models.IntegerField(default=90)  # in seconds
    theme = models.CharField(max_length=10, choices=[('dark', 'dark'), ('light', 'light'), ('system', 'system')], default='dark')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s settings ({self.weight_unit})"


class Exercise(models.Model):
    """Master exercise catalog with animated demonstrations"""
    id = models.CharField(max_length=64, primary_key=True)  # e.g. "ex_barbell_bench_press"
    name = models.CharField(max_length=255, db_index=True)
    body_part = models.CharField(max_length=100, db_index=True)  # e.g. "chest", "back", "legs"
    target = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    equipment = models.CharField(max_length=100, blank=True, null=True)
    gif_url = models.URLField(max_length=1000, blank=True, null=True)
    difficulty = models.CharField(max_length=50, blank=True, null=True)
    mechanics = models.CharField(max_length=50, blank=True, null=True)  # compound / isolation
    force = models.CharField(max_length=50, blank=True, null=True)      # push / pull / static
    secondary_muscles = models.JSONField(default=list, blank=True)
    instructions = models.JSONField(default=list, blank=True)
    tips = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Routine(models.Model):
    """User training splits (e.g., Push/Pull/Legs, Upper/Lower)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routines')
    name = models.CharField(max_length=255)
    days_per_week = models.PositiveSmallIntegerField(default=3)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class WorkoutDay(models.Model):
    """Scheduled training days for a routine (0=Sun, 1=Mon, ..., 6=Sat)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name='days')
    weekday = models.PositiveSmallIntegerField()  # 0 to 6
    name = models.CharField(max_length=255)       # e.g. "Monday Upper Power"
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'weekday']

    def __str__(self):
        return f"Day {self.weekday}: {self.name}"


class PlannedExercise(models.Model):
    """Exercises assigned to a routine day with target sets"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workout_day = models.ForeignKey(WorkoutDay, on_delete=models.CASCADE, related_name='exercises')
    exercise_id = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    gif_url = models.URLField(max_length=1000, blank=True, null=True)
    target_sets = models.PositiveIntegerField(default=3)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f"{self.name} ({self.target_sets} sets)"


class SessionLog(models.Model):
    """Recorded gym floor workouts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    routine = models.ForeignKey(Routine, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField(db_index=True)  # YYYY-MM-DD
    routine_name = models.CharField(max_length=255, blank=True, null=True)
    workout_day_name = models.CharField(max_length=255, blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-completed_at']

    def __str__(self):
        return f"{self.date} - {self.routine_name or 'Workout'} ({self.user.username})"


class ExerciseLog(models.Model):
    """Individual exercises performed during a session"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(SessionLog, on_delete=models.CASCADE, related_name='exercises')
    exercise_id = models.CharField(max_length=64)
    name = models.CharField(max_length=255)
    body_part = models.CharField(max_length=100, blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']


class SetLog(models.Model):
    """Tactile set logs with weight, reps, and completion tick"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exercise_log = models.ForeignKey(ExerciseLog, on_delete=models.CASCADE, related_name='sets')
    reps = models.PositiveIntegerField(default=0)
    weight = models.DecimalField(max_digits=7, decimal_places=2, default=0.00)
    completed = models.BooleanField(default=True)
    set_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['set_order']
```

---

## 5. Serializers (`workouts/serializers.py`)

Handle nested representations so the JSON matches the frontend SPA interfaces seamlessly:

```python
# workouts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserSettings, Exercise, Routine, WorkoutDay, 
    PlannedExercise, SessionLog, ExerciseLog, SetLog
)

class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['weight_unit', 'default_loop_duration', 'theme']


class UserProfileSerializer(serializers.ModelSerializer):
    settings = UserSettingsSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'settings']


class PlannedExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannedExercise
        fields = ['exercise_id', 'name', 'gif_url', 'target_sets']
        extra_kwargs = {'exercise_id': {'source': 'exerciseId'}}


class WorkoutDaySerializer(serializers.ModelSerializer):
    exercises = PlannedExerciseSerializer(many=True)

    class Meta:
        model = WorkoutDay
        fields = ['weekday', 'name', 'exercises']


class RoutineSerializer(serializers.ModelSerializer):
    days = WorkoutDaySerializer(many=True)

    class Meta:
        model = Routine
        fields = ['id', 'name', 'days_per_week', 'days', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        days_data = validated_data.pop('days', [])
        user = self.context['request'].user
        routine = Routine.objects.create(user=user, **validated_data)
        
        for d_idx, day_data in enumerate(days_data):
            exercises_data = day_data.pop('exercises', [])
            workout_day = WorkoutDay.objects.create(routine=routine, sort_order=d_idx, **day_data)
            
            for e_idx, ex_data in enumerate(exercises_data):
                PlannedExercise.objects.create(workout_day=workout_day, sort_order=e_idx, **ex_data)
                
        return routine

    def update(self, instance, validated_data):
        days_data = validated_data.pop('days', None)
        instance.name = validated_data.get('name', instance.name)
        instance.days_per_week = validated_data.get('days_per_week', instance.days_per_week)
        instance.save()

        if days_data is not None:
            instance.days.all().delete()
            for d_idx, day_data in enumerate(days_data):
                exercises_data = day_data.pop('exercises', [])
                workout_day = WorkoutDay.objects.create(routine=instance, sort_order=d_idx, **day_data)
                for e_idx, ex_data in enumerate(exercises_data):
                    PlannedExercise.objects.create(workout_day=workout_day, sort_order=e_idx, **ex_data)

        return instance


class SetLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SetLog
        fields = ['reps', 'weight', 'completed']


class ExerciseLogSerializer(serializers.ModelSerializer):
    sets = SetLogSerializer(many=True)
    exerciseId = serializers.CharField(source='exercise_id')

    class Meta:
        model = ExerciseLog
        fields = ['exerciseId', 'name', 'body_part', 'sets']


class SessionLogSerializer(serializers.ModelSerializer):
    exercises = ExerciseLogSerializer(many=True)
    routineId = serializers.CharField(source='routine.id', allow_null=True, required=False)
    routineName = serializers.CharField(source='routine_name', required=False)
    workoutDayName = serializers.CharField(source='workout_day_name', required=False)
    completedAt = serializers.DateTimeField(source='completed_at', required=False)

    class Meta:
        model = SessionLog
        fields = ['id', 'routineId', 'date', 'routineName', 'workoutDayName', 'exercises', 'completedAt']
        read_only_fields = ['id']

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        user = self.context['request'].user
        session = SessionLog.objects.create(user=user, **validated_data)

        for e_idx, ex_data in enumerate(exercises_data):
            sets_data = ex_data.pop('sets', [])
            ex_log = ExerciseLog.objects.create(session=session, sort_order=e_idx, **ex_data)
            for s_idx, set_data in enumerate(sets_data):
                SetLog.objects.create(exercise_log=ex_log, set_order=s_idx, **set_data)

        return session


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'
```

---

## 6. Views & Analytics (`workouts/views.py`)

Includes fast PostgreSQL aggregations for the **Heatmap**, **Progression Chart**, and **Volume Pie Chart**:

```python
# workouts/views.py
from datetime import datetime, timedelta
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Max, F
from .models import Routine, SessionLog, Exercise, UserSettings
from .serializers import (
    RoutineSerializer, SessionLogSerializer, 
    ExerciseSerializer, UserSettingsSerializer
)

class RoutineViewSet(viewsets.ModelViewSet):
    serializer_class = RoutineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Routine.objects.filter(user=self.request.user)

    @action(detail=True, methods=['put'])
    def activate(self, request, pk=None):
        Routine.objects.filter(user=request.user).update(is_active=False)
        routine = self.get_object()
        routine.is_active = True
        routine.save()
        return Response({'status': f'{routine.name} activated as current program'})


class SessionLogViewSet(viewsets.ModelViewSet):
    serializer_class = SessionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SessionLog.objects.filter(user=self.request.user).prefetch_related('exercises__sets')


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def heatmap(self, request):
        """Returns 52-week activity map for the Botanical Heatmap"""
        today = datetime.now().date()
        one_year_ago = today - timedelta(days=364)
        
        sessions = SessionLog.objects.filter(
            user=request.user,
            date__gte=one_year_ago,
            date__lte=today
        ).prefetch_related('exercises__sets')

        activity_map = {}
        for sess in sessions:
            iso_date = sess.date.isoformat()
            if iso_date not in activity_map:
                activity_map[iso_date] = {'totalSets': 0, 'totalVolume': 0.0}
            
            for ex in sess.exercises.all():
                for s in ex.sets.all():
                    if s.completed:
                        activity_map[iso_date]['totalSets'] += 1
                        activity_map[iso_date]['totalVolume'] += float(s.weight * s.reps)

        return Response(activity_map)

    @action(detail=False, methods=['get'])
    def progression(self, request):
        """Progression line data filtered by exercise_id"""
        exercise_id = request.query_params.get('exerciseId')
        if not exercise_id:
            return Response({'error': 'exerciseId parameter required'}, status=400)

        sessions = SessionLog.objects.filter(
            user=request.user,
            exercises__exercise_id=exercise_id
        ).order_by('date').distinct()

        history = []
        for sess in sessions:
            target_ex = sess.exercises.filter(exercise_id=exercise_id).first()
            if not target_ex:
                continue

            max_weight = 0.0
            total_vol = 0.0
            completed_sets = 0
            for s in target_ex.sets.all():
                if s.completed:
                    completed_sets += 1
                    max_weight = max(max_weight, float(s.weight))
                    total_vol += float(s.weight * s.reps)

            if completed_sets > 0:
                history.append({
                    'date': sess.date.isoformat(),
                    'maxWeight': max_weight,
                    'totalVolume': total_vol,
                    'setsCount': completed_sets,
                })

        return Response(history)


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('q')
        body_part = self.request.query_params.get('bodyPart')
        if q:
            qs = qs.filter(name__icontains=q)
        if body_part and body_part != 'all':
            qs = qs.filter(body_part__iexact=body_part)
        return qs
```

---

## 7. URL Routing (`sanctuary_backend/urls.py`)

```python
# sanctuary_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from workouts.views import (
    RoutineViewSet, SessionLogViewSet, 
    AnalyticsViewSet, ExerciseViewSet
)

router = DefaultRouter()
router.register(r'routines', RoutineViewSet, basename='routine')
router.register(r'sessions', SessionLogViewSet, basename='session')
router.register(r'exercises', ExerciseViewSet, basename='exercise')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Authentication Endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # REST API Routes
    path('api/', include(router.urls)),
]
```

---

## 8. How to Connect This React App to Django

1. **Set Environment Variable** in your frontend `.env.local`:
   ```bash
   VITE_API_BASE_URL="http://127.0.0.1:8000/api"
   ```

2. **Frontend Authentication Service**:
   Store the JWT token received from `http://127.0.0.1:8000/api/auth/token/`:
   ```typescript
   export async function loginWithDjango(username: string, password: string) {
     const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/token/`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ username, password }),
     });
     const data = await res.json();
     if (res.ok) {
       localStorage.setItem('auth_token', data.access);
       localStorage.setItem('refresh_token', data.refresh);
       return true;
     }
     throw new Error(data.detail || 'Login failed');
   }
   ```

3. **Database Migrations & Running Django**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver 8000
   ```
   Now visit `http://127.0.0.1:8000/admin/` to administer routines, logs, and users!

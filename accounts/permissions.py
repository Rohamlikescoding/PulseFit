from rest_framework.permissions import BasePermission


class IsAthlete(BasePermission):


    message = "Only athletes can access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_athlete)


class IsCoach(BasePermission):
    message = "Only coaches can access this endpoint."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_coach)

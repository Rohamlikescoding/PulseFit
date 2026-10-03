import React, { useMemo } from 'react';
import { formatDateIso, getTodaysWorkout } from '../lib/schedule';
import { useWorkoutStore } from '../store/workoutStore';
import { Notification } from './Notification';
import { useNavigate } from 'react-router-dom';
import { TabSection } from '../types/workout';

interface NotificationHostProps {
  onNavigateTab?: (tab: TabSection) => void;
}

export const NotificationHost: React.FC<NotificationHostProps> = ({ onNavigateTab }) => {
  const navigate = useNavigate();
  const {
    routines,
    activeRoutineId,
    dismissedNotificationDates,
    dismissNotificationForDate,
    startSession,
    activeSession,
    sessionLogs,
  } = useWorkoutStore();

  const todayIso = useMemo(() => formatDateIso(new Date()), []);

  const activeRoutine = useMemo(() => {
    return routines.find((r) => r.id === activeRoutineId) || routines[0] || null;
  }, [routines, activeRoutineId]);

  const todaysWorkout = useMemo(() => {
    return getTodaysWorkout(activeRoutine, new Date());
  }, [activeRoutine]);

  // Check if today was already dismissed
  const isDismissedToday = dismissedNotificationDates.includes(todayIso);

  // Check if today's workout is already completed
  const isCompletedToday = useMemo(() => {
    return sessionLogs.some((log) => log.date === todayIso);
  }, [sessionLogs, todayIso]);

  // Don't show if no workout today, already dismissed, already completed, or user is already in session
  const shouldShow =
    Boolean(todaysWorkout) &&
    !isDismissedToday &&
    !isCompletedToday &&
    !activeSession;

  if (!shouldShow || !todaysWorkout || !activeRoutine) {
    return null;
  }

  const handleOpen = () => {
    startSession(activeRoutine.id, todaysWorkout.weekday);
    if (onNavigateTab) {
      onNavigateTab('workouts');
    } else {
      navigate('/workouts');
    }
  };

  const handleDismiss = () => {
    dismissNotificationForDate(todayIso);
  };

  return (
    <aside aria-label="Workout Notifications" className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 pointer-events-auto">
      <Notification
        title="Today is a Workout Day!"
        message={`"${todaysWorkout.name}" is scheduled in your active routine (${activeRoutine.name}). Do you want to open today's workout?`}
        actions={[
          {
            label: 'Dismiss',
            onClick: handleDismiss,
            variant: 'outline',
          },
          {
            label: 'Open Workout',
            onClick: handleOpen,
            variant: 'primary',
          },
        ]}
        onClose={handleDismiss}
      />
    </aside>
  );
};

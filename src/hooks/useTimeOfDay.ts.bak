'use client';

import { useState, useEffect } from 'react';
import type { TimePeriod } from '@/types';

interface TimeOfDayState {
  period: TimePeriod;
  backgroundImage: string;
  greeting: string;
}

function getTimeState(): TimeOfDayState {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    return {
      period: 'dawn',
      backgroundImage: '/backgrounds/dawn.jpg',
      greeting: 'Good morning!',
    };
  } else if (hour >= 8 && hour < 17) {
    return {
      period: 'day',
      backgroundImage: '/backgrounds/day.jpg',
      greeting: 'Hello!',
    };
  } else if (hour >= 17 && hour < 20) {
    return {
      period: 'dusk',
      backgroundImage: '/backgrounds/dusk.jpg',
      greeting: 'Good evening!',
    };
  } else {
    return {
      period: 'night',
      backgroundImage: '/backgrounds/night.jpg',
      greeting: 'Hey there, night owl!',
    };
  }
}

function getNextTransitionTime(): number {
  const now = new Date();
  const hour = now.getHours();

  let nextHour: number;
  if (hour >= 5 && hour < 8) {
    nextHour = 8;
  } else if (hour >= 8 && hour < 17) {
    nextHour = 17;
  } else if (hour >= 17 && hour < 20) {
    nextHour = 20;
  } else {
    // Night - next transition at 5am
    nextHour = 5;
  }

  const nextTransition = new Date();
  nextTransition.setHours(nextHour, 0, 0, 0);

  // If the next transition is in the past (e.g., it's 11pm and next is 5am), add a day
  if (nextTransition <= now) {
    nextTransition.setDate(nextTransition.getDate() + 1);
  }

  return nextTransition.getTime() - now.getTime();
}

export function useTimeOfDay(): TimeOfDayState {
  // Initialize with null to avoid server/client UTC mismatch — useEffect sets real local time
  const [state, setState] = useState<TimeOfDayState>(DEFAULT_TIME_STATE);

  useEffect(() => {
    // Update state on mount (client-side)
    setState(getTimeState());

    // Set up interval to check for time period changes
    const checkInterval = setInterval(() => {
      const newState = getTimeState();
      setState((prev) => {
        if (prev.period !== newState.period) {
          return newState;
        }
        return prev;
      });
    }, 60000); // Check every minute

    // Also set up a timeout for the next transition
    const msUntilNext = getNextTransitionTime();
    const transitionTimeout = setTimeout(() => {
      setState(getTimeState());
    }, msUntilNext);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(transitionTimeout);
    };
  }, []);

  return state;
}

// Export default period for SSR
export const DEFAULT_TIME_STATE: TimeOfDayState = {
  period: 'dusk',
  backgroundImage: '/backgrounds/dusk.jpg',
  greeting: 'Hello!',
};

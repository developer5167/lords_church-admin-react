import { format, parseISO } from 'date-fns';

// Format: "2026-01-19" → "Sunday, January 19, 2026"
export const formatDisplayDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d, yyyy');
};

// Format: Date → "2026-01-19"
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format: "09:00:00" → "9:00 AM"
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Format: "2026-01-19T09:05:23Z" → "9:05 AM"
export const formatCheckInTime = (isoString: string): string => {
  const date = parseISO(isoString);
  return format(date, 'h:mm a');
};

// Format: "2026-01-19T09:05:23Z" → "Jan 19, 2026"
export const formatShortDate = (isoString: string): string => {
  const date = parseISO(isoString);
  return format(date, 'MMM d, yyyy');
};

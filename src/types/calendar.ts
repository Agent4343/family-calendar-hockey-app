// Calendar and event type definitions for the family calendar app

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isActive: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  memberId: string;
  category: EventCategory;
  priority: EventPriority;
  reminders: ReminderSetting[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSetting {
  id: string;
  minutes: number; // Minutes before event
  isEnabled: boolean;
  type: ReminderType;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  endDate?: Date;
  occurrences?: number;
  daysOfWeek?: number[]; // For weekly recurring (0 = Sunday)
  dayOfMonth?: number; // For monthly recurring
}

export type EventCategory = 
  | 'work' 
  | 'school' 
  | 'appointment' 
  | 'family' 
  | 'personal' 
  | 'social' 
  | 'health' 
  | 'sports' 
  | 'other';

export type EventPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ReminderType = 'notification' | 'alert' | 'email';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedDate: Date | null;
  selectedEvent: CalendarEvent | null;
  events: CalendarEvent[];
  familyMembers: FamilyMember[];
  isLoading: boolean;
  filters: {
    memberIds: string[];
    categories: EventCategory[];
    showCompleted: boolean;
  };
}

export interface NotificationSettings {
  isEnabled: boolean;
  defaultReminders: ReminderSetting[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface CalendarPreferences {
  theme: 'light' | 'dark' | 'auto';
  startOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  timeFormat: '12' | '24';
  dateFormat: string;
  defaultView: CalendarView;
  showWeekNumbers: boolean;
  compactMode: boolean;
  highContrast: boolean;
}

// Utility types for component props
export interface EventFormData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isAllDay: boolean;
  memberId: string;
  category: EventCategory;
  priority: EventPriority;
  location: string;
  reminders: ReminderSetting[];
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
}

export interface CalendarDayInfo {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  hasEvents: boolean;
}

export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  duration: number;
}

// Default values
export const DEFAULT_FAMILY_MEMBER_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const DEFAULT_REMINDER_OPTIONS = [
  { label: 'At time of event', minutes: 0 },
  { label: '5 minutes before', minutes: 5 },
  { label: '15 minutes before', minutes: 15 },
  { label: '30 minutes before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '2 hours before', minutes: 120 },
  { label: '1 day before', minutes: 1440 },
  { label: '2 days before', minutes: 2880 },
];

export const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: string }[] = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'school', label: 'School', icon: '📚' },
  { value: 'appointment', label: 'Appointment', icon: '🏥' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'personal', label: 'Personal', icon: '🧘' },
  { value: 'social', label: 'Social', icon: '🎉' },
  { value: 'health', label: 'Health', icon: '🏃' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'other', label: 'Other', icon: '📝' },
];
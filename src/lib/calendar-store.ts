'use client';

import React from 'react';
import { 
  CalendarEvent, 
  FamilyMember, 
  CalendarState, 
  NotificationSettings,
  CalendarPreferences,
  DEFAULT_FAMILY_MEMBER_COLORS 
} from '@/types/calendar';

// LocalStorage keys
const STORAGE_KEYS = {
  EVENTS: 'family-calendar-events',
  MEMBERS: 'family-calendar-members',
  PREFERENCES: 'family-calendar-preferences',
  NOTIFICATIONS: 'family-calendar-notifications'
} as const;

// Default family members
const DEFAULT_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'member-1',
    name: 'Parent 1',
    color: DEFAULT_FAMILY_MEMBER_COLORS[0],
    isActive: true
  },
  {
    id: 'member-2',
    name: 'Parent 2',
    color: DEFAULT_FAMILY_MEMBER_COLORS[1],
    isActive: true
  },
  {
    id: 'member-3',
    name: 'Child 1',
    color: DEFAULT_FAMILY_MEMBER_COLORS[2],
    isActive: true
  },
  {
    id: 'member-4',
    name: 'Child 2',
    color: DEFAULT_FAMILY_MEMBER_COLORS[3],
    isActive: true
  }
];

// Default preferences
const DEFAULT_PREFERENCES: CalendarPreferences = {
  theme: 'auto',
  startOfWeek: 0, // Sunday
  timeFormat: '12',
  dateFormat: 'MM/dd/yyyy',
  defaultView: 'month',
  showWeekNumbers: false,
  compactMode: false,
  highContrast: false
};

// Default notification settings
const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  isEnabled: true,
  defaultReminders: [
    { id: 'default-15', minutes: 15, isEnabled: true, type: 'notification' }
  ],
  soundEnabled: true,
  vibrationEnabled: true,
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '07:00'
  }
};

class CalendarStore {
  private listeners: Set<() => void> = new Set();
  private state: CalendarState = {
    currentDate: new Date(),
    view: 'month',
    selectedDate: null,
    selectedEvent: null,
    events: [],
    familyMembers: [],
    isLoading: false,
    filters: {
      memberIds: [],
      categories: [],
      showCompleted: true
    }
  };

  constructor() {
    this.initializeStore();
  }

  // Initialize store with data from localStorage
  private initializeStore() {
    if (typeof window === 'undefined') {
      // Server-side: set default values
      this.state.familyMembers = DEFAULT_FAMILY_MEMBERS;
      this.state.events = [];
      this.state.filters.memberIds = DEFAULT_FAMILY_MEMBERS
        .filter(member => member.isActive)
        .map(member => member.id);
      return;
    }

    // Load family members
    const storedMembers = this.getFromStorage<FamilyMember[]>(STORAGE_KEYS.MEMBERS);
    this.state.familyMembers = storedMembers || DEFAULT_FAMILY_MEMBERS;

    // Load events
    const storedEvents = this.getFromStorage<CalendarEvent[]>(STORAGE_KEYS.EVENTS);
    this.state.events = storedEvents ? this.deserializeEvents(storedEvents) : [];

    // Initialize filters to show all active family members
    this.state.filters.memberIds = this.state.familyMembers
      .filter(member => member.isActive)
      .map(member => member.id);

    this.notifyListeners();
  }

  // Storage utilities
  private getFromStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Error reading from localStorage key ${key}:`, error);
      return null;
    }
  }

  private setToStorage(key: string, value: CalendarEvent[] | FamilyMember[] | string | boolean): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage key ${key}:`, error);
    }
  }

  // Event serialization helpers
  private deserializeEvents(events: Record<string, unknown>[]): CalendarEvent[] {
    return events.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      recurringPattern: event.recurringPattern ? {
        ...event.recurringPattern,
        endDate: event.recurringPattern.endDate ? new Date(event.recurringPattern.endDate) : undefined
      } : undefined
    }));
  }

  // Subscription management
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // State getters
  getState(): CalendarState {
    return { ...this.state };
  }

  getEvents(): CalendarEvent[] {
    return this.state.events;
  }

  getFamilyMembers(): FamilyMember[] {
    return this.state.familyMembers;
  }

  getPreferences(): CalendarPreferences {
    return this.getFromStorage(STORAGE_KEYS.PREFERENCES) || DEFAULT_PREFERENCES;
  }

  getNotificationSettings(): NotificationSettings {
    return this.getFromStorage(STORAGE_KEYS.NOTIFICATIONS) || DEFAULT_NOTIFICATIONS;
  }

  // Event management
  addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): string {
    const now = new Date();
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    this.state.events.push(newEvent);
    this.setToStorage(STORAGE_KEYS.EVENTS, this.state.events);
    this.notifyListeners();

    return newEvent.id;
  }

  updateEvent(eventId: string, updates: Partial<CalendarEvent>): boolean {
    const eventIndex = this.state.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;

    this.state.events[eventIndex] = {
      ...this.state.events[eventIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.setToStorage(STORAGE_KEYS.EVENTS, this.state.events);
    this.notifyListeners();
    return true;
  }

  deleteEvent(eventId: string): boolean {
    const initialLength = this.state.events.length;
    this.state.events = this.state.events.filter(e => e.id !== eventId);
    
    if (this.state.events.length < initialLength) {
      this.setToStorage(STORAGE_KEYS.EVENTS, this.state.events);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // Get events for a specific date range
  getEventsInRange(startDate: Date, endDate: Date): CalendarEvent[] {
    return this.state.events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      return (eventStart >= startDate && eventStart <= endDate) ||
             (eventEnd >= startDate && eventEnd <= endDate) ||
             (eventStart <= startDate && eventEnd >= endDate);
    });
  }

  // Get events for a specific date
  getEventsForDate(date: Date): CalendarEvent[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getEventsInRange(startOfDay, endOfDay);
  }

  // Family member management
  addFamilyMember(member: Omit<FamilyMember, 'id'>): string {
    const newMember: FamilyMember = {
      ...member,
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    this.state.familyMembers.push(newMember);
    this.setToStorage(STORAGE_KEYS.MEMBERS, this.state.familyMembers);
    this.notifyListeners();

    return newMember.id;
  }

  updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): boolean {
    const memberIndex = this.state.familyMembers.findIndex(m => m.id === memberId);
    if (memberIndex === -1) return false;

    this.state.familyMembers[memberIndex] = {
      ...this.state.familyMembers[memberIndex],
      ...updates
    };

    this.setToStorage(STORAGE_KEYS.MEMBERS, this.state.familyMembers);
    this.notifyListeners();
    return true;
  }

  deleteFamilyMember(memberId: string): boolean {
    const initialLength = this.state.familyMembers.length;
    this.state.familyMembers = this.state.familyMembers.filter(m => m.id !== memberId);
    
    if (this.state.familyMembers.length < initialLength) {
      this.setToStorage(STORAGE_KEYS.MEMBERS, this.state.familyMembers);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // UI state management
  setCurrentDate(date: Date): void {
    this.state.currentDate = date;
    this.notifyListeners();
  }

  setView(view: CalendarState['view']): void {
    this.state.view = view;
    this.notifyListeners();
  }

  setSelectedDate(date: Date | null): void {
    this.state.selectedDate = date;
    this.notifyListeners();
  }

  setSelectedEvent(event: CalendarEvent | null): void {
    this.state.selectedEvent = event;
    this.notifyListeners();
  }

  // Filter management
  setMemberFilters(memberIds: string[]): void {
    this.state.filters.memberIds = memberIds;
    this.notifyListeners();
  }

  setCategoryFilters(categories: CalendarState['filters']['categories']): void {
    this.state.filters.categories = categories;
    this.notifyListeners();
  }

  toggleShowCompleted(): void {
    this.state.filters.showCompleted = !this.state.filters.showCompleted;
    this.notifyListeners();
  }

  // Settings management
  updatePreferences(preferences: Partial<CalendarPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    this.setToStorage(STORAGE_KEYS.PREFERENCES, updated);
    this.notifyListeners();
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    const current = this.getNotificationSettings();
    const updated = { ...current, ...settings };
    this.setToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.notifyListeners();
  }

  // Data export/import
  exportData(): string {
    const exportData = {
      events: this.state.events,
      members: this.state.familyMembers,
      preferences: this.getPreferences(),
      notifications: this.getNotificationSettings(),
      version: '1.0',
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.events) {
        this.state.events = this.deserializeEvents(data.events);
        this.setToStorage(STORAGE_KEYS.EVENTS, this.state.events);
      }

      if (data.members) {
        this.state.familyMembers = data.members;
        this.setToStorage(STORAGE_KEYS.MEMBERS, this.state.familyMembers);
      }

      if (data.preferences) {
        this.setToStorage(STORAGE_KEYS.PREFERENCES, data.preferences);
      }

      if (data.notifications) {
        this.setToStorage(STORAGE_KEYS.NOTIFICATIONS, data.notifications);
      }

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
    
    this.state = {
      currentDate: new Date(),
      view: 'month',
      selectedDate: null,
      selectedEvent: null,
      events: [],
      familyMembers: DEFAULT_FAMILY_MEMBERS,
      isLoading: false,
      filters: {
        memberIds: DEFAULT_FAMILY_MEMBERS.map(m => m.id),
        categories: [],
        showCompleted: true
      }
    };

    this.notifyListeners();
  }
}

// Create singleton instance
export const calendarStore = new CalendarStore();

// Hook for React components
export function useCalendarStore() {
  const [state, setState] = React.useState(calendarStore.getState());

  React.useEffect(() => {
    const unsubscribe = calendarStore.subscribe(() => {
      setState(calendarStore.getState());
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    actions: {
      addEvent: calendarStore.addEvent.bind(calendarStore),
      updateEvent: calendarStore.updateEvent.bind(calendarStore),
      deleteEvent: calendarStore.deleteEvent.bind(calendarStore),
      getEventsForDate: calendarStore.getEventsForDate.bind(calendarStore),
      getEventsInRange: calendarStore.getEventsInRange.bind(calendarStore),
      addFamilyMember: calendarStore.addFamilyMember.bind(calendarStore),
      updateFamilyMember: calendarStore.updateFamilyMember.bind(calendarStore),
      deleteFamilyMember: calendarStore.deleteFamilyMember.bind(calendarStore),
      setCurrentDate: calendarStore.setCurrentDate.bind(calendarStore),
      setView: calendarStore.setView.bind(calendarStore),
      setSelectedDate: calendarStore.setSelectedDate.bind(calendarStore),
      setSelectedEvent: calendarStore.setSelectedEvent.bind(calendarStore),
      setMemberFilters: calendarStore.setMemberFilters.bind(calendarStore),
      setCategoryFilters: calendarStore.setCategoryFilters.bind(calendarStore),
      toggleShowCompleted: calendarStore.toggleShowCompleted.bind(calendarStore),
      updatePreferences: calendarStore.updatePreferences.bind(calendarStore),
      updateNotificationSettings: calendarStore.updateNotificationSettings.bind(calendarStore),
      exportData: calendarStore.exportData.bind(calendarStore),
      importData: calendarStore.importData.bind(calendarStore),
      clearAllData: calendarStore.clearAllData.bind(calendarStore)
    }
  };
}
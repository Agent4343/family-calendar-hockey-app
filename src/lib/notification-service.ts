'use client';

import React from 'react';
import { CalendarEvent, ReminderSetting, NotificationSettings } from '@/types/calendar';

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

class NotificationService {
  private registrations: Map<string, number> = new Map();
  private settings: NotificationSettings | null = null;

  constructor() {
    this.checkNotificationSupport();
  }

  // Check if notifications are supported
  private checkNotificationSupport(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current notification permission status
  getPermissionState(): NotificationPermissionState {
    if (typeof window === 'undefined' || !this.checkNotificationSupport()) {
      return { granted: false, denied: true, prompt: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      prompt: permission === 'default'
    };
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.checkNotificationSupport()) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Update notification settings
  updateSettings(settings: NotificationSettings): void {
    this.settings = settings;
  }

  // Check if we're in quiet hours
  private isInQuietHours(): boolean {
    if (!this.settings?.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { startTime, endTime } = this.settings.quietHours;
    
    // Handle quiet hours that span midnight
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  // Schedule notifications for an event
  scheduleEventNotifications(event: CalendarEvent): void {
    if (!this.settings?.isEnabled || !this.getPermissionState().granted) {
      return;
    }

    // Clear existing notifications for this event
    this.clearEventNotifications(event.id);

    const eventTime = new Date(event.startDate).getTime();
    const now = Date.now();

    // Schedule notifications for each reminder
    event.reminders.forEach(reminder => {
      if (!reminder.isEnabled) return;

      const notificationTime = eventTime - (reminder.minutes * 60 * 1000);
      
      // Only schedule future notifications
      if (notificationTime <= now) return;

      const delay = notificationTime - now;
      
      const timeoutId = window.setTimeout(() => {
        this.showEventNotification(event, reminder);
      }, delay);

      // Store the timeout ID for later cleanup
      const key = `${event.id}-${reminder.id}`;
      this.registrations.set(key, timeoutId);
    });
  }

  // Clear all notifications for an event
  clearEventNotifications(eventId: string): void {
    const keysToRemove: string[] = [];
    
    this.registrations.forEach((timeoutId, key) => {
      if (key.startsWith(`${eventId}-`)) {
        clearTimeout(timeoutId);
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.registrations.delete(key);
    });
  }

  // Show notification for an event
  private showEventNotification(event: CalendarEvent, reminder: ReminderSetting): void {
    if (this.isInQuietHours()) {
      console.log('Skipping notification due to quiet hours');
      return;
    }

    const timeUntilEvent = reminder.minutes;
    let title = '';
    let body = event.description || '';

    if (timeUntilEvent === 0) {
      title = `${event.title} - Starting Now`;
    } else if (timeUntilEvent < 60) {
      title = `${event.title} - In ${timeUntilEvent} minutes`;
    } else if (timeUntilEvent === 60) {
      title = `${event.title} - In 1 hour`;
    } else if (timeUntilEvent < 1440) {
      const hours = Math.floor(timeUntilEvent / 60);
      title = `${event.title} - In ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(timeUntilEvent / 1440);
      title = `${event.title} - In ${days} day${days > 1 ? 's' : ''}`;
    }

    if (event.location) {
      body += `\n📍 ${event.location}`;
    }

    const eventStart = new Date(event.startDate);
    const timeString = eventStart.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    body += `\n🕐 ${timeString}`;

    const notificationOptions: NotificationOptions = {
      body: body.trim(),
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: `calendar-event-${event.id}`,
      requireInteraction: event.priority === 'urgent',
      data: {
        eventId: event.id,
        reminderType: reminder.type,
        eventTime: event.startDate
      },
      // Note: actions require service worker support
      // actions: [
      //   {
      //     action: 'view',
      //     title: 'View Event'
      //   },
      //   {
      //     action: 'snooze',
      //     title: 'Snooze 5min'
      //   }
      // ]
    };

    // Add sound and vibration based on settings
    if (this.settings?.soundEnabled) {
      // Modern browsers don't support custom sounds in notifications
      // This would require a service worker for custom notification sounds
    }

    try {
      const notification = new Notification(title, notificationOptions);
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        // Here you could navigate to the event or open the calendar
        notification.close();
      };

      // Auto-close notification after 10 seconds for non-urgent events
      if (event.priority !== 'urgent') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

    } catch (error) {
      console.error('Error showing notification:', error);
      // Fallback to browser alert for critical notifications
      if (event.priority === 'urgent' || event.priority === 'high') {
        alert(`${title}\n\n${body}`);
      }
    }
  }

  // Schedule snooze notification
  snoozeNotification(event: CalendarEvent, snoozeMinutes: number = 5): void {
    const snoozeTime = Date.now() + (snoozeMinutes * 60 * 1000);
    const delay = snoozeTime - Date.now();

    const timeoutId = window.setTimeout(() => {
      // Create a temporary reminder for the snooze
      const snoozeReminder: ReminderSetting = {
        id: 'snooze-temp',
        minutes: 0,
        isEnabled: true,
        type: 'notification'
      };
      this.showEventNotification(event, snoozeReminder);
    }, delay);

    const key = `${event.id}-snooze-${Date.now()}`;
    this.registrations.set(key, timeoutId);
  }

  // Test notification
  async showTestNotification(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return false;

    try {
      const notification = new Notification('Family Calendar Test', {
        body: 'Notifications are working! You\'ll receive reminders for your family events.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png'
      });

      setTimeout(() => notification.close(), 5000);
      return true;
    } catch (error) {
      console.error('Error showing test notification:', error);
      return false;
    }
  }

  // Batch schedule notifications for multiple events
  scheduleMultipleEvents(events: CalendarEvent[]): void {
    events.forEach(event => {
      this.scheduleEventNotifications(event);
    });
  }

  // Clear all scheduled notifications
  clearAllNotifications(): void {
    this.registrations.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    this.registrations.clear();
  }

  // Get statistics about scheduled notifications
  getNotificationStats(): {
    total: number;
    upcoming: number;
    events: number;
  } {
    const totalRegistrations = this.registrations.size;
    const eventIds = new Set<string>();
    
    this.registrations.forEach((_, key) => {
      const eventId = key.split('-')[0];
      eventIds.add(eventId);
    });

    return {
      total: totalRegistrations,
      upcoming: totalRegistrations,
      events: eventIds.size
    };
  }

  // Handle notification click actions (for service worker)
  handleNotificationAction(action: string, data: Record<string, unknown>): void {
    switch (action) {
      case 'view':
        // Navigate to event view
        window.focus();
        break;
      case 'snooze':
        // Snooze the notification
        if (data.eventId) {
          // This would require getting the event from storage
          // and rescheduling the notification
        }
        break;
      default:
        window.focus();
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// React hook for notification management
export function useNotifications() {
  const [permissionState, setPermissionState] = React.useState<NotificationPermissionState>(
    notificationService.getPermissionState()
  );

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setPermissionState(notificationService.getPermissionState());
    return granted;
  };

  const showTestNotification = async (): Promise<boolean> => {
    return await notificationService.showTestNotification();
  };

  React.useEffect(() => {
    // Update permission state if it changes externally
    const checkPermission = () => {
      setPermissionState(notificationService.getPermissionState());
    };

    // Check permission state periodically
    const interval = setInterval(checkPermission, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    permissionState,
    requestPermission,
    showTestNotification,
    scheduleEvent: notificationService.scheduleEventNotifications.bind(notificationService),
    clearEvent: notificationService.clearEventNotifications.bind(notificationService),
    scheduleMultiple: notificationService.scheduleMultipleEvents.bind(notificationService),
    clearAll: notificationService.clearAllNotifications.bind(notificationService),
    updateSettings: notificationService.updateSettings.bind(notificationService),
    getStats: notificationService.getNotificationStats.bind(notificationService)
  };
}
'use client';

import React from 'react';
import { CalendarEvent, ReminderSetting } from '@/types/calendar';

export interface SMSSettings {
  isEnabled: boolean;
  defaultReminders: ReminderSetting[];
  provider: 'twilio' | 'textbelt' | 'email-sms' | 'webhook';
  apiKey?: string;
  accountSid?: string;
  fromNumber?: string;
  webhookUrl?: string;
  emailGateway?: {
    carrier: string;
    email: string;
  };
}

export interface FamilyMemberWithPhone {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isActive: boolean;
  phoneNumber?: string;
  smsEnabled: boolean;
  preferredReminders: ReminderSetting[];
  emergencyContact: boolean;
  carrier?: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  subject?: string;
  template: string;
  variables: string[];
}

class SMSService {
  private settings: SMSSettings | null = null;
  private templates: SMSTemplate[] = [];

  constructor() {
    this.initializeTemplates();
    this.loadSettings();
  }

  // Initialize default SMS templates
  private initializeTemplates() {
    this.templates = [
      {
        id: 'event-reminder',
        name: 'Event Reminder',
        template: '📅 Reminder: "{eventTitle}" starts in {timeUntil}. Location: {location}. Family Calendar',
        variables: ['eventTitle', 'timeUntil', 'location', 'memberName']
      },
      {
        id: 'event-starting',
        name: 'Event Starting Now',
        template: '🔔 "{eventTitle}" is starting now! Don\'t forget. - Family Calendar',
        variables: ['eventTitle', 'memberName']
      },
      {
        id: 'daily-summary',
        name: 'Daily Summary',
        template: '🌅 Good morning {memberName}! You have {eventCount} events today: {eventList}. Have a great day!',
        variables: ['memberName', 'eventCount', 'eventList']
      },
      {
        id: 'family-update',
        name: 'Family Update',
        template: '👨‍👩‍👧‍👦 Family Update: {memberName} {action} "{eventTitle}" for {date}. Check the family calendar for details.',
        variables: ['memberName', 'action', 'eventTitle', 'date']
      },
      {
        id: 'emergency-alert',
        name: 'Emergency Alert',
        template: '🚨 URGENT: {eventTitle} requires immediate attention. {details}. Please respond ASAP.',
        variables: ['eventTitle', 'details', 'memberName']
      }
    ];
  }

  // Load SMS settings from storage
  private loadSettings() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('family-calendar-sms-settings');
      this.settings = stored ? JSON.parse(stored) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading SMS settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  // Get default SMS settings
  private getDefaultSettings(): SMSSettings {
    return {
      isEnabled: false,
      defaultReminders: [
        { id: 'sms-15', minutes: 15, isEnabled: true, type: 'notification' }
      ],
      provider: 'email-sms',
      emailGateway: {
        carrier: 'verizon',
        email: ''
      }
    };
  }

  // Save SMS settings
  saveSettings(settings: SMSSettings) {
    this.settings = settings;
    if (typeof window !== 'undefined') {
      localStorage.setItem('family-calendar-sms-settings', JSON.stringify(settings));
    }
  }

  // Get current settings
  getSettings(): SMSSettings {
    return this.settings || this.getDefaultSettings();
  }

  // Format phone number for SMS
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assume US)
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    return phoneNumber; // Return as-is if it doesn't match expected formats
  }

  // Validate phone number
  isValidPhoneNumber(phoneNumber: string): boolean {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  // Generate SMS message from template
  generateMessage(templateId: string, variables: Record<string, string>): string {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let message = template.template;
    
    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      message = message.replace(regex, value || '');
    });

    // Clean up any remaining unused variables
    message = message.replace(/{[^}]+}/g, '');
    
    return message.trim();
  }

  // Send SMS via Email-to-SMS Gateway (Free option)
  async sendViaEmailGateway(
    phoneNumber: string, 
    message: string, 
    carrier: string
  ): Promise<boolean> {
    const gateways: Record<string, string> = {
      // Canadian Carriers
      'telus': 'msg.telus.com',
      'rogers': 'pcs.rogers.com', 
      'bell': 'txt.bell.ca',
      'fido': 'fido.ca',
      'koodo': 'msg.koodomobile.com',
      'chatr': 'pcs.rogers.com',
      'freedom': 'txt.freedommobile.ca',
      'virgin-ca': 'vmobile.ca',
      'lucky': 'txt.bell.ca',
      
      // US Carriers
      'verizon': 'vtext.com',
      'att': 'txt.att.net',
      'tmobile': 'tmomail.net',
      'sprint': 'messaging.sprintpcs.com',
      'boost': 'smsmyboostmobile.com',
      'cricket': 'sms.cricketwireless.net',
      'metropcs': 'mymetropcs.com',
      'uscellular': 'email.uscc.net',
      'virgin': 'vmobl.com',
      'xfinity': 'vtext.com'
    };

    const gateway = gateways[carrier.toLowerCase()];
    if (!gateway) {
      throw new Error(`Unsupported carrier: ${carrier}`);
    }

    const cleanNumber = phoneNumber.replace(/\D/g, '').slice(-10);
    const emailAddress = `${cleanNumber}@${gateway}`;

    try {
      // This would require a backend email service
      // For now, we'll simulate the API call and provide instructions
      console.log(`Sending SMS to ${emailAddress}: ${message}`);
      
      // In a real implementation, you'd call your backend API here
      const response = await fetch('/api/send-email-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddress,
          subject: '',
          message: message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending email-to-SMS:', error);
      return false;
    }
  }

  // Send SMS via Twilio (Premium option)
  async sendViaTwilio(
    phoneNumber: string,
    message: string,
    accountSid: string,
    authToken: string,
    fromNumber: string
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/send-twilio-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          from: fromNumber,
          body: message,
          accountSid,
          authToken
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending via Twilio:', error);
      return false;
    }
  }

  // Send SMS via webhook (Custom integration)
  async sendViaWebhook(
    phoneNumber: string,
    message: string,
    webhookUrl: string
  ): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          message,
          timestamp: new Date().toISOString(),
          source: 'family-calendar'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending via webhook:', error);
      return false;
    }
  }

  // Main SMS sending method
  async sendSMS(
    phoneNumber: string,
    message: string,
    options: {
      carrier?: string;
      priority?: 'low' | 'normal' | 'high' | 'emergency';
    } = {}
  ): Promise<boolean> {
    if (!this.settings?.isEnabled) {
      console.log('SMS is disabled');
      return false;
    }

    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number');
    }

    const formattedNumber = this.formatPhoneNumber(phoneNumber);
    let success = false;

    // Add priority prefix for high priority messages
    let finalMessage = message;
    if (options.priority === 'emergency') {
      finalMessage = `🚨 URGENT: ${message}`;
    } else if (options.priority === 'high') {
      finalMessage = `⚡ IMPORTANT: ${message}`;
    }

    // Try different sending methods based on configuration
    switch (this.settings.provider) {
      case 'twilio':
        if (this.settings.accountSid && this.settings.apiKey && this.settings.fromNumber) {
          success = await this.sendViaTwilio(
            formattedNumber,
            finalMessage,
            this.settings.accountSid,
            this.settings.apiKey,
            this.settings.fromNumber
          );
        }
        break;

      case 'email-sms':
        if (this.settings.emailGateway && options.carrier) {
          success = await this.sendViaEmailGateway(
            formattedNumber,
            finalMessage,
            options.carrier
          );
        }
        break;

      case 'webhook':
        if (this.settings.webhookUrl) {
          success = await this.sendViaWebhook(
            formattedNumber,
            finalMessage,
            this.settings.webhookUrl
          );
        }
        break;

      default:
        console.log('No SMS provider configured');
        return false;
    }

    return success;
  }

  // Send reminder SMS for an event
  async sendEventReminder(
    event: CalendarEvent,
    member: FamilyMemberWithPhone,
    reminder: ReminderSetting
  ): Promise<boolean> {
    if (!member.smsEnabled || !member.phoneNumber) {
      return false;
    }

    const timeUntil = this.formatTimeUntil(reminder.minutes);
    const variables = {
      eventTitle: event.title,
      memberName: member.name,
      timeUntil: timeUntil,
      location: event.location || 'No location specified',
      date: new Date(event.startDate).toLocaleDateString(),
      time: new Date(event.startDate).toLocaleTimeString()
    };

    const templateId = reminder.minutes === 0 ? 'event-starting' : 'event-reminder';
    const message = this.generateMessage(templateId, variables);

    return await this.sendSMS(member.phoneNumber, message, {
      priority: event.priority === 'urgent' ? 'emergency' : 'normal'
    });
  }

  // Send SMS to multiple family members
  async sendToFamily(
    members: FamilyMemberWithPhone[],
    templateId: string,
    variables: Record<string, string>,
    options: {
      onlyEmergencyContacts?: boolean;
      priority?: 'low' | 'normal' | 'high' | 'emergency';
    } = {}
  ): Promise<{ success: number; failed: number; results: boolean[] }> {
    const targetMembers = options.onlyEmergencyContacts
      ? members.filter(m => m.emergencyContact && m.smsEnabled && m.phoneNumber)
      : members.filter(m => m.smsEnabled && m.phoneNumber);

    const results = await Promise.all(
      targetMembers.map(async (member) => {
        try {
          const memberVariables = {
            ...variables,
            memberName: member.name
          };

          const message = this.generateMessage(templateId, memberVariables);
          return await this.sendSMS(member.phoneNumber!, message, {
            priority: options.priority
          });
        } catch (error) {
          console.error(`Failed to send SMS to ${member.name}:`, error);
          return false;
        }
      })
    );

    return {
      success: results.filter(Boolean).length,
      failed: results.filter(r => !r).length,
      results
    };
  }

  // Send daily summary to family
  async sendDailySummary(
    member: FamilyMemberWithPhone,
    events: CalendarEvent[]
  ): Promise<boolean> {
    if (!member.smsEnabled || !member.phoneNumber || events.length === 0) {
      return false;
    }

    const eventList = events
      .slice(0, 3) // Limit to first 3 events to keep SMS short
      .map(e => `• ${e.title} at ${new Date(e.startDate).toLocaleTimeString()}`)
      .join('\n');

    const variables = {
      memberName: member.name,
      eventCount: events.length.toString(),
      eventList: eventList + (events.length > 3 ? `\n...and ${events.length - 3} more` : '')
    };

    const message = this.generateMessage('daily-summary', variables);
    return await this.sendSMS(member.phoneNumber, message);
  }

  // Format time until event
  private formatTimeUntil(minutes: number): string {
    if (minutes === 0) return 'now';
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes === 60) return '1 hour';
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  }

  // Get available templates
  getTemplates(): SMSTemplate[] {
    return this.templates;
  }

  // Add custom template
  addTemplate(template: Omit<SMSTemplate, 'id'>): string {
    const newTemplate: SMSTemplate = {
      ...template,
      id: `custom-${Date.now()}`
    };

    this.templates.push(newTemplate);
    this.saveTemplates();
    return newTemplate.id;
  }

  // Save templates to storage
  private saveTemplates() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('family-calendar-sms-templates', JSON.stringify(this.templates));
    }
  }

  // Test SMS configuration
  async testConfiguration(phoneNumber: string): Promise<boolean> {
    const message = 'Test message from Family Calendar app. SMS notifications are working! 📱';
    return await this.sendSMS(phoneNumber, message, { priority: 'normal' });
  }
}

// Create singleton instance
export const smsService = new SMSService();

// React hook for SMS management
export function useSMS() {
  const [settings, setSettings] = React.useState<SMSSettings>(smsService.getSettings());

  const updateSettings = (newSettings: SMSSettings) => {
    smsService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const sendTestMessage = async (phoneNumber: string): Promise<boolean> => {
    return await smsService.testConfiguration(phoneNumber);
  };

  const sendEventReminder = async (
    event: CalendarEvent,
    member: FamilyMemberWithPhone,
    reminder: ReminderSetting
  ): Promise<boolean> => {
    return await smsService.sendEventReminder(event, member, reminder);
  };

  const sendFamilyMessage = async (
    members: FamilyMemberWithPhone[],
    templateId: string,
    variables: Record<string, string>,
    options?: {
      onlyEmergencyContacts?: boolean;
      priority?: 'low' | 'normal' | 'high' | 'emergency';
    }
  ) => {
    return await smsService.sendToFamily(members, templateId, variables, options);
  };

  return {
    settings,
    updateSettings,
    sendTestMessage,
    sendEventReminder,
    sendFamilyMessage,
    getTemplates: smsService.getTemplates.bind(smsService),
    addTemplate: smsService.addTemplate.bind(smsService),
    generateMessage: smsService.generateMessage.bind(smsService)
  };
}

// Export types and service
export { SMSService };
export default smsService;
'use client';

import React, { useState, useEffect } from 'react';
import { useCalendarStore } from '@/lib/calendar-store';
import { 
  CalendarEvent, 
  EventFormData, 
  EventCategory, 
  EventPriority, 
  ReminderSetting,
  EVENT_CATEGORIES,
  DEFAULT_REMINDER_OPTIONS
} from '@/types/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventFormData) => void;
}

export function EventDialog({ event, isOpen, onClose, onSave }: EventDialogProps) {
  const { familyMembers } = useCalendarStore();
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    isAllDay: false,
    memberId: familyMembers[0]?.id || '',
    category: 'family',
    priority: 'medium',
    location: '',
    reminders: [
      { id: 'default', minutes: 15, isEnabled: true, type: 'notification' }
    ],
    isRecurring: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize form data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        isAllDay: event.isAllDay,
        memberId: event.memberId,
        category: event.category,
        priority: event.priority,
        location: event.location || '',
        reminders: event.reminders.length > 0 ? event.reminders : [
          { id: 'default', minutes: 15, isEnabled: true, type: 'notification' }
        ],
        isRecurring: event.isRecurring,
        recurringPattern: event.recurringPattern,
      });
    } else {
      // Reset form for new event
      const now = new Date();
      const later = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
      
      setFormData({
        title: '',
        description: '',
        startDate: now,
        endDate: later,
        isAllDay: false,
        memberId: familyMembers[0]?.id || '',
        category: 'family',
        priority: 'medium',
        location: '',
        reminders: [
          { id: 'default', minutes: 15, isEnabled: true, type: 'notification' }
        ],
        isRecurring: false,
      });
    }
    setErrors({});
    setShowAdvanced(false);
  }, [event, familyMembers, isOpen]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a family member';
    }

    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Update form field
  const updateField = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle reminder changes
  const updateReminder = (index: number, updates: Partial<ReminderSetting>) => {
    const newReminders = [...formData.reminders];
    newReminders[index] = { ...newReminders[index], ...updates };
    updateField('reminders', newReminders);
  };

  const addReminder = () => {
    const newReminder: ReminderSetting = {
      id: `reminder-${Date.now()}`,
      minutes: 30,
      isEnabled: true,
      type: 'notification'
    };
    updateField('reminders', [...formData.reminders, newReminder]);
  };

  const removeReminder = (index: number) => {
    if (formData.reminders.length > 1) {
      const newReminders = formData.reminders.filter((_, i) => i !== index);
      updateField('reminders', newReminders);
    }
  };

  // Format date for input
  const formatDateForInput = (date: Date): string => {
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  // Parse date from input
  const parseDateFromInput = (dateString: string): Date => {
    return new Date(dateString);
  };

  const getMemberName = (memberId: string): string => {
    return familyMembers.find(m => m.id === memberId)?.name || 'Unknown';
  };

  const getCategoryInfo = (category: EventCategory) => {
    return EVENT_CATEGORIES.find(cat => cat.value === category);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] md:w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold">
            {event ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Event Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter event title"
                className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Add event details..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isAllDay}
                onCheckedChange={(checked) => {
                  updateField('isAllDay', checked);
                  if (checked) {
                    // Set to full day
                    const start = new Date(formData.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(start);
                    end.setHours(23, 59, 59, 999);
                    updateField('startDate', start);
                    updateField('endDate', end);
                  }
                }}
              />
              <Label className="text-sm font-medium">All Day Event</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Start {formData.isAllDay ? 'Date' : 'Date & Time'} *
                </Label>
                <Input
                  id="startDate"
                  type={formData.isAllDay ? 'date' : 'datetime-local'}
                  value={formData.isAllDay ? 
                    format(formData.startDate, 'yyyy-MM-dd') :
                    formatDateForInput(formData.startDate)
                  }
                  onChange={(e) => {
                    const newDate = parseDateFromInput(e.target.value);
                    updateField('startDate', newDate);
                    
                    // Auto-adjust end date if it's before start date
                    if (newDate >= formData.endDate) {
                      const newEndDate = new Date(newDate.getTime() + 60 * 60 * 1000);
                      updateField('endDate', newEndDate);
                    }
                  }}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">
                  End {formData.isAllDay ? 'Date' : 'Date & Time'} *
                </Label>
                <Input
                  id="endDate"
                  type={formData.isAllDay ? 'date' : 'datetime-local'}
                  value={formData.isAllDay ?
                    format(formData.endDate, 'yyyy-MM-dd') :
                    formatDateForInput(formData.endDate)
                  }
                  onChange={(e) => updateField('endDate', parseDateFromInput(e.target.value))}
                  className={`mt-1 ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="member" className="text-sm font-medium">
                Family Member *
              </Label>
              <Select 
                value={formData.memberId} 
                onValueChange={(value) => updateField('memberId', value)}
              >
                <SelectTrigger className={`mt-1 ${errors.memberId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.memberId && (
                <p className="text-sm text-red-500 mt-1">{errors.memberId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => updateField('category', value as EventCategory)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => updateField('priority', value as EventPriority)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Add location..."
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Reminders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Reminders</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addReminder}
                className="text-xs"
              >
                Add Reminder
              </Button>
            </div>

            <div className="space-y-2">
              {formData.reminders.map((reminder, index) => (
                <Card key={reminder.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={reminder.isEnabled}
                        onCheckedChange={(checked) => 
                          updateReminder(index, { isEnabled: checked })
                        }
                      />
                      
                      <Select
                        value={reminder.minutes.toString()}
                        onValueChange={(value) => 
                          updateReminder(index, { minutes: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEFAULT_REMINDER_OPTIONS.map(option => (
                            <SelectItem 
                              key={option.minutes.toString()} 
                              value={option.minutes.toString()}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {formData.reminders.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeReminder(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => updateField('isRecurring', checked)}
                />
                <Label className="text-sm font-medium">Recurring Event</Label>
                <Badge variant="secondary" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </div>
          )}

          {/* Event Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Event Summary
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>When:</strong> {format(formData.startDate, 'PPP')} at {format(formData.startDate, 'p')}</p>
              <p><strong>Who:</strong> {getMemberName(formData.memberId)}</p>
              <p><strong>Category:</strong> {getCategoryInfo(formData.category)?.label}</p>
              {formData.location && <p><strong>Where:</strong> {formData.location}</p>}
              <p><strong>Reminders:</strong> {formData.reminders.filter(r => r.isEnabled).length} active</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {event ? 'Update Event' : 'Create Event'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
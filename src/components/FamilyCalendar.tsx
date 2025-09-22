'use client';

import React, { useState, useMemo } from 'react';
import { useCalendarStore } from '@/lib/calendar-store';
import { CalendarEvent, FamilyMember, CalendarDayInfo } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isWithinInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from 'date-fns';

interface FamilyCalendarProps {
  onEventClick: (event: CalendarEvent) => void;
  onEventDelete: (eventId: string) => void;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
}

export function FamilyCalendar({
  onEventClick,
  onEventDelete,
  onDateSelect,
  onCreateEvent,
}: FamilyCalendarProps) {
  const {
    currentDate,
    selectedDate,
    events,
    familyMembers,
    filters,
    actions
  } = useCalendarStore();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    
    return eachDayOfInterval({ start, end }).map((date): CalendarDayInfo => {
      const dayEvents = events.filter(event => {
        // Filter by date
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        
        const isEventOnThisDay = event.isAllDay
          ? isSameDay(eventStart, date) || 
            isWithinInterval(date, { start: eventStart, end: eventEnd })
          : isSameDay(eventStart, date);

        // Filter by family member
        const memberVisible = filters.memberIds.length === 0 || 
          filters.memberIds.includes(event.memberId);

        return isEventOnThisDay && memberVisible;
      });

      return {
        date,
        isToday: isToday(date),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isCurrentMonth: isSameMonth(date, currentDate),
        events: dayEvents,
        hasEvents: dayEvents.length > 0,
      };
    });
  }, [currentDate, events, filters.memberIds, selectedDate]);

  // Get family member by ID
  const getFamilyMember = (memberId: string): FamilyMember | undefined => {
    return familyMembers.find(member => member.id === memberId);
  };

  // Navigation handlers
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1);
    actions.setCurrentDate(newDate);
  };

  const goToToday = () => {
    actions.setCurrentDate(new Date());
    actions.setSelectedDate(new Date());
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only navigate if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        navigateMonth('prev'); // Swipe right = previous month
      } else {
        navigateMonth('next'); // Swipe left = next month
      }
    }

    setTouchStart(null);
  };

  // Handle date selection
  const handleDateClick = (day: CalendarDayInfo) => {
    onDateSelect(day.date);
    actions.setSelectedDate(day.date);
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  };

  // Handle long press for new event creation
  const handleDateLongPress = (day: CalendarDayInfo) => {
    actions.setSelectedDate(day.date);
    onCreateEvent();
  };

  // Render event dot or bar
  const renderEventIndicator = (event: CalendarEvent, index: number) => {
    const member = getFamilyMember(event.memberId);
    const color = member?.color || '#6b7280';

    return (
      <div
        key={`${event.id}-${index}`}
        className={`
          flex items-center px-1 py-0.5 rounded text-xs font-medium truncate cursor-pointer
          hover:opacity-80 transition-opacity touch-manipulation
          ${event.priority === 'urgent' ? 'ring-2 ring-red-400' : ''}
          ${event.priority === 'high' ? 'ring-1 ring-yellow-400' : ''}
        `}
        style={{ 
          backgroundColor: `${color}20`,
          borderLeft: `3px solid ${color}`,
          color: color
        }}
        onClick={(e) => handleEventClick(event, e)}
        title={`${event.title} - ${format(new Date(event.startDate), 'h:mm a')}`}
      >
        <span className="truncate flex-1">{event.title}</span>
        {event.reminders.length > 0 && (
          <span className="ml-1 text-xs opacity-60">🔔</span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="touch-manipulation"
            >
              ←
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="touch-manipulation"
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="touch-manipulation"
            >
              →
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-r-none"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-l-none"
              disabled
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div 
        className="flex-1 p-4 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="h-full">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 h-[calc(100%-60px)]">
            {calendarDays.map((day, index) => {
              const isLongMonth = calendarDays.length > 35;
              const maxEvents = isLongMonth ? 2 : 3;
              const visibleEvents = day.events.slice(0, maxEvents);
              const hiddenCount = Math.max(0, day.events.length - maxEvents);

              return (
                <Card
                  key={index}
                  className={`
                    relative overflow-hidden cursor-pointer transition-all duration-200 touch-manipulation
                    ${day.isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    ${day.isSelected ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''}
                    ${!day.isCurrentMonth ? 'opacity-40' : ''}
                    ${day.hasEvents ? 'border-l-4' : 'border-l-0'}
                    hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                  `}
                  style={{
                    borderLeftColor: day.hasEvents ? 
                      getFamilyMember(day.events[0]?.memberId)?.color || '#6b7280' : 
                      'transparent'
                  }}
                  onClick={() => handleDateClick(day)}
                  onDoubleClick={() => handleDateLongPress(day)}
                >
                  <CardContent className="p-2 h-full flex flex-col">
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-semibold
                          ${day.isToday ? 'text-blue-700 dark:text-blue-300' : ''}
                          ${day.isSelected ? 'text-purple-700 dark:text-purple-300' : ''}
                          ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                        `}
                      >
                        {format(day.date, 'd')}
                      </span>
                      
                      {day.hasEvents && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs h-5 w-5 p-0 flex items-center justify-center"
                        >
                          {day.events.length}
                        </Badge>
                      )}
                    </div>

                    {/* Events */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {visibleEvents.map((event, eventIndex) => 
                        renderEventIndicator(event, eventIndex)
                      )}
                      
                      {hiddenCount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          +{hiddenCount} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Action Button - Desktop Only */}
      <div className="absolute bottom-6 right-6 hidden md:block">
        <Button
          onClick={onCreateEvent}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 text-white text-2xl"
        >
          +
        </Button>
      </div>

      {/* Swipe Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-gray-400 dark:text-gray-600 text-center">
          ← Swipe to navigate →
        </div>
      </div>
    </div>
  );
}
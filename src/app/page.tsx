'use client';

import React, { useState, useEffect } from 'react';
import { FamilyCalendar } from '@/components/FamilyCalendar';
import { EventDialog } from '@/components/EventDialog';
import { MemberSelector } from '@/components/MemberSelector';
import { MobileNavigation } from '@/components/MobileNavigation';
import { SMSSettings } from '@/components/SMSSettings';
import { SMSSettingsDialog } from '@/components/SMSSettingsDialog';
import { useCalendarStore } from '@/lib/calendar-store';
import { useNotifications } from '@/lib/notification-service';
import { CalendarEvent, FamilyMember } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

export default function HomePage() {
  const {
    currentDate,
    selectedDate,
    selectedEvent,
    events,
    familyMembers,
    filters,
    actions
  } = useCalendarStore();
  
  const {
    permissionState,
    requestPermission,
    showTestNotification,
    scheduleMultiple
  } = useNotifications();

  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);

  // Update current time every minute and check if mobile
  useEffect(() => {
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const resizeHandler = () => checkMobile();
    window.addEventListener('resize', resizeHandler);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  // Request notification permission and schedule events on load
  useEffect(() => {
    const initializeNotifications = async () => {
      if (!permissionState.granted && !permissionState.denied) {
        const granted = await requestPermission();
        if (granted && events.length > 0) {
          scheduleMultiple(events);
        }
      } else if (permissionState.granted && events.length > 0) {
        scheduleMultiple(events);
      }
    };

    initializeNotifications();
    
    // Show welcome message for new users
    if (!welcomeMessageShown && events.length === 0) {
      setWelcomeMessageShown(true);
    }
  }, [events, permissionState, requestPermission, scheduleMultiple, welcomeMessageShown]);

  // Handle event creation
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventDialog(true);
  };

  // Handle event editing
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowEventDialog(true);
  };

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      actions.deleteEvent(eventId);
    }
  };

  // Get events for today
  const todaysEvents = actions.getEventsForDate(currentTime);
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = React.useMemo(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return actions.getEventsInRange(today, nextWeek)
      .filter(event => new Date(event.startDate) > today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5); // Show next 5 events
  }, [events, actions]);

  // Get family member by ID
  const getFamilyMember = (memberId: string): FamilyMember | undefined => {
    return familyMembers.find(member => member.id === memberId);
  };

  // Format date for display
  const formatEventDate = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-3 md:p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex flex-col">
            <h1 className="text-lg md:text-3xl font-bold text-gray-900 dark:text-white">
              Family Calendar
            </h1>
            <p className="text-xs md:text-base text-gray-600 dark:text-gray-300">
              {getGreeting()}, {format(currentTime, isMobile ? 'MMM d' : 'EEEE, MMMM d')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Current Time Display */}
          <div className="flex md:hidden flex-col items-end">
            <div className="text-lg font-mono font-bold text-gray-900 dark:text-white">
              {format(currentTime, 'h:mm')}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">
              {format(currentTime, 'MMM d')}
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end">
            <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
              {format(currentTime, 'h:mm a')}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {format(currentTime, 'MMM d, yyyy')}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-1 md:space-x-2">
            <Button
              onClick={handleCreateEvent}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-2 text-sm md:px-6 md:py-3 md:text-base touch-manipulation"
            >
              <span className="hidden md:inline">Add Event</span>
              <span className="md:hidden">+</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMemberDialog(true)}
              className="px-2 py-2 text-sm md:px-4 md:py-3 md:text-base touch-manipulation"
            >
              <span className="hidden md:inline">Family</span>
              <span className="md:hidden">👥</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSMSDialog(true)}
              className="px-2 py-2 text-sm md:px-4 md:py-3 md:text-base touch-manipulation"
            >
              <span className="hidden md:inline">SMS</span>
              <span className="md:hidden">📱</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/hockey-stats'}
              className="px-2 py-2 text-sm md:px-4 md:py-3 md:text-base touch-manipulation"
            >
              <span className="hidden md:inline">Hockey Stats</span>
              <span className="md:hidden">🏒</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/hockey-expenses'}
              className="px-2 py-2 text-sm md:px-4 md:py-3 md:text-base touch-manipulation"
            >
              <span className="hidden md:inline">Hockey $</span>
              <span className="md:hidden">💰</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSMSDialog(true)}
              className="px-2 py-2 text-sm md:px-4 md:py-3 md:text-base touch-manipulation"
            >
              <span className="hidden md:inline">SMS</span>
              <span className="md:hidden">📱</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-60px)] md:h-[calc(100vh-96px)] pb-20 md:pb-0">
        {/* Mobile-first collapsible sidebar */}
        <aside className={`
          w-full md:w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
          border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 
          overflow-y-auto transition-all duration-300
          ${isMobile ? 'max-h-[30vh]' : 'max-h-none'}
        `}>
          <div className="p-2 md:p-4 space-y-3 md:space-y-6">
            {/* Today's Events */}
            <Card>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-sm md:text-lg font-semibold flex items-center justify-between">
                  Today's Events
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {todaysEvents.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 md:space-y-2">
                {todaysEvents.length === 0 ? (
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 py-2 md:py-4 text-center">
                    No events today
                  </p>
                ) : (
                  todaysEvents.slice(0, 3).map(event => {
                    const member = getFamilyMember(event.memberId);
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEditEvent(event)}
                        className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer touch-manipulation transition-colors"
                      >
                        <div
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: member?.color || '#6b7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs md:text-sm text-gray-900 dark:text-white truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(event.startDate), 'h:mm a')}
                            {member && !isMobile && ` • ${member.name}`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {todaysEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center md:hidden">
                    +{todaysEvents.length - 3} more events today
                  </div>
                )}
              </CardContent>
              </Card>
            </div>

            <div className="hidden md:block">
              <Separator />

              {/* Upcoming Events */}
              <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                    No upcoming events
                  </p>
                ) : (
                  upcomingEvents.map(event => {
                    const member = getFamilyMember(event.memberId);
                    const eventDate = new Date(event.startDate);
                    
                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEditEvent(event)}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer touch-manipulation transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: member?.color || '#6b7280' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatEventDate(eventDate)} at {format(eventDate, 'h:mm a')}
                            {member && ` • ${member.name}`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Family Members Filter */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Family Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {familyMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => {
                      const currentFilters = filters.memberIds;
                      const isSelected = currentFilters.includes(member.id);
                      const newFilters = isSelected
                        ? currentFilters.filter(id => id !== member.id)
                        : [...currentFilters, member.id];
                      actions.setMemberFilters(newFilters);
                    }}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer touch-manipulation transition-colors ${
                      filters.memberIds.includes(member.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: member.color }}
                    />
                    <span className={`font-medium text-sm ${
                      filters.memberIds.includes(member.id)
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {member.name}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mobile Family Filter - Horizontal Scrolling */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Filter by:</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {familyMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => {
                      const currentFilters = filters.memberIds;
                      const isSelected = currentFilters.includes(member.id);
                      const newFilters = isSelected
                        ? currentFilters.filter(id => id !== member.id)
                        : [...currentFilters, member.id];
                      actions.setMemberFilters(newFilters);
                    }}
                    className={`
                      flex items-center space-x-2 px-3 py-1 rounded-full whitespace-nowrap text-xs font-medium touch-manipulation transition-colors
                      ${filters.memberIds.includes(member.id)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    <span>{member.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Status */}
            {!permissionState.granted && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm">
                      Enable notifications for reminders
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={requestPermission}
                      className="text-xs"
                    >
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </aside>

        {/* Main Calendar */}
        <main className="flex-1 overflow-hidden min-h-[60vh] md:min-h-auto">
          <FamilyCalendar
            onEventClick={handleEditEvent}
            onEventDelete={handleDeleteEvent}
            onDateSelect={(date) => actions.setSelectedDate(date)}
            onCreateEvent={handleCreateEvent}
          />
        </main>
      </div>

      {/* Event Dialog */}
      {showEventDialog && (
        <EventDialog
          event={editingEvent}
          isOpen={showEventDialog}
          onClose={() => {
            setShowEventDialog(false);
            setEditingEvent(null);
          }}
          onSave={(eventData) => {
            if (editingEvent) {
              actions.updateEvent(editingEvent.id, eventData);
            } else {
              const eventId = actions.addEvent(eventData);
              // Schedule notifications for the new event
              const newEvent = actions.getEventsForDate(eventData.startDate)
                .find(e => e.id === eventId);
              if (newEvent && permissionState.granted) {
                scheduleMultiple([newEvent]);
              }
            }
            setShowEventDialog(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Member Management Dialog */}
      {showMemberDialog && (
        <MemberSelector
          isOpen={showMemberDialog}
          onClose={() => setShowMemberDialog(false)}
        />
      )}

      {/* SMS Settings Dialog */}
      {showSMSDialog && (
        <SMSSettings
          isOpen={showSMSDialog}
          onClose={() => setShowSMSDialog(false)}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNavigation
        todaysEventCount={todaysEvents.length}
        currentDate={currentTime}
        onAddEvent={handleCreateEvent}
        onViewToday={() => {
          actions.setCurrentDate(new Date());
          actions.setSelectedDate(new Date());
        }}
        onManageFamily={() => setShowMemberDialog(true)}
      />

      {/* Welcome Message for New Users */}
      {!welcomeMessageShown && events.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                Welcome to Family Calendar!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                This calendar is optimized for your iPad in the kitchen. Add your first event to get started!
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    setWelcomeMessageShown(true);
                    handleCreateEvent();
                  }}
                  className="flex-1"
                >
                  Add First Event
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setWelcomeMessageShown(true)}
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
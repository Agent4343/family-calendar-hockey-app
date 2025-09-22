'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface MobileNavigationProps {
  todaysEventCount: number;
  currentDate: Date;
  onAddEvent: () => void;
  onViewToday: () => void;
  onManageFamily: () => void;
}

export function MobileNavigation({
  todaysEventCount,
  currentDate,
  onAddEvent,
  onViewToday,
  onManageFamily
}: MobileNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 md:hidden z-50">
      <div className="flex items-center justify-around">
        {/* Today's Events */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewToday}
          className="flex flex-col items-center space-y-1 h-auto py-2 px-2 touch-manipulation"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {format(currentDate, 'd')}
              </span>
            </div>
            {todaysEventCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
              >
                {todaysEventCount}
              </Badge>
            )}
          </div>
          <span className="text-xs font-medium">Today</span>
        </Button>

        {/* Hockey Stats */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/hockey-stats'}
          className="flex flex-col items-center space-y-1 h-auto py-2 px-2 touch-manipulation"
        >
          <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <span className="text-sm">🏒</span>
          </div>
          <span className="text-xs font-medium">Stats</span>
        </Button>

        {/* Add Event - Primary Action */}
        <Button
          onClick={onAddEvent}
          size="lg"
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg touch-manipulation"
        >
          <span className="text-xl">+</span>
        </Button>

        {/* Hockey Expenses */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/hockey-expenses'}
          className="flex flex-col items-center space-y-1 h-auto py-2 px-2 touch-manipulation"
        >
          <div className="w-7 h-7 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <span className="text-sm">💰</span>
          </div>
          <span className="text-xs font-medium">Costs</span>
        </Button>

        {/* Family Management */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onManageFamily}
          className="flex flex-col items-center space-y-1 h-auto py-2 px-2 touch-manipulation"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span className="text-sm">👥</span>
          </div>
          <span className="text-xs font-medium">Family</span>
        </Button>
      </div>
    </div>
  );
}
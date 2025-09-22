'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface HockeyNavigationProps {
  currentPage?: 'calendar' | 'stats' | 'expenses';
}

export function HockeyNavigation({ currentPage = 'calendar' }: HockeyNavigationProps) {
  const router = useRouter();

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        <Button
          variant={currentPage === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => router.push('/')}
          className="touch-manipulation"
        >
          📅 Calendar
        </Button>
        <Button
          variant={currentPage === 'stats' ? 'default' : 'outline'}
          size="sm"
          onClick={() => router.push('/hockey-stats')}
          className="touch-manipulation"
        >
          🏒 Stats
        </Button>
        <Button
          variant={currentPage === 'expenses' ? 'default' : 'outline'}
          size="sm"
          onClick={() => router.push('/hockey-expenses')}
          className="touch-manipulation"
        >
          💰 Expenses
        </Button>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 md:hidden z-50">
        <div className="flex items-center justify-around px-4 py-2">
          <Button
            variant={currentPage === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => router.push('/')}
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 touch-manipulation"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentPage === 'calendar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <span className="text-lg">📅</span>
            </div>
            <span className="text-xs font-medium">Calendar</span>
          </Button>

          <Button
            variant={currentPage === 'stats' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => router.push('/hockey-stats')}
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 touch-manipulation"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentPage === 'stats' 
                ? 'bg-green-600 text-white' 
                : 'bg-green-100 dark:bg-green-900/30'
            }`}>
              <span className="text-lg">🏒</span>
            </div>
            <span className="text-xs font-medium">Hockey Stats</span>
          </Button>

          <Button
            variant={currentPage === 'expenses' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => router.push('/hockey-expenses')}
            className="flex flex-col items-center space-y-1 h-auto py-2 px-3 touch-manipulation"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              currentPage === 'expenses' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-yellow-100 dark:bg-yellow-900/30'
            }`}>
              <span className="text-lg">💰</span>
            </div>
            <span className="text-xs font-medium">Expenses</span>
          </Button>
        </div>
      </div>
    </>
  );
}
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HockeyPlayer, GameStats, SeasonStats, HockeyExpense, ExpenseSummary, Tournament, HockeyMilestone } from '@/types/hockey';
import { format } from 'date-fns';

interface HockeyStore {
  // Players
  players: HockeyPlayer[];
  currentPlayer: HockeyPlayer | null;
  
  // Stats
  gameStats: GameStats[];
  seasonStats: SeasonStats[];
  
  // Expenses
  expenses: HockeyExpense[];
  expenseSummaries: ExpenseSummary[];
  
  // Tournaments
  tournaments: Tournament[];
  
  // Milestones
  milestones: HockeyMilestone[];
  
  // UI State
  selectedSeason: string;
  viewMode: 'stats' | 'expenses' | 'tournaments' | 'milestones';
  
  // Actions
  actions: {
    // Player Management
    addPlayer: (player: Omit<HockeyPlayer, 'id' | 'createdAt'>) => void;
    updatePlayer: (id: string, updates: Partial<HockeyPlayer>) => void;
    setCurrentPlayer: (player: HockeyPlayer | null) => void;
    
    // Game Stats
    addGameStats: (stats: Omit<GameStats, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateGameStats: (id: string, updates: Partial<GameStats>) => void;
    deleteGameStats: (id: string) => void;
    
    // Season Stats
    calculateSeasonStats: (playerId: string, season: string) => SeasonStats;
    
    // Expenses
    addExpense: (expense: Omit<HockeyExpense, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateExpense: (id: string, updates: Partial<HockeyExpense>) => void;
    deleteExpense: (id: string) => void;
    calculateExpenseSummary: (season: string) => ExpenseSummary;
    
    // Tournaments
    addTournament: (tournament: Omit<Tournament, 'id'>) => void;
    updateTournament: (id: string, updates: Partial<Tournament>) => void;
    deleteTournament: (id: string) => void;
    
    // Milestones
    addMilestone: (milestone: Omit<HockeyMilestone, 'id' | 'createdAt'>) => void;
    updateMilestone: (id: string, updates: Partial<HockeyMilestone>) => void;
    deleteMilestone: (id: string) => void;
    checkForMilestones: (stats: GameStats) => HockeyMilestone[];
    
    // UI Actions
    setSelectedSeason: (season: string) => void;
    setViewMode: (mode: 'stats' | 'expenses' | 'tournaments' | 'milestones') => void;
    
    // Data Management
    exportData: () => string;
    importData: (data: string) => void;
    clearAllData: () => void;
  };
}

// Helper functions
const generateId = () => `hockey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getCurrentSeason = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Hockey season typically runs from September to April
  if (month >= 8) { // September or later
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
};

export const useHockeyStore = create<HockeyStore>()(
  persist(
    (set, get) => ({
      // Initial State
      players: [],
      currentPlayer: null,
      gameStats: [],
      seasonStats: [],
      expenses: [],
      expenseSummaries: [],
      tournaments: [],
      milestones: [],
      selectedSeason: getCurrentSeason(),
      viewMode: 'stats',
      
      actions: {
        // Player Management
        addPlayer: (playerData) => {
          const player: HockeyPlayer = {
            ...playerData,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            players: [...state.players, player],
            currentPlayer: state.currentPlayer || player,
          }));
        },
        
        updatePlayer: (id, updates) => {
          set((state) => ({
            players: state.players.map((player) =>
              player.id === id ? { ...player, ...updates } : player
            ),
            currentPlayer: state.currentPlayer?.id === id
              ? { ...state.currentPlayer, ...updates }
              : state.currentPlayer,
          }));
        },
        
        setCurrentPlayer: (player) => {
          set({ currentPlayer: player });
        },
        
        // Game Stats
        addGameStats: (statsData) => {
          const stats: GameStats = {
            ...statsData,
            id: generateId(),
            points: statsData.goals + statsData.assists,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => {
            const newGameStats = [...state.gameStats, stats];
            
            // Check for milestones
            const milestones = get().actions.checkForMilestones(stats);
            
            return {
              gameStats: newGameStats,
              milestones: [...state.milestones, ...milestones],
            };
          });
          
          // Recalculate season stats
          const { calculateSeasonStats } = get().actions;
          calculateSeasonStats(stats.playerId, get().selectedSeason);
        },
        
        updateGameStats: (id, updates) => {
          set((state) => ({
            gameStats: state.gameStats.map((stats) =>
              stats.id === id
                ? {
                    ...stats,
                    ...updates,
                    points: (updates.goals ?? stats.goals) + (updates.assists ?? stats.assists),
                    updatedAt: new Date().toISOString(),
                  }
                : stats
            ),
          }));
        },
        
        deleteGameStats: (id) => {
          set((state) => ({
            gameStats: state.gameStats.filter((stats) => stats.id !== id),
          }));
        },
        
        // Season Stats Calculation
        calculateSeasonStats: (playerId, season) => {
          const { gameStats } = get();
          const playerGames = gameStats.filter(
            (game) => game.playerId === playerId && game.date.includes(season.split('-')[0])
          );
          
          if (playerGames.length === 0) {
            return {
              playerId,
              season,
              gamesPlayed: 0,
              totalGoals: 0,
              totalAssists: 0,
              totalPoints: 0,
              averagePointsPerGame: 0,
              totalPenaltyMinutes: 0,
              totalPlusMinus: 0,
              totalShotsOnGoal: 0,
              shootingPercentage: 0,
              longestGoalStreak: 0,
              longestPointStreak: 0,
              mostGoalsInGame: 0,
              mostAssistsInGame: 0,
              mostPointsInGame: 0,
              wins: 0,
              losses: 0,
              ties: 0,
              overtimeWins: 0,
              overtimeLosses: 0,
              shootoutWins: 0,
              shootoutLosses: 0,
            };
          }
          
          const stats: SeasonStats = {
            playerId,
            season,
            gamesPlayed: playerGames.length,
            totalGoals: playerGames.reduce((sum, game) => sum + game.goals, 0),
            totalAssists: playerGames.reduce((sum, game) => sum + game.assists, 0),
            totalPoints: playerGames.reduce((sum, game) => sum + game.points, 0),
            averagePointsPerGame: 0,
            totalPenaltyMinutes: playerGames.reduce((sum, game) => sum + game.penaltyMinutes, 0),
            totalPlusMinus: playerGames.reduce((sum, game) => sum + game.plusMinus, 0),
            totalShotsOnGoal: playerGames.reduce((sum, game) => sum + game.shotsOnGoal, 0),
            shootingPercentage: 0,
            longestGoalStreak: 0,
            longestPointStreak: 0,
            mostGoalsInGame: Math.max(...playerGames.map(game => game.goals)),
            mostAssistsInGame: Math.max(...playerGames.map(game => game.assists)),
            mostPointsInGame: Math.max(...playerGames.map(game => game.points)),
            wins: playerGames.filter(game => game.result === 'Win' || game.result === 'Overtime Win' || game.result === 'Shootout Win').length,
            losses: playerGames.filter(game => game.result === 'Loss' || game.result === 'Overtime Loss' || game.result === 'Shootout Loss').length,
            ties: playerGames.filter(game => game.result === 'Tie').length,
            overtimeWins: playerGames.filter(game => game.result === 'Overtime Win').length,
            overtimeLosses: playerGames.filter(game => game.result === 'Overtime Loss').length,
            shootoutWins: playerGames.filter(game => game.result === 'Shootout Win').length,
            shootoutLosses: playerGames.filter(game => game.result === 'Shootout Loss').length,
          };
          
          // Calculate derived stats
          stats.averagePointsPerGame = stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0;
          stats.shootingPercentage = stats.totalShotsOnGoal > 0 ? (stats.totalGoals / stats.totalShotsOnGoal) * 100 : 0;
          
          // Calculate streaks
          let currentGoalStreak = 0;
          let currentPointStreak = 0;
          let longestGoalStreak = 0;
          let longestPointStreak = 0;
          
          playerGames.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(game => {
            if (game.goals > 0) {
              currentGoalStreak++;
              longestGoalStreak = Math.max(longestGoalStreak, currentGoalStreak);
            } else {
              currentGoalStreak = 0;
            }
            
            if (game.points > 0) {
              currentPointStreak++;
              longestPointStreak = Math.max(longestPointStreak, currentPointStreak);
            } else {
              currentPointStreak = 0;
            }
          });
          
          stats.longestGoalStreak = longestGoalStreak;
          stats.longestPointStreak = longestPointStreak;
          
          // Update season stats in store
          set((state) => ({
            seasonStats: [
              ...state.seasonStats.filter(s => !(s.playerId === playerId && s.season === season)),
              stats,
            ],
          }));
          
          return stats;
        },
        
        // Expenses
        addExpense: (expenseData) => {
          const expense: HockeyExpense = {
            ...expenseData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set((state) => ({
            expenses: [...state.expenses, expense],
          }));
        },
        
        updateExpense: (id, updates) => {
          set((state) => ({
            expenses: state.expenses.map((expense) =>
              expense.id === id
                ? { ...expense, ...updates, updatedAt: new Date().toISOString() }
                : expense
            ),
          }));
        },
        
        deleteExpense: (id) => {
          set((state) => ({
            expenses: state.expenses.filter((expense) => expense.id !== id),
          }));
        },
        
        calculateExpenseSummary: (season) => {
          const { expenses } = get();
          const seasonExpenses = expenses.filter((expense) => expense.season === season);
          
          if (seasonExpenses.length === 0) {
            return {
              season,
              totalExpenses: 0,
              totalReimbursed: 0,
              netExpenses: 0,
              totalTaxDeductible: 0,
              categoryTotals: {},
              monthlyTotals: {},
              paymentMethodTotals: {},
              expensesPerGame: 0,
              expensesPerMonth: 0,
              projectedYearTotal: 0,
            };
          }
          
          const totalExpenses = seasonExpenses.reduce((sum, exp) => sum + exp.amount, 0);
          const totalReimbursed = seasonExpenses
            .filter((exp) => exp.isReimbursed)
            .reduce((sum, exp) => sum + (exp.reimbursedAmount || 0), 0);
          const totalTaxDeductible = seasonExpenses
            .filter((exp) => exp.isTaxDeductible)
            .reduce((sum, exp) => sum + exp.amount, 0);
          
          // Category totals
          const categoryTotals: Record<string, { total: number; count: number; percentage: number }> = {};
          seasonExpenses.forEach((expense) => {
            if (!categoryTotals[expense.category]) {
              categoryTotals[expense.category] = { total: 0, count: 0, percentage: 0 };
            }
            categoryTotals[expense.category].total += expense.amount;
            categoryTotals[expense.category].count += 1;
          });
          
          Object.keys(categoryTotals).forEach((category) => {
            categoryTotals[category].percentage = (categoryTotals[category].total / totalExpenses) * 100;
          });
          
          // Monthly totals
          const monthlyTotals: Record<string, number> = {};
          seasonExpenses.forEach((expense) => {
            const month = format(new Date(expense.date), 'yyyy-MM');
            if (!monthlyTotals[month]) {
              monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += expense.amount;
          });
          
          // Payment method totals
          const paymentMethodTotals: Record<string, number> = {};
          seasonExpenses.forEach((expense) => {
            if (!paymentMethodTotals[expense.paymentMethod]) {
              paymentMethodTotals[expense.paymentMethod] = 0;
            }
            paymentMethodTotals[expense.paymentMethod] += expense.amount;
          });
          
          const summary: ExpenseSummary = {
            season,
            totalExpenses,
            totalReimbursed,
            netExpenses: totalExpenses - totalReimbursed,
            totalTaxDeductible,
            categoryTotals,
            monthlyTotals,
            paymentMethodTotals,
            expensesPerGame: 0,
            expensesPerMonth: Object.keys(monthlyTotals).length > 0 ? totalExpenses / Object.keys(monthlyTotals).length : 0,
            projectedYearTotal: Object.keys(monthlyTotals).length > 0 ? (totalExpenses / Object.keys(monthlyTotals).length) * 12 : 0,
          };
          
          // Calculate expenses per game
          const { gameStats } = get();
          const currentPlayer = get().currentPlayer;
          if (currentPlayer) {
            const playerGames = gameStats.filter(
              (game) => game.playerId === currentPlayer.id && game.date.includes(season.split('-')[0])
            );
            summary.expensesPerGame = playerGames.length > 0 ? totalExpenses / playerGames.length : 0;
          }
          
          set((state) => ({
            expenseSummaries: [
              ...state.expenseSummaries.filter((s) => s.season !== season),
              summary,
            ],
          }));
          
          return summary;
        },
        
        // Tournaments
        addTournament: (tournamentData) => {
          const tournament: Tournament = {
            ...tournamentData,
            id: generateId(),
          };
          
          set((state) => ({
            tournaments: [...state.tournaments, tournament],
          }));
        },
        
        updateTournament: (id, updates) => {
          set((state) => ({
            tournaments: state.tournaments.map((tournament) =>
              tournament.id === id ? { ...tournament, ...updates } : tournament
            ),
          }));
        },
        
        deleteTournament: (id) => {
          set((state) => ({
            tournaments: state.tournaments.filter((tournament) => tournament.id !== id),
          }));
        },
        
        // Milestones
        addMilestone: (milestoneData) => {
          const milestone: HockeyMilestone = {
            ...milestoneData,
            id: generateId(),
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            milestones: [...state.milestones, milestone],
          }));
        },
        
        updateMilestone: (id, updates) => {
          set((state) => ({
            milestones: state.milestones.map((milestone) =>
              milestone.id === id ? { ...milestone, ...updates } : milestone
            ),
          }));
        },
        
        deleteMilestone: (id) => {
          set((state) => ({
            milestones: state.milestones.filter((milestone) => milestone.id !== id),
          }));
        },
        
        checkForMilestones: (stats: GameStats) => {
          const milestones: HockeyMilestone[] = [];
          const { currentPlayer, gameStats } = get();
          
          if (!currentPlayer) return milestones;
          
          const playerStats = gameStats.filter(game => game.playerId === currentPlayer.id);
          const totalGoals = playerStats.reduce((sum, game) => sum + game.goals, 0) + stats.goals;
          const totalAssists = playerStats.reduce((sum, game) => sum + game.assists, 0) + stats.assists;
          const totalPoints = totalGoals + totalAssists;
          
          // Check for various milestones
          if (stats.goals >= 3) {
            milestones.push({
              id: generateId(),
              playerId: currentPlayer.id,
              type: 'Achievement',
              milestone: 'Hat Trick',
              description: `${stats.goals} goals in one game`,
              date: stats.date,
              gameId: stats.id,
              season: get().selectedSeason,
              isSpecial: true,
              createdAt: new Date().toISOString(),
            });
          }
          
          // First goal
          if (totalGoals === 1 && stats.goals === 1) {
            milestones.push({
              id: generateId(),
              playerId: currentPlayer.id,
              type: 'Goal',
              milestone: 'First Goal',
              description: 'First goal of hockey career',
              date: stats.date,
              gameId: stats.id,
              season: get().selectedSeason,
              isSpecial: true,
              createdAt: new Date().toISOString(),
            });
          }
          
          // Milestone goals (10, 25, 50, 100, etc.)
          const goalMilestones = [10, 25, 50, 75, 100, 150, 200];
          goalMilestones.forEach(milestone => {
            if (totalGoals >= milestone && (totalGoals - stats.goals) < milestone) {
              milestones.push({
                id: generateId(),
                playerId: currentPlayer.id,
                type: 'Goal',
                milestone: `${milestone} Goals`,
                description: `Reached ${milestone} career goals`,
                date: stats.date,
                gameId: stats.id,
                season: get().selectedSeason,
                isSpecial: milestone >= 50,
                createdAt: new Date().toISOString(),
              });
            }
          });
          
          // Milestone points (25, 50, 100, 200, etc.)
          const pointMilestones = [25, 50, 100, 150, 200, 300, 400, 500];
          pointMilestones.forEach(milestone => {
            if (totalPoints >= milestone && (totalPoints - stats.points) < milestone) {
              milestones.push({
                id: generateId(),
                playerId: currentPlayer.id,
                type: 'Point',
                milestone: `${milestone} Points`,
                description: `Reached ${milestone} career points`,
                date: stats.date,
                gameId: stats.id,
                season: get().selectedSeason,
                isSpecial: milestone >= 100,
                createdAt: new Date().toISOString(),
              });
            }
          });
          
          return milestones;
        },
        
        // UI Actions
        setSelectedSeason: (season) => {
          set({ selectedSeason: season });
        },
        
        setViewMode: (mode) => {
          set({ viewMode: mode });
        },
        
        // Data Management
        exportData: () => {
          const state = get();
          const exportData = {
            players: state.players,
            gameStats: state.gameStats,
            seasonStats: state.seasonStats,
            expenses: state.expenses,
            tournaments: state.tournaments,
            milestones: state.milestones,
            exportedAt: new Date().toISOString(),
          };
          return JSON.stringify(exportData, null, 2);
        },
        
        importData: (data) => {
          try {
            const importedData = JSON.parse(data);
            set({
              players: importedData.players || [],
              gameStats: importedData.gameStats || [],
              seasonStats: importedData.seasonStats || [],
              expenses: importedData.expenses || [],
              tournaments: importedData.tournaments || [],
              milestones: importedData.milestones || [],
            });
          } catch (error) {
            console.error('Failed to import data:', error);
          }
        },
        
        clearAllData: () => {
          set({
            players: [],
            currentPlayer: null,
            gameStats: [],
            seasonStats: [],
            expenses: [],
            expenseSummaries: [],
            tournaments: [],
            milestones: [],
          });
        },
      },
    }),
    {
      name: 'family-calendar-hockey-storage',
      version: 1,
    }
  )
);
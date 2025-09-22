export interface HockeyPlayer {
  id: string;
  name: string;
  jerseyNumber: number;
  position: 'Forward' | 'Defense' | 'Goalie';
  team: string;
  league: string;
  season: string;
  birthDate: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
}

export interface GameStats {
  id: string;
  playerId: string;
  gameId: string;
  date: string;
  opponent: string;
  gameType: 'Regular Season' | 'Playoff' | 'Tournament' | 'Exhibition' | 'Practice';
  location: 'Home' | 'Away';
  venue?: string;
  
  // Game Result
  teamScore: number;
  opponentScore: number;
  result: 'Win' | 'Loss' | 'Tie' | 'Overtime Win' | 'Overtime Loss' | 'Shootout Win' | 'Shootout Loss';
  
  // Player Stats
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  plusMinus: number;
  shotsOnGoal: number;
  faceoffWins?: number;
  faceoffLosses?: number;
  hits?: number;
  blockedShots?: number;
  
  // Goalie Stats (if applicable)
  saves?: number;
  shotsAgainst?: number;
  goalsAgainst?: number;
  savePercentage?: number;
  shutout?: boolean;
  minutesPlayed?: number;
  
  // Game Notes
  notes?: string;
  highlights?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SeasonStats {
  playerId: string;
  season: string;
  
  // Games
  gamesPlayed: number;
  
  // Scoring
  totalGoals: number;
  totalAssists: number;
  totalPoints: number;
  averagePointsPerGame: number;
  
  // Other Stats
  totalPenaltyMinutes: number;
  totalPlusMinus: number;
  totalShotsOnGoal: number;
  shootingPercentage: number;
  
  // Goalie Stats (if applicable)
  totalSaves?: number;
  totalShotsAgainst?: number;
  totalGoalsAgainst?: number;
  averageSavePercentage?: number;
  shutouts?: number;
  totalMinutesPlayed?: number;
  goalsAgainstAverage?: number;
  
  // Records
  longestGoalStreak: number;
  longestPointStreak: number;
  mostGoalsInGame: number;
  mostAssistsInGame: number;
  mostPointsInGame: number;
  
  // Team Record
  wins: number;
  losses: number;
  ties: number;
  overtimeWins: number;
  overtimeLosses: number;
  shootoutWins: number;
  shootoutLosses: number;
}

export interface HockeyExpense {
  id: string;
  playerId: string;
  category: 'Registration' | 'Equipment' | 'Travel' | 'Tournaments' | 'Training' | 'Ice Time' | 'Team Fees' | 'Food & Lodging' | 'Gas & Mileage' | 'Other';
  subcategory?: string;
  description: string;
  amount: number;
  date: string;
  paidBy: 'Player' | 'Parent' | 'Family' | 'Sponsor' | 'Team' | 'Other';
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit' | 'Check' | 'E-Transfer' | 'PayPal' | 'Other';
  vendor?: string;
  receipt?: string; // URL or file reference
  isRecurring: boolean;
  recurringFrequency?: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  season: string;
  isTaxDeductible: boolean;
  isReimbursed: boolean;
  reimbursedAmount?: number;
  notes?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  season: string;
  totalExpenses: number;
  totalReimbursed: number;
  netExpenses: number;
  totalTaxDeductible: number;
  
  categoryTotals: Record<string, {
    total: number;
    count: number;
    percentage: number;
  }>;
  
  monthlyTotals: Record<string, number>;
  paymentMethodTotals: Record<string, number>;
  
  expensesPerGame: number;
  expensesPerMonth: number;
  projectedYearTotal: number;
}

export interface Tournament {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  registrationFee: number;
  travelExpenses: number;
  lodgingExpenses: number;
  foodExpenses: number;
  otherExpenses: number;
  totalCost: number;
  placement?: number;
  totalTeams?: number;
  notes?: string;
  games: string[]; // Game IDs
}

export interface HockeyMilestone {
  id: string;
  playerId: string;
  type: 'Goal' | 'Assist' | 'Point' | 'Game' | 'Achievement';
  milestone: string; // e.g., "First Goal", "100th Point", "Hat Trick"
  description: string;
  date: string;
  gameId?: string;
  season: string;
  isSpecial: boolean;
  photos?: string[];
  videos?: string[];
  celebrationNotes?: string;
  createdAt: string;
}
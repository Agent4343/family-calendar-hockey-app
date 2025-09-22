'use client';

import React, { useState, useEffect } from 'react';
import { useHockeyStore } from '@/lib/hockey-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { HockeyNavigation } from '@/components/HockeyNavigation';
import { GameStats } from '@/types/hockey';

export default function HockeyStatsPage() {
  const {
    players,
    currentPlayer,
    gameStats,
    seasonStats,
    milestones,
    selectedSeason,
    actions
  } = useHockeyStore();

  const [showGameDialog, setShowGameDialog] = useState(false);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<GameStats | null>(null);
   const [gameForm, setGameForm] = useState<{
    date: string;
    opponent: string;
    gameType: GameStats['gameType'];
    location: GameStats['location'];
    venue: string;
    teamScore: number;
    opponentScore: number;
    goals: number;
    assists: number;
    penaltyMinutes: number;
    plusMinus: number;
    shotsOnGoal: number;
    notes: string;
  }>({
    date: '',
    opponent: '',
    gameType: 'Regular Season',
    location: 'Home',
    venue: '',
    teamScore: 0,
    opponentScore: 0,
    goals: 0,
    assists: 0,
    penaltyMinutes: 0,
    plusMinus: 0,
    shotsOnGoal: 0,
    notes: ''
  });

  const [playerForm, setPlayerForm] = useState<{
    name: string;
    jerseyNumber: number;
    position: 'Forward' | 'Defense' | 'Goalie';
    team: string;
    league: string;
    season: string;
    birthDate: string;
  }>({
    name: '',
    jerseyNumber: 0,
    position: 'Forward',
    team: 'AAA U15 Hitman',
    league: 'AAA Hockey',
    season: selectedSeason,
    birthDate: ''
  });

  // Get current player's stats for selected season
  const currentSeasonStats = seasonStats.find(
    stats => stats.playerId === currentPlayer?.id && stats.season === selectedSeason
  );

  const currentPlayerGames = gameStats
    .filter(game => game.playerId === currentPlayer?.id && game.date.includes(selectedSeason.split('-')[0]))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const playerMilestones = milestones
    .filter(milestone => milestone.playerId === currentPlayer?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (currentPlayer && currentPlayerGames.length > 0) {
      actions.calculateSeasonStats(currentPlayer.id, selectedSeason);
    }
  }, [currentPlayer, selectedSeason, gameStats.length]);

  const handleAddGame = () => {
    if (!currentPlayer) return;

     const result: GameStats['result'] = gameForm.teamScore > gameForm.opponentScore ? 'Win' : 
                                       gameForm.teamScore < gameForm.opponentScore ? 'Loss' : 'Tie';

    const newGame = {
      playerId: currentPlayer.id,
      gameId: `game_${Date.now()}`,
      ...gameForm,
      result,
      points: gameForm.goals + gameForm.assists
    };

    if (editingGame) {
      actions.updateGameStats(editingGame.id, newGame);
    } else {
      actions.addGameStats(newGame);
    }

    // Reset form
    setGameForm({
      date: '',
      opponent: '',
      gameType: 'Regular Season',
      location: 'Home',
      venue: '',
      teamScore: 0,
      opponentScore: 0,
      goals: 0,
      assists: 0,
      penaltyMinutes: 0,
      plusMinus: 0,
      shotsOnGoal: 0,
      notes: ''
    });
    setEditingGame(null);
    setShowGameDialog(false);
  };

   const handleAddPlayer = () => {
    actions.addPlayer({
      ...playerForm,
      isActive: true
    });
    setPlayerForm({
      name: '',
      jerseyNumber: 0,
      position: 'Forward',
      team: 'AAA U15 Hitman',
      league: 'AAA Hockey',
      season: selectedSeason,
      birthDate: ''
    });
    setShowPlayerDialog(false);
  };

  const handleEditGame = (game: GameStats) => {
    setEditingGame(game);
    setGameForm({
      date: game.date,
      opponent: game.opponent,
      gameType: game.gameType,
      location: game.location,
      venue: game.venue || '',
      teamScore: game.teamScore,
      opponentScore: game.opponentScore,
      goals: game.goals,
      assists: game.assists,
      penaltyMinutes: game.penaltyMinutes,
      plusMinus: game.plusMinus,
      shotsOnGoal: game.shotsOnGoal,
      notes: game.notes || ''
    });
    setShowGameDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                🏒 Hockey Stats
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track game stats, goals, assists, and achievements
              </p>
            </div>

            <div className="flex items-center gap-3">
              <HockeyNavigation currentPage="stats" />
              
              <Select
                value={currentPlayer?.id || ''}
                onValueChange={(value) => {
                  const player = players.find(p => p.id === value);
                  actions.setCurrentPlayer(player || null);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jerseyNumber} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSeason}
                onValueChange={actions.setSelectedSeason}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-25</SelectItem>
                  <SelectItem value="2023-2024">2023-24</SelectItem>
                  <SelectItem value="2022-2023">2022-23</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => setShowPlayerDialog(true)} variant="outline" size="sm" className="hidden md:flex">
                Add Player
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6 pb-20 md:pb-4">
        {!currentPlayer ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="text-6xl">🏒</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to Hockey Stats!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Add your first player to start tracking goals, assists, points, and hockey achievements.
                </p>
                <Button onClick={() => setShowPlayerDialog(true)} className="mt-4">
                  Add Your First Player
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="games">Games</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Player Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      #{currentPlayer.jerseyNumber}
                    </div>
                    <div>
                      <div className="text-xl font-bold">{currentPlayer.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {currentPlayer.position} • {currentPlayer.team} • {selectedSeason}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Season Stats */}
              {currentSeasonStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {currentSeasonStats.gamesPlayed}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Games Played</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {currentSeasonStats.totalGoals}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Goals</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {currentSeasonStats.totalAssists}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Assists</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {currentSeasonStats.totalPoints}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {currentSeasonStats.averagePointsPerGame.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">PPG</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {currentSeasonStats.totalPlusMinus > 0 ? '+' : ''}{currentSeasonStats.totalPlusMinus}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">+/-</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button onClick={() => setShowGameDialog(true)} className="flex-1 md:flex-none">
                  Add Game Stats
                </Button>
                <Button variant="outline" className="flex-1 md:flex-none">
                  Export Stats
                </Button>
              </div>
            </TabsContent>

            {/* Games Tab */}
            <TabsContent value="games" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Game Log</h2>
                <Button onClick={() => setShowGameDialog(true)}>
                  Add Game
                </Button>
              </div>

              <div className="space-y-3">
                {currentPlayerGames.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-4xl mb-4">🏒</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No games recorded yet. Add your first game to get started!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  currentPlayerGames.map((game, index) => (
                    <Card key={game.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4" onClick={() => handleEditGame(game)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">
                              Game #{currentPlayerGames.length - index}
                            </div>
                            <div className="font-semibold">
                              vs {game.opponent}
                            </div>
                            <Badge variant={
                              game.result === 'Win' || game.result === 'Overtime Win' || game.result === 'Shootout Win' 
                                ? 'default' 
                                : game.result === 'Tie' 
                                ? 'secondary' 
                                : 'destructive'
                            }>
                              {game.result}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {game.teamScore} - {game.opponentScore}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(game.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="font-semibold text-green-600">{game.goals}</div>
                            <div className="text-xs text-gray-500">Goals</div>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-600">{game.assists}</div>
                            <div className="text-xs text-gray-500">Assists</div>
                          </div>
                          <div>
                            <div className="font-semibold text-orange-600">{game.points}</div>
                            <div className="text-xs text-gray-500">Points</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-600">{game.penaltyMinutes}</div>
                            <div className="text-xs text-gray-500">PIM</div>
                          </div>
                        </div>
                        
                        {game.notes && (
                          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            {game.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="space-y-6">
              <h2 className="text-xl font-semibold">Achievements & Milestones</h2>
              
              <div className="space-y-3">
                {playerMilestones.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-4xl mb-4">🏆</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No milestones yet. Keep playing to unlock achievements!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  playerMilestones.map((milestone) => (
                    <Card key={milestone.id} className={milestone.isSpecial ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">
                            {milestone.isSpecial ? '🏆' : milestone.type === 'Goal' ? '⚽' : milestone.type === 'Assist' ? '🎯' : '🎉'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{milestone.milestone}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{milestone.description}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(milestone.date).toLocaleDateString()} • {milestone.season}
                            </p>
                          </div>
                          {milestone.isSpecial && (
                            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                              Special Achievement
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Detailed Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              {currentSeasonStats && (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Season Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Scoring</h4>
                          <div className="space-y-1 text-sm">
                            <div>Goals: {currentSeasonStats.totalGoals}</div>
                            <div>Assists: {currentSeasonStats.totalAssists}</div>
                            <div>Points: {currentSeasonStats.totalPoints}</div>
                            <div>PPG: {currentSeasonStats.averagePointsPerGame.toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Game Records</h4>
                          <div className="space-y-1 text-sm">
                            <div>Most Goals: {currentSeasonStats.mostGoalsInGame}</div>
                            <div>Most Assists: {currentSeasonStats.mostAssistsInGame}</div>
                            <div>Most Points: {currentSeasonStats.mostPointsInGame}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Streaks</h4>
                          <div className="space-y-1 text-sm">
                            <div>Goal Streak: {currentSeasonStats.longestGoalStreak}</div>
                            <div>Point Streak: {currentSeasonStats.longestPointStreak}</div>
                            <div>Shooting %: {currentSeasonStats.shootingPercentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Team Record</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="text-2xl font-bold text-green-600">{currentSeasonStats.wins}</div>
                          <div className="text-sm">Wins</div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="text-2xl font-bold text-red-600">{currentSeasonStats.losses}</div>
                          <div className="text-sm">Losses</div>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <div className="text-2xl font-bold text-yellow-600">{currentSeasonStats.overtimeWins + currentSeasonStats.overtimeLosses}</div>
                          <div className="text-sm">Overtime</div>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="text-2xl font-bold text-blue-600">
                            {currentSeasonStats.gamesPlayed > 0 
                              ? ((currentSeasonStats.wins / currentSeasonStats.gamesPlayed) * 100).toFixed(1)
                              : 0}%
                          </div>
                          <div className="text-sm">Win Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Game Stats Dialog */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGame ? 'Edit Game Stats' : 'Add Game Stats'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={gameForm.date}
                  onChange={(e) => setGameForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Opponent</Label>
                <Input
                  value={gameForm.opponent}
                  onChange={(e) => setGameForm(prev => ({ ...prev, opponent: e.target.value }))}
                  placeholder="Team name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Game Type</Label>
                <Select
                  value={gameForm.gameType}
                  onValueChange={(value: any) => setGameForm(prev => ({ ...prev, gameType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular Season">Regular Season</SelectItem>
                    <SelectItem value="Playoff">Playoff</SelectItem>
                    <SelectItem value="Tournament">Tournament</SelectItem>
                    <SelectItem value="Exhibition">Exhibition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select
                  value={gameForm.location}
                  onValueChange={(value: any) => setGameForm(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="Away">Away</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Venue (Optional)</Label>
              <Input
                value={gameForm.venue}
                onChange={(e) => setGameForm(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Arena name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Team Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.teamScore}
                  onChange={(e) => setGameForm(prev => ({ ...prev, teamScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Opponent Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.opponentScore}
                  onChange={(e) => setGameForm(prev => ({ ...prev, opponentScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Separator />

            <h3 className="font-semibold">Player Stats</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Goals</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.goals}
                  onChange={(e) => setGameForm(prev => ({ ...prev, goals: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Assists</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.assists}
                  onChange={(e) => setGameForm(prev => ({ ...prev, assists: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Penalty Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.penaltyMinutes}
                  onChange={(e) => setGameForm(prev => ({ ...prev, penaltyMinutes: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>+/-</Label>
                <Input
                  type="number"
                  value={gameForm.plusMinus}
                  onChange={(e) => setGameForm(prev => ({ ...prev, plusMinus: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label>Shots on Goal</Label>
              <Input
                type="number"
                min="0"
                value={gameForm.shotsOnGoal}
                onChange={(e) => setGameForm(prev => ({ ...prev, shotsOnGoal: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label>Game Notes (Optional)</Label>
              <Textarea
                value={gameForm.notes}
                onChange={(e) => setGameForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any highlights, notes, or observations from the game..."
              />
            </div>

            {gameForm.goals + gameForm.assists > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="font-semibold text-blue-900 dark:text-blue-100">
                  Points this game: {gameForm.goals + gameForm.assists}
                </div>
                {gameForm.goals >= 3 && (
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    🎉 Hat Trick! This will be recorded as a special achievement.
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGame}>
              {editingGame ? 'Update Game' : 'Add Game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Player Name</Label>
              <Input
                value={playerForm.name}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter player name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Jersey Number</Label>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={playerForm.jerseyNumber}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, jerseyNumber: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Position</Label>
                <Select
                  value={playerForm.position}
                  onValueChange={(value: any) => setPlayerForm(prev => ({ ...prev, position: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Forward">Forward</SelectItem>
                    <SelectItem value="Defense">Defense</SelectItem>
                    <SelectItem value="Goalie">Goalie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Team</Label>
              <Input
                value={playerForm.team}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, team: e.target.value }))}
                placeholder="Team name"
              />
            </div>

            <div>
              <Label>League</Label>
              <Input
                value={playerForm.league}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, league: e.target.value }))}
                placeholder="League name"
              />
            </div>

            <div>
              <Label>Birth Date</Label>
              <Input
                type="date"
                value={playerForm.birthDate}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, birthDate: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlayerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>
              Add Player
            </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hockey Navigation for Mobile */}
      <HockeyNavigation currentPage="stats" />
    </div>
  );
}
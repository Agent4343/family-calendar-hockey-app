'use client';

import React, { useState } from 'react';
import { useHockeyStore } from '@/lib/hockey-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface QuickStatsButtonsProps {
  currentGameStats?: {
    goals: number;
    assists: number;
    penaltyMinutes: number;
    shotsOnGoal: number;
    plusMinus: number;
  };
  onStatsUpdate?: (stats: any) => void;
}

export function QuickStatsButtons({ currentGameStats, onStatsUpdate }: QuickStatsButtonsProps) {
  const { currentPlayer, actions } = useHockeyStore();
  const [showQuickGame, setShowQuickGame] = useState(false);
  const [gameForm, setGameForm] = useState({
    opponent: '',
    date: new Date().toISOString().split('T')[0],
    teamScore: 0,
    opponentScore: 0,
    goals: currentGameStats?.goals || 0,
    assists: currentGameStats?.assists || 0,
    penaltyMinutes: currentGameStats?.penaltyMinutes || 0,
    shotsOnGoal: currentGameStats?.shotsOnGoal || 0,
    plusMinus: currentGameStats?.plusMinus || 0
  });

  const updateQuickStat = (stat: string, value: number) => {
    setGameForm(prev => ({
      ...prev,
      [stat]: Math.max(0, prev[stat as keyof typeof prev] + value)
    }));

    if (onStatsUpdate) {
      const updatedStats = {
        ...gameForm,
        [stat]: Math.max(0, gameForm[stat as keyof typeof gameForm] + value)
      };
      onStatsUpdate(updatedStats);
    }
  };

  const saveQuickGame = async () => {
    if (!currentPlayer || !gameForm.opponent) return;

    const result = gameForm.teamScore > gameForm.opponentScore ? 'Win' : 
                   gameForm.teamScore < gameForm.opponentScore ? 'Loss' : 'Tie';

    const gameData = {
      playerId: currentPlayer.id,
      gameId: `quick_game_${Date.now()}`,
      date: gameForm.date,
      opponent: gameForm.opponent,
      gameType: 'Regular Season' as const,
      location: 'Home' as const,
      venue: '',
      teamScore: gameForm.teamScore,
      opponentScore: gameForm.opponentScore,
      result,
      goals: gameForm.goals,
      assists: gameForm.assists,
      points: gameForm.goals + gameForm.assists,
      penaltyMinutes: gameForm.penaltyMinutes,
      plusMinus: gameForm.plusMinus,
      shotsOnGoal: gameForm.shotsOnGoal,
      notes: 'Added via Quick Stats'
    };

    // Save locally
    actions.addGameStats(gameData);

    // Auto-update to GitHub (optional)
    try {
      await fetch('/api/auto-update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerStats: gameForm,
          gameData: gameData,
          githubToken: localStorage.getItem('github-auto-update-token'),
          repositoryName: 'Agent4343/family-hockey-calendar-2024'
        })
      });
    } catch (error) {
      console.error('Auto-update failed:', error);
    }

    // Reset form
    setGameForm({
      opponent: '',
      date: new Date().toISOString().split('T')[0],
      teamScore: 0,
      opponentScore: 0,
      goals: 0,
      assists: 0,
      penaltyMinutes: 0,
      shotsOnGoal: 0,
      plusMinus: 0
    });

    setShowQuickGame(false);

    // Show success message
    if (typeof window !== 'undefined') {
      alert(`Game stats saved! ${gameForm.goals}G + ${gameForm.assists}A = ${gameForm.goals + gameForm.assists} points vs ${gameForm.opponent}`);
    }
  };

  if (!currentPlayer) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">Select a player to use Quick Stats</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>⚡ Quick Stats</span>
            <Badge variant="secondary">
              {gameForm.goals + gameForm.assists} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Stats Display */}
          <div className="grid grid-cols-5 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{gameForm.goals}</div>
              <div className="text-xs text-gray-600">Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{gameForm.assists}</div>
              <div className="text-xs text-gray-600">Assists</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{gameForm.goals + gameForm.assists}</div>
              <div className="text-xs text-gray-600">Points</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{gameForm.penaltyMinutes}</div>
              <div className="text-xs text-gray-600">PIM</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{gameForm.shotsOnGoal}</div>
              <div className="text-xs text-gray-600">Shots</div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => updateQuickStat('goals', 1)}
              className="bg-green-600 hover:bg-green-700 h-16"
            >
              <div className="text-center">
                <div className="text-xl">⚽</div>
                <div className="text-sm">+Goal</div>
              </div>
            </Button>

            <Button
              onClick={() => updateQuickStat('assists', 1)}
              className="bg-blue-600 hover:bg-blue-700 h-16"
            >
              <div className="text-center">
                <div className="text-xl">🦯</div>
                <div className="text-sm">+Assist</div>
              </div>
            </Button>

            <Button
              onClick={() => updateQuickStat('penaltyMinutes', 2)}
              className="bg-yellow-600 hover:bg-yellow-700 h-16"
            >
              <div className="text-center">
                <div className="text-xl">Ⅰ️</div>
                <div className="text-sm">+2 PIM</div>
              </div>
            </Button>

            <Button
              onClick={() => updateQuickStat('shotsOnGoal', 1)}
              className="bg-purple-600 hover:bg-purple-700 h-16"
            >
              <div className="text-center">
                <div className="text-xl">🦥</div>
                <div className="text-sm">+Shot</div>
              </div>
            </Button>
          </div>

          {/* Undo Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => updateQuickStat('goals', -1)}
              variant="outline"
              size="sm"
              disabled={gameForm.goals === 0}
            >
              ↆ Goal
            </Button>
            <Button
              onClick={() => updateQuickStat('assists', -1)}
              variant="outline"
              size="sm"
              disabled={gameForm.assists === 0}
            >
              ↆ Assist
            </Button>
            <Button
              onClick={() => updateQuickStat('penaltyMinutes', -2)}
              variant="outline"
              size="sm"
              disabled={gameForm.penaltyMinutes === 0}
            >
              ↆ PIM
            </Button>
            <Button
              onClick={() => updateQuickStat('shotsOnGoal', -1)}
              variant="outline"
              size="sm"
              disabled={gameForm.shotsOnGoal === 0}
            >
              ↖ Shot
            </Button>
          </div>

          {/* Save Game Button */}
          <Button
            onClick={() => setShowQuickGame(true)}
            className="w-full h-12 text-lg"
            disabled={gameForm.goals + gameForm.assists + gameForm.penaltyMinutes + gameForm.shotsOnGoal === 0}
          >
            💾 Save as Game Stats
          </Button>

          {/* Achievement Notifications */}
          {gameForm.goals >= 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
              <div className="text-xl">🎉</div>
              <div className="font-bold text-yellow-800">Hat Trick Achievement!</div>
              <div className="text-sm text-yellow-700">{gameForm.goals} goals in this game!</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Game Save Dialog */}
      <Dialog open={showQuickGame} onOpenChange={setShowQuickGame}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Game Stats</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Opponent</Label>
              <Input
                value={gameForm.opponent}
                onChange={(e) => setGameForm(prev => ({ ...prev, opponent: e.target.value }))}
                placeholder="Team name"
              />
            </div>

            <div>
              <Label>Game Date</Label>
              <Input
                type="date"
                value={gameForm.date}
                onChange={(e) => setGameForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Our Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.teamScore}
                  onChange={(e) => setGameForm(prev => ({ ...prev, teamScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Their Score</Label>
                <Input
                  type="number"
                  min="0"
                  value={gameForm.opponentScore}
                  onChange={(e) => setGameForm(prev => ({ ...prev, opponentScore: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold mb-2">Your Stats This Game:</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>Goals: <strong>{gameForm.goals}</strong></div>
                <div>Assists: <strong>{gameForm.assists}</strong></div>
                <div>Points: <strong>{gameForm.goals + gameForm.assists}</strong></div>
                <div>PIM: <strong>{gameForm.penaltyMinutes}</strong></div>
                <div>Shots: <strong>{gameForm.shotsOnGoal}</strong></div>
                <div>+-/: <strong>{gameForm.plusMinus}</strong></div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickGame(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuickGame} disabled={!gameForm.opponent}>
              Save Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
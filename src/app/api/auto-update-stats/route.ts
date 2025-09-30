import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { playerStats, gameData, githubToken, repositoryName } = await request.json();

    // Validate required fields
    if (!playerStats || !gameData) {
      return NextResponse.json(
        { error: 'Missing playerStats or gameData' },
        { status: 400 }
      );
    }

    console.log('Auto-updating stats:', {
      playerStats,
      gameData,
      timestamp: new Date().toISOString()
    });

    // If GitHub token provided, auto-update repository
    if (githubToken && repositoryName) {
      try {
        const updateResult = await updateGitHubStats(
          playerStats, 
          gameData, 
          githubToken, 
          repositoryName
        );
        
        return NextResponse.json({
          success: true,
          message: 'Stats updated successfully',
          localUpdate: true,
          githubUpdate: updateResult.success,
          githubCommit: updateResult.commitSha || null,
          statsData: {
            goals: playerStats.goals,
            assists: playerStats.assists,
            points: playerStats.goals + playerStats.assists,
            penaltyMinutes: playerStats.penaltyMinutes,
            shotsOnGoal: playerStats.shotsOnGoal,
            plusMinus: playerStats.plusMinus
          }
        });
      } catch (githubError) {
        console.error('GitHub update failed:', githubError);
        
        return NextResponse.json({
          success: true,
          message: 'Stats updated locally (GitHub update failed)',
          localUpdate: true,
          githubUpdate: false,
          error: 'GitHub update failed but local stats saved',
          statsData: {
            goals: playerStats.goals,
            assists: playerStats.assists,
            points: playerStats.goals + playerStats.assists,
            penaltyMinutes: playerStats.penaltyMinutes,
            shotsOnGoal: playerStats.shotsOnGoal,
            plusMinus: playerStats.plusMinus
          }
        });
      }
    }

    // Local update only
    return NextResponse.json({
      success: true,
      message: 'Stats updated locally',
      localUpdate: true,
      githubUpdate: false,
      statsData: {
        goals: playerStats.goals,
        assists: playerStats.assists,
        points: playerStats.goals + playerStats.assists,
        penaltyMinutes: playerStats.penaltyMinutes,
        shotsOnGoal: playerStats.shotsOnGoal,
        plusMinus: playerStats.plusMinus
      }
    });

  } catch (error) {
    console.error('Auto-update stats error:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}

// Function to update GitHub repository with new stats
async function updateGitHubStats(
  playerStats: any,
  gameData: any,
  githubToken: string,
  repositoryName: string
): Promise<{ success: boolean; commitSha?: string }> {
  try {
    // Create a stats summary file
    const statsUpdate = {
      timestamp: new Date().toISOString(),
      gameDate: gameData.date || new Date().toISOString().split('T')[0],
      opponent: gameData.opponent,
      playerStats: {
        goals: playerStats.goals,
        assists: playerStats.assists,
        points: playerStats.goals + playerStats.assists,
        penaltyMinutes: playerStats.penaltyMinutes,
        shotsOnGoal: playerStats.shotsOnGoal,
        plusMinus: playerStats.plusMinus
      },
      gameResult: {
        teamScore: gameData.teamScore,
        opponentScore: gameData.opponentScore,
        result: gameData.teamScore > gameData.opponentScore ? 'Win' : 
                gameData.teamScore < gameData.opponentScore ? 'Loss' : 'Tie'
      }
    };

    // Create stats file content
    const statsContent = `# 🏒 Hockey Stats Update - ${new Date().toLocaleDateString()}

## Game Summary
- **Date:** ${gameData.date || new Date().toISOString().split('T')[0]}
- **Opponent:** ${gameData.opponent}
- **Score:** ${gameData.teamScore} - ${gameData.opponentScore}
- **Result:** ${statsUpdate.gameResult.result}

## Player Performance
- **Goals:** ${playerStats.goals}
- **Assists:** ${playerStats.assists}
- **Points:** ${playerStats.goals + playerStats.assists}
- **Penalty Minutes:** ${playerStats.penaltyMinutes}
- **Shots on Goal:** ${playerStats.shotsOnGoal}
- **Plus/Minus:** ${playerStats.plusMinus}

## Achievements
${playerStats.goals >= 3 ? '🎉 💩 **HAT TRICK ACHIEVED!**' : ''}
${playerStats.goals + playerStats.assists >= 4 ? '🍟 **MULTI-POINT GAME!**' : ''}

Updated automatically via Family Calendar + Hockey App
Timestamp: ${new Date().toISOString()}
`;

    // Base64 encode the content
    const encodedContent = Buffer.from(statsContent).toString('base64');
    
    // Create filename with timestamp
    const filename = `hockey-stats-${new Date().toISOString().split('T')[0]}-${Date.now()}.md`;

    // Update GitHub repository
    const response = await fetch(`https://api.github.com/repos/${repositoryName}/contents/stats-updates/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `🏒 Auto-update: ${playerStats.goals}G + ${playerStats.assists}A vs ${gameData.opponent}`,
        content: encodedContent,
        committer: {
          name: 'Hockey Stats Auto-Update',
          email: 'hockey-stats@family-calendar-app.com'
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, commitSha: result.commit.sha };
    } else {
      console.error('GitHub API error:', await response.text());
      return { success: false };
    }

  } catch (error) {
    console.error('GitHub update error:', error);
    return { success: false };
  }
}

// Get current auto-update settings
export async function GET() {
  return NextResponse.json({
    features: {
      autoUpdate: 'Available',
      githubIntegration: 'Supported',
      realTimeTracking: 'Enabled'
    },
    instructions: {
      title: 'Auto-Update Hockey Stats',
      description: 'Automatically update your GitHub repository with hockey statistics',
      setup: [
        '1. Enable auto-update in hockey stats settings',
        '2. Provide GitHub token for repository access',
        '3. Specify repository name for updates',
        '4. Use Quick Stats buttons for one-tap updates',
        '5. Stats automatically saved locally and to GitHub'
      ],
      benefits: [
        '✅ One-tap stat updates during games',
        '✅ Automatic GitHub repository updates',
        '✅ Real-time achievement detection',
        '✅ Backup stats to version control',
        '✅ Share stats with family and coaches'
      ]
    }
  });
}

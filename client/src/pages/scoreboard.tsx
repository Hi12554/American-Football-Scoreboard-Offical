import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScoreboardDisplay } from "@/components/scoreboard-display";
import { ControlPanel } from "@/components/control-panel";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GameState, UpdateGameState } from "@shared/schema";
import { Loader2, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Scoreboard() {
  const [localTime, setLocalTime] = useState<number | null>(null);
  const [scoreAnimating, setScoreAnimating] = useState<{
    home: boolean;
    away: boolean;
  }>({ home: false, away: false });
  const [touchdownAnimation, setTouchdownAnimation] = useState<{
    active: boolean;
    team: "home" | "away" | null;
  }>({ active: false, team: null });
  const [fieldGoalAnimation, setFieldGoalAnimation] = useState<{
    active: boolean;
    team: "home" | "away" | null;
  }>({ active: false, team: null });
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: ["/api/game-state"],
    refetchInterval: 5000,
  });

  const updateStateMutation = useMutation({
    mutationFn: async (updates: UpdateGameState) => {
      const res = await apiRequest("PATCH", "/api/game-state", updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
  });

  const resetGameMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/game-state/reset", {});
      return await res.json();
    },
    onSuccess: () => {
      setLocalTime(null);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state"] });
    },
  });

  useEffect(() => {
    if (gameState && localTime === null) {
      setLocalTime(gameState.timeRemaining);
    }
  }, [gameState, localTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState?.isClockRunning && localTime !== null && localTime > 0) {
      interval = setInterval(() => {
        setLocalTime((prev) => {
          if (prev === null || prev <= 0) return 0;
          const newTime = prev - 1;

          // Update server every second
          updateStateMutation.mutate({ 
            timeRemaining: newTime,
            isClockRunning: newTime > 0 ? gameState.isClockRunning : false
          });

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState?.isClockRunning, localTime]);

  const updateScore = (team: "home" | "away", points: number) => {
    if (!gameState) return;

    const currentTeam = team === "home" ? gameState.homeTeam : gameState.awayTeam;
    const newScore = Math.max(0, currentTeam.score + points);

    updateStateMutation.mutate({
      [team === "home" ? "homeTeam" : "awayTeam"]: {
        ...currentTeam,
        score: newScore,
      },
    });

    setScoreAnimating((prev) => ({
      ...prev,
      [team]: true,
    }));

    // Trigger field goal animation for 3 points
    if (points === 3) {
      setFieldGoalAnimation({ active: true, team });
      setTimeout(() => {
        setFieldGoalAnimation({ active: false, team: null });
      }, 3500);
    }

    // Trigger touchdown animation for 6 or 7 points
    if (points === 6 || points === 7) {
      setTouchdownAnimation({ active: true, team });
      setTimeout(() => {
        setTouchdownAnimation({ active: false, team: null });
      }, 4000);
    }

    setTimeout(() => {
      setScoreAnimating((prev) => ({
        ...prev,
        [team]: false,
      }));
    }, 400);
  };

  const updateTeam = (team: "home" | "away", updates: Partial<GameState["homeTeam"]>) => {
    if (!gameState) return;

    const currentTeam = team === "home" ? gameState.homeTeam : gameState.awayTeam;

    updateStateMutation.mutate({
      [team === "home" ? "homeTeam" : "awayTeam"]: {
        ...currentTeam,
        ...updates,
      },
    });
  };

  const toggleClock = () => {
    if (!gameState) return;

    const newRunningState = !gameState.isClockRunning;
    updateStateMutation.mutate({ 
      isClockRunning: newRunningState,
      timeRemaining: localTime ?? gameState.timeRemaining
    });
  };

  const resetClock = () => {
    setLocalTime(900);
    updateStateMutation.mutate({ 
      timeRemaining: 900,
      isClockRunning: false
    });
  };

  const updateTime = (seconds: number) => {
    if (!gameState) return;

    const currentTime = localTime ?? gameState.timeRemaining;
    const newTime = Math.max(0, currentTime + seconds);

    setLocalTime(newTime);
    updateStateMutation.mutate({ 
      timeRemaining: newTime
    });
  };

  const setQuarter = (quarter: 1 | 2 | 3 | 4 | "OT") => {
    updateStateMutation.mutate({ quarter });
  };

  const togglePossession = () => {
    if (!gameState) return;

    const newPossession = 
      gameState.possession === "home" ? "away" : 
      gameState.possession === "away" ? null : 
      "home";

    updateStateMutation.mutate({ possession: newPossession });
  };

  const handleSetPossession = async (team: "home" | "away" | null) => {
    await updateStateMutation.mutateAsync({ possession: team });
  };

  const setDown = (down: 1 | 2 | 3 | 4) => {
    updateStateMutation.mutate({ down });
  };

  const updateYardsToGo = (change: number) => {
    if (!gameState) return;

    const newYards = Math.max(0, Math.min(99, gameState.yardsToGo + change));
    updateStateMutation.mutate({ yardsToGo: newYards });
  };

  const setYardsToGo = (yards: number) => {
    updateStateMutation.mutate({ yardsToGo: yards });
  };

  const updateFieldPosition = (change: number) => {
    if (!gameState) return;

    const newPosition = Math.max(0, Math.min(100, gameState.fieldPosition + change));

    // Determine which side of the field based on position
    // 0-49: home side, 50: midfield, 51-100: away side
    const ballOn = newPosition < 50 ? "home" : "away";

    updateStateMutation.mutate({ 
      fieldPosition: newPosition,
      ballOn: ballOn
    });
  };

  const setFieldPosition = (yardLine: number, side: "home" | "away") => {
    // Convert yard line (1-50) and side to field position (0-100)
    let fieldPosition: number;

    if (yardLine === 50) {
      // 50 yard line is always position 50
      fieldPosition = 50;
    } else if (side === "home") {
      // Home side: yard line maps directly to field position
      fieldPosition = yardLine;
    } else {
      // Away side: convert (e.g., away 25 = position 75)
      fieldPosition = 100 - yardLine;
    }

    updateStateMutation.mutate({ 
      fieldPosition,
      ballOn: side
    });
  };

  const resetGame = () => {
    resetGameMutation.mutate();
  };

  const setFlag = (team: "home" | "away", type: string) => {
    updateStateMutation.mutate({ 
      activeFlag: { team, type }
    });
  };

  const clearFlag = useCallback(() => {
    updateStateMutation.mutate({ activeFlag: null });
  }, []);

  const finalizeGame = useCallback(() => {
    if (!gameState) return;

    if (gameState.isFinal) {
      // Unfinal the game - revert records
      const parseRecord = (record: string) => {
        const match = record.match(/^(\d+)-(\d+)$/);
        if (!match) return { wins: 0, losses: 0 };
        return { wins: parseInt(match[1]), losses: parseInt(match[2]) };
      };

      const homeRecord = parseRecord(gameState.homeTeam.record);
      const awayRecord = parseRecord(gameState.awayTeam.record);

      // Revert winner and update records
      let newHomeRecord = gameState.homeTeam.record;
      let newAwayRecord = gameState.awayTeam.record;

      if (gameState.homeTeam.score > gameState.awayTeam.score) {
        // Home team won - subtract the win/loss
        newHomeRecord = `${homeRecord.wins - 1}-${homeRecord.losses}`;
        newAwayRecord = `${awayRecord.wins}-${awayRecord.losses - 1}`;
      } else if (gameState.awayTeam.score > gameState.homeTeam.score) {
        // Away team won - subtract the win/loss
        newHomeRecord = `${homeRecord.wins}-${homeRecord.losses - 1}`;
        newAwayRecord = `${awayRecord.wins - 1}-${awayRecord.losses}`;
      }

      updateStateMutation.mutate({
        isFinal: false,
        homeTeam: {
          ...gameState.homeTeam,
          record: newHomeRecord,
        },
        awayTeam: {
          ...gameState.awayTeam,
          record: newAwayRecord,
        },
      });
    } else {
      // Finalize the game
      const parseRecord = (record: string) => {
        const match = record.match(/^(\d+)-(\d+)$/);
        if (!match) return { wins: 0, losses: 0 };
        return { wins: parseInt(match[1]), losses: parseInt(match[2]) };
      };

      const homeRecord = parseRecord(gameState.homeTeam.record);
      const awayRecord = parseRecord(gameState.awayTeam.record);

      // Determine winner and update records
      let newHomeRecord = gameState.homeTeam.record;
      let newAwayRecord = gameState.awayTeam.record;

      if (gameState.homeTeam.score > gameState.awayTeam.score) {
        // Home team wins
        newHomeRecord = `${homeRecord.wins + 1}-${homeRecord.losses}`;
        newAwayRecord = `${awayRecord.wins}-${awayRecord.losses + 1}`;
      } else if (gameState.awayTeam.score > gameState.homeTeam.score) {
        // Away team wins
        newHomeRecord = `${homeRecord.wins}-${homeRecord.losses + 1}`;
        newAwayRecord = `${awayRecord.wins + 1}-${awayRecord.losses}`;
      }
      // If tie, records stay the same

      // Update game state with final status and new records
      updateStateMutation.mutate({
        isFinal: true,
        isClockRunning: false,
        homeTeam: {
          ...gameState.homeTeam,
          record: newHomeRecord,
        },
        awayTeam: {
          ...gameState.awayTeam,
          record: newAwayRecord,
        },
      });
    }
  }, [gameState]);

  const copyOverlayLink = useCallback(() => {
    const overlayUrl = `${window.location.origin}/overlay`;
    try {
      navigator.clipboard.writeText(overlayUrl);
      setLinkCopied(true);
      toast({
        title: "Overlay link copied!",
        description: "Paste this URL in your streaming software as a browser source.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually from your browser.",
        variant: "destructive",
      });
    }
  }, []);

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-display font-semibold text-muted-foreground">
            Loading Scoreboard...
          </p>
        </div>
      </div>
    );
  }

  const displayState: GameState = {
    ...gameState,
    timeRemaining: localTime ?? gameState.timeRemaining,
  };

  return (
    <div className="min-h-screen bg-background">
      <div 
        className="min-h-screen bg-gradient-to-b from-background via-background to-card/30"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at top, hsl(var(--primary) / 0.05) 0%, transparent 50%),
            repeating-linear-gradient(90deg, transparent, transparent 49px, hsl(var(--primary) / 0.03) 49px, hsl(var(--primary) / 0.03) 50px)
          `,
        }}
      >
        <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
          <div className="flex justify-end mb-4">
            <Button
              onClick={copyOverlayLink}
              variant="outline"
              className="gap-2 font-display font-semibold"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Copy Overlay Link for Streaming
                </>
              )}
            </Button>
          </div>

          <ScoreboardDisplay 
            gameState={displayState} 
            scoreAnimating={scoreAnimating}
            touchdownAnimation={touchdownAnimation}
            fieldGoalAnimation={fieldGoalAnimation}
            onClearFlag={clearFlag}
          />

          <ControlPanel
            gameState={displayState}
            onUpdateScore={updateScore}
            onToggleClock={toggleClock}
            onResetClock={resetClock}
            onUpdateTime={updateTime}
            onSetQuarter={setQuarter}
            onTogglePossession={togglePossession}
            onSetPossession={handleSetPossession}
            onSetDown={setDown}
            onUpdateYardsToGo={updateYardsToGo}
            onSetYardsToGo={setYardsToGo}
            onUpdateFieldPosition={updateFieldPosition}
            onSetFieldPosition={setFieldPosition}
            onResetGame={resetGame}
            onUpdateTeam={updateTeam}
            onSetFlag={setFlag}
            onClearFlag={clearFlag}
            onFinalizeGame={finalizeGame}
          />
        </div>
      </div>
    </div>
  );
}
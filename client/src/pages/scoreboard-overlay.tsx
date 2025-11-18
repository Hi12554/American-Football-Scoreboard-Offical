import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScoreboardDisplay } from "@/components/scoreboard-display";
import type { GameState } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function ScoreboardOverlay() {
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
  const previousScoresRef = useRef<{ home: number; away: number } | null>(null);
  
  const { data: gameState, isLoading } = useQuery<GameState>({
    queryKey: ["/api/game-state"],
    refetchInterval: 1000, // Poll for state changes
  });

  // Sync local time with server state
  useEffect(() => {
    if (gameState) {
      setLocalTime(gameState.timeRemaining);
    }
  }, [gameState?.timeRemaining]);

  // Detect score changes and trigger animations
  useEffect(() => {
    if (!gameState) return;

    const currentScores = {
      home: gameState.homeTeam.score,
      away: gameState.awayTeam.score,
    };

    // If we have previous scores, check for changes
    if (previousScoresRef.current) {
      const homeDiff = currentScores.home - previousScoresRef.current.home;
      const awayDiff = currentScores.away - previousScoresRef.current.away;

      // Home team scored
      if (homeDiff > 0) {
        setScoreAnimating((prev) => ({ ...prev, home: true }));
        setTimeout(() => {
          setScoreAnimating((prev) => ({ ...prev, home: false }));
        }, 400);

        // Trigger field goal animation for 3 points
        if (homeDiff === 3) {
          setFieldGoalAnimation({ active: true, team: "home" });
          setTimeout(() => {
            setFieldGoalAnimation({ active: false, team: null });
          }, 3500);
        }

        // Trigger touchdown animation for 6 or 7 points
        if (homeDiff === 6 || homeDiff === 7) {
          setTouchdownAnimation({ active: true, team: "home" });
          setTimeout(() => {
            setTouchdownAnimation({ active: false, team: null });
          }, 4000);
        }
      }

      // Away team scored
      if (awayDiff > 0) {
        setScoreAnimating((prev) => ({ ...prev, away: true }));
        setTimeout(() => {
          setScoreAnimating((prev) => ({ ...prev, away: false }));
        }, 400);

        // Trigger field goal animation for 3 points
        if (awayDiff === 3) {
          setFieldGoalAnimation({ active: true, team: "away" });
          setTimeout(() => {
            setFieldGoalAnimation({ active: false, team: null });
          }, 3500);
        }

        // Trigger touchdown animation for 6 or 7 points
        if (awayDiff === 6 || awayDiff === 7) {
          setTouchdownAnimation({ active: true, team: "away" });
          setTimeout(() => {
            setTouchdownAnimation({ active: false, team: null });
          }, 4000);
        }
      }
    }

    // Update previous scores
    previousScoresRef.current = currentScores;
  }, [gameState?.homeTeam.score, gameState?.awayTeam.score]);

  // Update local time every second when clock is running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameState?.isClockRunning && localTime !== null && localTime > 0) {
      interval = setInterval(() => {
        setLocalTime((prev) => {
          if (prev === null || prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState?.isClockRunning, localTime]);

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const displayState: GameState = {
    ...gameState,
    timeRemaining: localTime ?? gameState.timeRemaining,
  };

  return (
    <div className="min-h-screen bg-transparent p-8">
      <div className="container max-w-7xl mx-auto">
        <ScoreboardDisplay 
          gameState={displayState} 
          scoreAnimating={scoreAnimating}
          touchdownAnimation={touchdownAnimation}
          fieldGoalAnimation={fieldGoalAnimation}
        />
      </div>
    </div>
  );
}

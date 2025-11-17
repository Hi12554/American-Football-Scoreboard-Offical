import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScoreboardDisplay } from "@/components/scoreboard-display";
import type { GameState } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function ScoreboardOverlay() {
  const [localTime, setLocalTime] = useState<number | null>(null);
  
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
          scoreAnimating={{ home: false, away: false }}
          touchdownAnimation={{ active: false, team: null }}
        />
      </div>
    </div>
  );
}

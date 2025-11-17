import type { GameState } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ScoreboardDisplayProps {
  gameState: GameState;
  scoreAnimating: { home: boolean; away: boolean };
  touchdownAnimation?: { active: boolean; team: "home" | "away" | null };
  fieldGoalAnimation?: { active: boolean; team: "home" | "away" | null };
  onClearFlag?: () => void;
}

export function ScoreboardDisplay({ gameState, scoreAnimating, touchdownAnimation, fieldGoalAnimation, onClearFlag }: ScoreboardDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getOrdinal = (n: number) => {
    const suffix = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return suffix[(v - 20) % 10] || suffix[v] || suffix[0];
  };

  const getFieldPositionDisplay = () => {
    const { fieldPosition, homeTeam, awayTeam } = gameState;

    // Field position logic: 0 = home goal line, 100 = away goal line
    // 0-49: Home territory (display as HOME [yardline])
    // 50: Midfield (display as "50")
    // 51-100: Away territory (display as AWAY [yardline])
    
    if (fieldPosition === 50) {
      return "50";
    } else if (fieldPosition < 50) {
      // Ball is on home team's side
      const teamAbbr = homeTeam.name.substring(0, 3).toUpperCase();
      return `${teamAbbr} ${fieldPosition}`;
    } else {
      // Ball is on away team's side
      const teamAbbr = awayTeam.name.substring(0, 3).toUpperCase();
      const yardLine = 100 - fieldPosition;
      return `${teamAbbr} ${yardLine}`;
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg shadow-2xl overflow-visible">
      <div className="flex items-stretch h-24">
        {/* Home Team */}
        <div 
          className="flex items-center gap-4 px-8 flex-1 relative overflow-hidden"
          style={{
            backgroundColor: gameState.homeTeam.primaryColor
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

          <div className="relative flex items-center gap-3 flex-1 min-w-0">
            {gameState.possession === "home" && (
              <div 
                className="animate-slide-right shrink-0"
                data-testid="indicator-home-possession"
              >
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent drop-shadow-lg" />
              </div>
            )}

            <div className="shrink-0" data-testid="text-home-logo">
              {gameState.homeTeam.logo.startsWith('http') || gameState.homeTeam.logo.startsWith('data:') ? (
                <img src={gameState.homeTeam.logo} alt="Home team logo" className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-5xl">{gameState.homeTeam.logo}</span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div 
                className="font-display font-black text-3xl text-white drop-shadow-lg truncate leading-tight"
                data-testid="text-home-team-name"
              >
                {gameState.homeTeam.name}
              </div>
              <div 
                className="font-display font-semibold text-base text-white/90 drop-shadow-md"
                data-testid="text-home-record"
              >
                ({gameState.homeTeam.record})
              </div>
              <div className="flex gap-3 mt-1.5" data-testid="text-home-timeouts">
                {Array.from({ length: gameState.homeTeam.timeouts }).map((_, i) => (
                  <div key={i} className="w-12 h-5 bg-yellow-400 border-2 border-yellow-600" />
                ))}
              </div>
            </div>

            <div className="relative shrink-0">
              <div
                className={cn(
                  "text-5xl font-display font-black text-white tabular-nums drop-shadow-2xl transition-all duration-300",
                  scoreAnimating.home && "animate-score-pulse"
                )}
                data-testid="text-home-score"
              >
                {gameState.homeTeam.score}
              </div>
              {scoreAnimating.home && (
                <div className="absolute inset-0 bg-white/30 animate-glow-pulse rounded-lg pointer-events-none blur-sm" />
              )}
            </div>
          </div>
        </div>

        {/* Center Info */}
        <div className="flex items-center gap-6 px-8 bg-gradient-to-b from-gray-900 to-black border-x-2 border-white/20 shrink-0 relative z-30">
          {gameState.isFinal ? (
            <div 
              className="flex-1 flex items-center justify-center"
              data-testid="indicator-final-center"
            >
              <div className="text-white px-12 py-3 font-display font-black text-5xl">
                FINAL
              </div>
            </div>
          ) : (
            <>
              <div 
                className={cn(
                  "text-3xl font-display font-black text-white tabular-nums min-w-[5.5rem] text-center",
                  gameState.isClockRunning && "text-chart-2"
                )}
                data-testid="text-game-clock"
              >
                {formatTime(gameState.timeRemaining)}
              </div>

              <div 
                className="text-2xl font-display font-bold text-white/90"
                data-testid="text-quarter"
              >
                {gameState.quarter === "OT" ? "OT" : `${gameState.quarter}${getOrdinal(gameState.quarter)}`}
              </div>

              <div 
                className="text-2xl font-display font-bold text-white/90"
                data-testid="text-down-and-distance"
              >
                {gameState.down}{getOrdinal(gameState.down)}&{gameState.yardsToGo}
              </div>

              <div 
                className="text-xl font-display font-semibold text-chart-2"
                data-testid="text-field-position"
              >
                {getFieldPositionDisplay()}
              </div>
            </>
          )}
        </div>

        {/* Away Team */}
        <div 
          className="flex items-center gap-4 px-8 flex-1 justify-end relative overflow-hidden"
          style={{
            backgroundColor: gameState.awayTeam.primaryColor
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />

          <div className="relative flex items-center gap-4 flex-1 min-w-0 justify-end">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "text-5xl font-display font-black text-white tabular-nums drop-shadow-2xl transition-all duration-300",
                  scoreAnimating.away && "animate-score-pulse"
                )}
                data-testid="text-away-score"
              >
                {gameState.awayTeam.score}
              </div>
              {scoreAnimating.away && (
                <div className="absolute inset-0 bg-white/30 animate-glow-pulse rounded-lg pointer-events-none blur-sm" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-right">
              <div 
                className="font-display font-black text-3xl text-white drop-shadow-lg truncate leading-tight"
                data-testid="text-away-team-name"
              >
                {gameState.awayTeam.name}
              </div>
              <div 
                className="font-display font-semibold text-base text-white/90 drop-shadow-md"
                data-testid="text-away-record"
              >
                ({gameState.awayTeam.record})
              </div>
              <div className="flex gap-3 mt-1.5 justify-end" data-testid="text-away-timeouts">
                {Array.from({ length: gameState.awayTeam.timeouts }).map((_, i) => (
                  <div key={i} className="w-12 h-5 bg-yellow-400 border-2 border-yellow-600" />
                ))}
              </div>
            </div>

            <div className="shrink-0" data-testid="text-away-logo">
              {gameState.awayTeam.logo.startsWith('http') || gameState.awayTeam.logo.startsWith('data:') ? (
                <img src={gameState.awayTeam.logo} alt="Away team logo" className="w-16 h-16 object-contain" />
              ) : (
                <span className="text-5xl">{gameState.awayTeam.logo}</span>
              )}
            </div>

            {gameState.possession === "away" && (
              <div 
                className="animate-slide-left shrink-0"
                data-testid="indicator-away-possession"
              >
                <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-white border-b-[8px] border-b-transparent drop-shadow-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flag Display - Broadcast Style */}
      {gameState.activeFlag && (
        <>
          {/* Flag indicator in the center section - wider coverage */}
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ paddingLeft: '80px', paddingRight: '10px' }}>
            <div 
              className="bg-yellow-400 text-black pl-8 pr-10 py-2 font-display font-black text-4xl shadow-2xl border-4 border-yellow-500 animate-slide-up"
              data-testid="indicator-flag"
            >
              FLAG
            </div>
          </div>

          {/* Penalty type under the penalized team - flush against scoreboard */}
          <div 
            className={cn(
              "absolute top-full z-30 animate-slide-up",
              gameState.activeFlag.team === "home" ? "left-6" : "right-6"
            )}
          >
            <div 
              className="text-white px-6 py-2 font-display font-black text-xl uppercase tracking-wide shadow-lg"
              style={{
                backgroundColor: gameState.activeFlag.team === "home" 
                  ? gameState.homeTeam.primaryColor 
                  : gameState.awayTeam.primaryColor
              }}
            >
              {gameState.activeFlag.type}
            </div>
          </div>
        </>
      )}

      {/* Field Goal Animation */}
      {fieldGoalAnimation?.active && fieldGoalAnimation.team && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Background flash effect */}
          <div 
            className="absolute inset-0 animate-fieldgoal-flash"
            style={{
              backgroundColor: fieldGoalAnimation.team === "home" 
                ? gameState.homeTeam.primaryColor 
                : gameState.awayTeam.primaryColor
            }}
          />
          
          {/* Football trajectory arc */}
          <div className="absolute inset-0 flex items-end justify-center">
            <div className="animate-football-kick">
              <div className="text-6xl">🏈</div>
            </div>
          </div>

          {/* Goal post */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 animate-goalpost-appear">
            <div className="flex flex-col items-center">
              {/* Crossbar */}
              <div className="w-32 h-2 bg-yellow-400 rounded-full shadow-lg" />
              {/* Uprights */}
              <div className="flex gap-28">
                <div className="w-2 h-40 bg-yellow-400 rounded-full shadow-lg" />
                <div className="w-2 h-40 bg-yellow-400 rounded-full shadow-lg" />
              </div>
            </div>
          </div>

          {/* Confetti particles */}
          <div className="absolute inset-0">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  width: `${6 + Math.random() * 6}px`,
                  height: `${6 + Math.random() * 6}px`,
                  backgroundColor: i % 3 === 0 
                    ? (fieldGoalAnimation.team === "home" ? gameState.homeTeam.primaryColor : gameState.awayTeam.primaryColor)
                    : i % 3 === 1 ? '#FFD700' 
                    : '#FFFFFF',
                  animationDelay: `${Math.random() * 0.6}s`,
                  animationDuration: `${1.8 + Math.random() * 1.5}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  borderRadius: i % 2 === 0 ? '50%' : '0',
                }}
              />
            ))}
          </div>

          {/* Sparkle effects */}
          <div className="absolute inset-0">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 animate-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: '#FFFFFF',
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 8px #FFD700, 0 0 16px #FFD700',
                }}
              />
            ))}
          </div>

          {/* FIELD GOAL banner with glow */}
          <div 
            className="relative px-12 py-5 font-display font-black text-6xl text-white uppercase tracking-wider shadow-2xl border-8 animate-fieldgoal-banner"
            style={{
              backgroundColor: fieldGoalAnimation.team === "home" 
                ? gameState.homeTeam.primaryColor 
                : gameState.awayTeam.primaryColor,
              borderColor: '#FFD700',
              textShadow: '0 0 20px rgba(255,215,0,0.8), 4px 4px 8px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.5)',
              boxShadow: '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.4)',
            }}
            data-testid="indicator-fieldgoal"
          >
            <div className="animate-text-glow">FIELD GOAL!</div>
          </div>

          {/* Expanding rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`ring-${i}`}
                className="absolute border-4 border-yellow-400 rounded-full animate-expanding-ring"
                style={{
                  width: '80px',
                  height: '80px',
                  animationDelay: `${i * 0.25}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Touchdown Animation */}
      {touchdownAnimation?.active && touchdownAnimation.team && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Background flash effect with pulse */}
          <div 
            className="absolute inset-0 animate-touchdown-flash"
            style={{
              backgroundColor: touchdownAnimation.team === "home" 
                ? gameState.homeTeam.primaryColor 
                : gameState.awayTeam.primaryColor
            }}
          />
          
          {/* Radial burst effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`burst-${i}`}
                className="absolute w-1 h-32 animate-radial-burst"
                style={{
                  backgroundColor: '#FFD700',
                  transform: `rotate(${i * 30}deg)`,
                  transformOrigin: 'center',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* Confetti particles - more of them */}
          <div className="absolute inset-0">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  width: `${8 + Math.random() * 8}px`,
                  height: `${8 + Math.random() * 8}px`,
                  backgroundColor: i % 4 === 0 
                    ? (touchdownAnimation.team === "home" ? gameState.homeTeam.primaryColor : gameState.awayTeam.primaryColor)
                    : i % 4 === 1 ? '#FFD700' 
                    : i % 4 === 2 ? '#FFFFFF'
                    : '#FF1744',
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  borderRadius: i % 2 === 0 ? '50%' : '0',
                }}
              />
            ))}
          </div>

          {/* Sparkle effects */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute w-2 h-2 animate-sparkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: '#FFFFFF',
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700',
                }}
              />
            ))}
          </div>

          {/* TOUCHDOWN banner with glow */}
          <div 
            className="relative px-16 py-6 font-display font-black text-7xl text-white uppercase tracking-wider shadow-2xl border-8 animate-touchdown-banner"
            style={{
              backgroundColor: touchdownAnimation.team === "home" 
                ? gameState.homeTeam.primaryColor 
                : gameState.awayTeam.primaryColor,
              borderColor: '#FFD700',
              textShadow: '0 0 20px rgba(255,215,0,0.8), 4px 4px 8px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.5)',
              boxShadow: '0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.4)',
            }}
            data-testid="indicator-touchdown"
          >
            <div className="animate-text-glow">TOUCHDOWN!</div>
          </div>

          {/* Expanding rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`ring-${i}`}
                className="absolute border-4 border-yellow-400 rounded-full animate-expanding-ring"
                style={{
                  width: '100px',
                  height: '100px',
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
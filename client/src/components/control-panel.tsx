import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { GameState } from "@shared/schema";
import { 
  Plus, 
  Minus, 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy,
  Timer,
  ArrowRight,
  ArrowLeft,
  Palette,
  Flag,
  Clock,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const FLAG_TYPES = [
  "False Start",
  "Holding",
  "Pass Interference",
  "Offsides",
  "Illegal Formation",
  "Roughing the Passer",
  "Facemask",
  "Delay of Game",
  "Unsportsmanlike Conduct",
  "Unnecessary Roughness",
  "Personal Foul",
  "Illegal Block Above the Waist",
  "Clipping",
  "Illegal Use of Hands",
  "Encroachment",
  "Neutral Zone Infraction",
  "Illegal Shift",
  "Illegal Motion",
  "Roughing the Kicker",
  "Running Into the Kicker",
  "Illegal Substitution",
  "Too Many Men on Field",
  "Taunting",
  "Horse Collar Tackle",
  "Lowering the Head to Initiate Contact",
  "Tripping",
  "Chop Block",
  "Illegal Blindside Block",
];

interface ControlPanelProps {
  gameState: GameState;
  onUpdateScore: (team: "home" | "away", points: number) => void;
  onToggleClock: () => void;
  onResetClock: () => void;
  onUpdateTime: (seconds: number) => void;
  onSetQuarter: (quarter: 1 | 2 | 3 | 4 | "OT") => void;
  onTogglePossession: () => void;
  onSetPossession: (team: "home" | "away" | null) => void;
  onSetDown: (down: 1 | 2 | 3 | 4) => void;
  onUpdateYardsToGo: (change: number) => void;
  onSetYardsToGo: (yards: number) => void;
  onUpdateFieldPosition: (change: number) => void;
  onSetFieldPosition: (position: number, side: "home" | "away") => void;
  onResetGame: () => void;
  onUpdateTeam: (team: "home" | "away", updates: Partial<GameState["homeTeam"]>) => void;
  onSetFlag: (team: "home" | "away", type: string) => void;
  onClearFlag: () => void;
  onFinalizeGame: () => void;
}

const PRESET_COLORS = [
  { name: "Chiefs Red", primary: "#E31837" },
  { name: "Raiders Black", primary: "#000000" },
  { name: "Packers Green", primary: "#203731" },
  { name: "Cowboys Blue", primary: "#003594" },
  { name: "49ers Red", primary: "#AA0000" },
  { name: "Seahawks Blue", primary: "#002244" },
  { name: "Broncos Orange", primary: "#FB4F14" },
  { name: "Patriots Blue", primary: "#002244" },
  { name: "Steelers Yellow", primary: "#FFB612" },
  { name: "Eagles Green", primary: "#004C54" },
];

export function ControlPanel({
  gameState,
  onUpdateScore,
  onToggleClock,
  onResetClock,
  onUpdateTime,
  onSetQuarter,
  onTogglePossession,
  onSetPossession,
  onSetDown,
  onUpdateYardsToGo,
  onSetYardsToGo,
  onUpdateFieldPosition,
  onSetFieldPosition,
  onResetGame,
  onUpdateTeam,
  onSetFlag,
  onClearFlag,
  onFinalizeGame,
}: ControlPanelProps) {
  const [homeLogoDialogOpen, setHomeLogoDialogOpen] = useState(false);
  const [awayLogoDialogOpen, setAwayLogoDialogOpen] = useState(false);
  const [homeFlagDialogOpen, setHomeFlagDialogOpen] = useState(false);
  const [awayFlagDialogOpen, setAwayFlagDialogOpen] = useState(false);
  const [yardsToGoInput, setYardsToGoInput] = useState(gameState.yardsToGo.toString());
  const [fieldPositionInput, setFieldPositionInput] = useState("");
  const [selectedFieldSide, setSelectedFieldSide] = useState<"home" | "away">(gameState.ballOn);
  const [homeTeamName, setHomeTeamName] = useState(gameState.homeTeam.name);
  const [awayTeamName, setAwayTeamName] = useState(gameState.awayTeam.name);
  const [homeRecord, setHomeRecord] = useState(gameState.homeTeam.record);
  const [awayRecord, setAwayRecord] = useState(gameState.awayTeam.record);

  // Update local state when gameState changes from external source
  useEffect(() => {
    setYardsToGoInput(gameState.yardsToGo.toString());
    setSelectedFieldSide(gameState.ballOn);
    setHomeTeamName(gameState.homeTeam.name);
    setAwayTeamName(gameState.awayTeam.name);
    setHomeRecord(gameState.homeTeam.record);
    setAwayRecord(gameState.awayTeam.record);
    
    // Calculate the yard line display based on field position
    if (gameState.fieldPosition === 50) {
      setFieldPositionInput("50");
    } else if (gameState.fieldPosition < 50) {
      setFieldPositionInput(gameState.fieldPosition.toString());
    } else {
      setFieldPositionInput((100 - gameState.fieldPosition).toString());
    }
  }, [gameState.yardsToGo, gameState.fieldPosition, gameState.ballOn, gameState.homeTeam.name, gameState.awayTeam.name, gameState.homeTeam.record, gameState.awayTeam.record]);

  // Debounced update handlers
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (homeTeamName !== gameState.homeTeam.name) {
        onUpdateTeam("home", { name: homeTeamName });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [homeTeamName]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (awayTeamName !== gameState.awayTeam.name) {
        onUpdateTeam("away", { name: awayTeamName });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [awayTeamName]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (homeRecord !== gameState.homeTeam.record) {
        onUpdateTeam("home", { record: homeRecord });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [homeRecord]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (awayRecord !== gameState.awayTeam.record) {
        onUpdateTeam("away", { record: awayRecord });
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [awayRecord]);

  const handleYardsToGoChange = (value: string) => {
    setYardsToGoInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 99) {
      onSetYardsToGo(parsed);
    }
  };

  const handleFieldPositionChange = (value: string) => {
    setFieldPositionInput(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      onSetFieldPosition(parsed, selectedFieldSide);
    }
  };

  const handleFieldSideChange = (side: "home" | "away") => {
    setSelectedFieldSide(side);
    // Recalculate position with new side
    const parsed = parseInt(fieldPositionInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
      onSetFieldPosition(parsed, side);
    }
  };

  const handleFileUpload = (team: "home" | "away", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateTeam(team, { logo: reader.result as string });
        if (team === "home") setHomeLogoDialogOpen(false);
        else setAwayLogoDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  const ScoreButton = ({ 
    points, 
    team 
  }: { 
    points: number; 
    team: "home" | "away" 
  }) => (
    <Button
      size="sm"
      variant={points > 0 ? "default" : "secondary"}
      onClick={() => onUpdateScore(team, points)}
      className="min-w-16 font-display font-semibold"
      data-testid={`button-${team}-${points > 0 ? 'add' : 'subtract'}-${Math.abs(points)}`}
    >
      {points > 0 ? `+${points}` : points}
    </Button>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-6 bg-card/95 backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-foreground">Home Team</h3>
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        
        <Separator className="bg-primary/20" />
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="home-team-name" className="text-sm font-semibold">
                Team Name
              </Label>
              <Input
                id="home-team-name"
                value={homeTeamName}
                onChange={(e) => setHomeTeamName(e.target.value.toUpperCase())}
                className="font-display font-semibold text-center uppercase"
                maxLength={15}
                data-testid="input-home-team-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="home-team-record" className="text-sm font-semibold">
                Record
              </Label>
              <Input
                id="home-team-record"
                value={homeRecord}
                onChange={(e) => setHomeRecord(e.target.value)}
                className="font-display font-semibold text-center"
                placeholder="3-3"
                maxLength={7}
                data-testid="input-home-record"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Team Logo</Label>
            <Dialog open={homeLogoDialogOpen} onOpenChange={setHomeLogoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Home Team Logo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("home", e)}
                    data-testid="input-home-logo-file"
                  />
                  {gameState.homeTeam.logo && gameState.homeTeam.logo.startsWith('data:') && (
                    <div className="flex justify-center">
                      <img src={gameState.homeTeam.logo} alt="Home team logo preview" className="max-w-32 max-h-32 object-contain" />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Team Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onUpdateTeam("home", { primaryColor: color.primary })}
                  className={cn(
                    "h-10 rounded-md border-2 transition-all hover-elevate active-elevate-2",
                    gameState.homeTeam.primaryColor === color.primary 
                      ? "border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" 
                      : "border-border"
                  )}
                  style={{
                    backgroundColor: color.primary
                  }}
                  title={color.name}
                  data-testid={`button-home-color-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              ))}
            </div>
            <div>
              <Label htmlFor="home-primary" className="text-xs text-muted-foreground">Custom Color</Label>
              <Input
                id="home-primary"
                type="color"
                value={gameState.homeTeam.primaryColor}
                onChange={(e) => onUpdateTeam("home", { primaryColor: e.target.value })}
                className="h-10 cursor-pointer"
                data-testid="input-home-primary-color"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Score Controls</Label>
            <div className="flex gap-2 justify-center flex-wrap">
              <ScoreButton points={-1} team="home" />
              <ScoreButton points={1} team="home" />
              <ScoreButton points={3} team="home" />
              <ScoreButton points={6} team="home" />
              <ScoreButton points={7} team="home" />
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeouts
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateTeam("home", { timeouts: Math.max(0, gameState.homeTeam.timeouts - 1) })}
                  disabled={gameState.homeTeam.timeouts === 0}
                  data-testid="button-home-timeout-decrease"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center text-2xl font-display font-bold" data-testid="text-home-timeouts">
                  {gameState.homeTeam.timeouts}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateTeam("home", { timeouts: Math.min(3, gameState.homeTeam.timeouts + 1) })}
                  disabled={gameState.homeTeam.timeouts === 3}
                  data-testid="button-home-timeout-increase"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Flag
              </Label>
              {gameState.activeFlag?.team === "home" ? (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white"
                  onClick={onClearFlag}
                  data-testid="button-clear-home-flag"
                >
                  <Flag className="w-4 h-4" />
                  Clear Flag
                </Button>
              ) : (
                <Dialog open={homeFlagDialogOpen} onOpenChange={setHomeFlagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 bg-yellow-400 hover:bg-yellow-500 text-black">
                      <Flag className="w-4 h-4" />
                      Throw Flag on Home
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Flag Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      {FLAG_TYPES.map((flagType) => (
                        <Button
                          key={flagType}
                          variant="outline"
                          onClick={() => {
                            onSetFlag("home", flagType);
                            setHomeFlagDialogOpen(false);
                          }}
                          className="font-semibold"
                        >
                          {flagType}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Possession</Label>
            <Button
              size="default"
              variant={gameState.possession === "home" ? "default" : "outline"}
              onClick={() => onSetPossession(gameState.possession === "home" ? null : "home")}
              className="w-full font-display font-semibold gap-2"
              data-testid="button-home-possession"
            >
              <Trophy className="w-4 h-4" />
              {gameState.possession === "home" ? "Has Possession" : "Give Possession"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6 bg-card/95 backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-foreground">Away Team</h3>
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        
        <Separator className="bg-primary/20" />
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="away-team-name" className="text-sm font-semibold">
                Team Name
              </Label>
              <Input
                id="away-team-name"
                value={awayTeamName}
                onChange={(e) => setAwayTeamName(e.target.value.toUpperCase())}
                className="font-display font-semibold text-center uppercase"
                maxLength={15}
                data-testid="input-away-team-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="away-team-record" className="text-sm font-semibold">
                Record
              </Label>
              <Input
                id="away-team-record"
                value={awayRecord}
                onChange={(e) => setAwayRecord(e.target.value)}
                className="font-display font-semibold text-center"
                placeholder="2-4"
                maxLength={7}
                data-testid="input-away-record"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Team Logo</Label>
            <Dialog open={awayLogoDialogOpen} onOpenChange={setAwayLogoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Away Team Logo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload("away", e)}
                    data-testid="input-away-logo-file"
                  />
                  {gameState.awayTeam.logo && gameState.awayTeam.logo.startsWith('data:') && (
                    <div className="flex justify-center">
                      <img src={gameState.awayTeam.logo} alt="Away team logo preview" className="max-w-32 max-h-32 object-contain" />
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Team Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onUpdateTeam("away", { primaryColor: color.primary })}
                  className={cn(
                    "h-10 rounded-md border-2 transition-all hover-elevate active-elevate-2",
                    gameState.awayTeam.primaryColor === color.primary 
                      ? "border-foreground ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" 
                      : "border-border"
                  )}
                  style={{
                    backgroundColor: color.primary
                  }}
                  title={color.name}
                  data-testid={`button-away-color-${color.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              ))}
            </div>
            <div>
              <Label htmlFor="away-primary" className="text-xs text-muted-foreground">Custom Color</Label>
              <Input
                id="away-primary"
                type="color"
                value={gameState.awayTeam.primaryColor}
                onChange={(e) => onUpdateTeam("away", { primaryColor: e.target.value })}
                className="h-10 cursor-pointer"
                data-testid="input-away-primary-color"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Score Controls</Label>
            <div className="flex gap-2 justify-center flex-wrap">
              <ScoreButton points={-1} team="away" />
              <ScoreButton points={1} team="away" />
              <ScoreButton points={3} team="away" />
              <ScoreButton points={6} team="away" />
              <ScoreButton points={7} team="away" />
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeouts
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateTeam("away", { timeouts: Math.max(0, gameState.awayTeam.timeouts - 1) })}
                  disabled={gameState.awayTeam.timeouts === 0}
                  data-testid="button-away-timeout-decrease"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <div className="flex-1 text-center text-2xl font-display font-bold" data-testid="text-away-timeouts">
                  {gameState.awayTeam.timeouts}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onUpdateTeam("away", { timeouts: Math.min(3, gameState.awayTeam.timeouts + 1) })}
                  disabled={gameState.awayTeam.timeouts === 3}
                  data-testid="button-away-timeout-increase"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Flag
              </Label>
              {gameState.activeFlag?.team === "away" ? (
                <Button 
                  variant="outline" 
                  className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white"
                  onClick={onClearFlag}
                  data-testid="button-clear-away-flag"
                >
                  <Flag className="w-4 h-4" />
                  Clear Flag
                </Button>
              ) : (
                <Dialog open={awayFlagDialogOpen} onOpenChange={setAwayFlagDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2 bg-yellow-400 hover:bg-yellow-500 text-black">
                      <Flag className="w-4 h-4" />
                      Throw Flag on Away
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Flag Type</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-2">
                      {FLAG_TYPES.map((flagType) => (
                        <Button
                          key={flagType}
                          variant="outline"
                          onClick={() => {
                            onSetFlag("away", flagType);
                            setAwayFlagDialogOpen(false);
                          }}
                          className="font-semibold"
                        >
                          {flagType}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Possession</Label>
            <Button
              size="default"
              variant={gameState.possession === "away" ? "default" : "outline"}
              onClick={() => onSetPossession(gameState.possession === "away" ? null : "away")}
              className="w-full font-display font-semibold gap-2"
              data-testid="button-away-possession"
            >
              <Trophy className="w-4 h-4" />
              {gameState.possession === "away" ? "Has Possession" : "Give Possession"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6 bg-card/95 backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-foreground">Game Clock & Quarter</h3>
          <Timer className="w-5 h-5 text-primary" />
        </div>
        
        <Separator className="bg-primary/20" />
        
        <div className="space-y-6">
          <div className="flex gap-2 justify-center">
            <Button
              size="default"
              variant={gameState.isClockRunning ? "secondary" : "default"}
              onClick={onToggleClock}
              className="min-w-32 font-display font-semibold gap-2"
              data-testid="button-clock-toggle"
            >
              {gameState.isClockRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              size="default"
              variant="outline"
              onClick={onResetClock}
              className="min-w-32 font-display font-semibold gap-2"
              data-testid="button-clock-reset"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Time Adjustment</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateTime(60)}
                className="font-display font-semibold"
                data-testid="button-time-add-60"
              >
                <Plus className="w-4 h-4 mr-1" />
                1:00
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateTime(-60)}
                className="font-display font-semibold"
                data-testid="button-time-subtract-60"
              >
                <Minus className="w-4 h-4 mr-1" />
                1:00
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateTime(10)}
                className="font-display font-semibold"
                data-testid="button-time-add-10"
              >
                <Plus className="w-4 h-4 mr-1" />
                0:10
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateTime(-10)}
                className="font-display font-semibold"
                data-testid="button-time-subtract-10"
              >
                <Minus className="w-4 h-4 mr-1" />
                0:10
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateTime(1)}
                className="font-display font-semibold"
                data-testid="button-time-add-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                0:01
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateTime(-1)}
                className="font-display font-semibold"
                data-testid="button-time-subtract-1"
              >
                <Minus className="w-4 h-4 mr-1" />
                0:01
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-3 block">Quarter</Label>
            <div className="flex gap-2 justify-center flex-wrap">
              {([1, 2, 3, 4, "OT"] as const).map((q) => (
                <Button
                  key={q}
                  size="sm"
                  variant={gameState.quarter === q ? "default" : "outline"}
                  onClick={() => onSetQuarter(q)}
                  className={cn(
                    "min-w-16 font-display font-semibold",
                    gameState.quarter === q && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  data-testid={`button-quarter-${q}`}
                >
                  {q === "OT" ? "OT" : `Q${q}`}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="bg-primary/20" />

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Game Status</Label>
            <Button
              size="default"
              variant={gameState.isFinal ? "default" : "outline"}
              onClick={onFinalizeGame}
              className="w-full font-display font-bold gap-2 text-lg"
              data-testid="button-finalize-game"
            >
              {gameState.isFinal ? "FINAL ON" : "FINAL OFF"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-6 bg-card/95 backdrop-blur-sm border-primary/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-foreground">Down & Field Position</h3>
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>
        
        <Separator className="bg-primary/20" />
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold mb-3 block">Down</Label>
            <div className="flex gap-2 justify-center">
              {([1, 2, 3, 4] as const).map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={gameState.down === d ? "default" : "outline"}
                  onClick={() => onSetDown(d)}
                  className={cn(
                    "min-w-16 font-display font-semibold text-lg",
                    gameState.down === d && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  data-testid={`button-down-${d}`}
                >
                  {d}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Yards to Go</Label>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onUpdateYardsToGo(-1)}
                data-testid="button-yards-decrease"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                type="number"
                min="0"
                max="99"
                value={yardsToGoInput}
                onChange={(e) => handleYardsToGoChange(e.target.value)}
                className="flex-1 text-center text-3xl font-display font-bold h-16"
                data-testid="input-yards-to-go"
              />
              
              <Button
                size="icon"
                variant="outline"
                onClick={() => onUpdateYardsToGo(1)}
                data-testid="button-yards-increase"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold">Field Position</Label>
            
            <div className="flex gap-2 mb-3">
              <Button
                size="sm"
                variant={selectedFieldSide === "home" ? "default" : "outline"}
                onClick={() => handleFieldSideChange("home")}
                className="flex-1 font-display font-semibold"
                data-testid="button-field-side-home"
              >
                {gameState.homeTeam.name.substring(0, 3).toUpperCase()} Side
              </Button>
              <Button
                size="sm"
                variant={selectedFieldSide === "away" ? "default" : "outline"}
                onClick={() => handleFieldSideChange("away")}
                className="flex-1 font-display font-semibold"
                data-testid="button-field-side-away"
              >
                {gameState.awayTeam.name.substring(0, 3).toUpperCase()} Side
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => onUpdateFieldPosition(-1)}
                data-testid="button-field-decrease"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 flex flex-col gap-2">
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={fieldPositionInput}
                  onChange={(e) => handleFieldPositionChange(e.target.value)}
                  placeholder="1-50"
                  className="text-center text-3xl font-display font-bold h-16"
                  data-testid="input-field-position"
                />
                <div className="text-xs font-semibold text-muted-foreground text-center">
                  Yard Line (1-50)
                </div>
              </div>
              
              <Button
                size="icon"
                variant="outline"
                onClick={() => onUpdateFieldPosition(1)}
                data-testid="button-field-increase"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-destructive">Reset Game</Label>
            <Button
              size="default"
              variant="destructive"
              onClick={onResetGame}
              className="w-full font-display font-semibold gap-2"
              data-testid="button-reset-game"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Entire Game
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LeaderboardModal = ({ open, onOpenChange }: LeaderboardModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  
  const leaderboardData = [
    {
      rank: 1,
      playerName: "Alex Rodriguez",
      totalWins: 24,
      favoriteGame: "FIFA 24",
      hoursPlayed: 156,
      winRate: 85,
    },
    {
      rank: 2,
      playerName: "Sarah Chen",
      totalWins: 22,
      favoriteGame: "Valorant",
      hoursPlayed: 134,
      winRate: 78,
    },
    {
      rank: 3,
      playerName: "Mike Johnson",
      totalWins: 19,
      favoriteGame: "Street Fighter 6",
      hoursPlayed: 98,
      winRate: 82,
    },
    {
      rank: 4,
      playerName: "Emma Davis",
      totalWins: 18,
      favoriteGame: "League of Legends",
      hoursPlayed: 187,
      winRate: 72,
    },
    {
      rank: 5,
      playerName: "Chris Wilson",
      totalWins: 16,
      favoriteGame: "Counter-Strike 2",
      hoursPlayed: 145,
      winRate: 69,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-yellow-500 bg-yellow-50";
      case 2:
        return "border-gray-400 bg-gray-50";
      case 3:
        return "border-amber-600 bg-amber-50";
      default:
        return "border-border bg-background";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gaming Leaderboard</DialogTitle>
          <DialogDescription>
            Top players ranked by tournament wins and performance
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {leaderboardData.slice(0, 3).map((player) => (
              <Card key={player.rank} className={`text-center ${getRankColor(player.rank)} border-2`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(player.rank)}
                  </div>
                  <CardTitle className="text-lg">{player.playerName}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-primary mb-1">{player.totalWins}</div>
                  <div className="text-sm text-muted-foreground">Tournament Wins</div>
                  <Badge variant="secondary" className="mt-2">
                    {player.winRate}% Win Rate
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Full Rankings Table */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboardData.map((player, index) => (
                  <div 
                    key={player.rank} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index < 3 ? getRankColor(player.rank) : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(player.rank)}
                      </div>
                      <div>
                        <div className="font-semibold">{player.playerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Favorite: {player.favoriteGame}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-lg">{player.totalWins}</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold">{player.hoursPlayed}h</div>
                      <div className="text-xs text-muted-foreground">Played</div>
                    </div>
                    
                    <div className="text-center">
                      <Badge 
                        variant={player.winRate >= 80 ? "default" : player.winRate >= 70 ? "secondary" : "outline"}
                      >
                        {player.winRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">127</div>
                <div className="text-sm text-muted-foreground">Total Players</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">48</div>
                <div className="text-sm text-muted-foreground">Active Tournaments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">1,456</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{formatCurrency(2340)}</div>
                <div className="text-sm text-muted-foreground">Prize Money</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeaderboardModal;
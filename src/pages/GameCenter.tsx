import { useState } from "react";
import { 
  Gamepad2,
  Users,
  Clock,
  Trophy,
  Play,
  Square,
  DollarSign,
  Plus,
  Settings,
  Monitor,
  Joystick,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateTournamentModal from "@/components/game/CreateTournamentModal";
import NewBookingModal from "@/components/game/NewBookingModal";
import StartSessionModal from "@/components/game/StartSessionModal";
import EditStationModal from "@/components/game/EditStationModal";
import AddStationModal from "@/components/game/AddStationModal";
import LeaderboardModal from "@/components/game/LeaderboardModal";
import { useGameCenterDB, GameStation } from "@/hooks/useGameCenterDB";

const GameCenter = () => {
  const {
    stations,
    sessions,
    tournaments,
    bookings,
    loading,
    updateStation,
    startSession,
    endSession,
    updateStationStatus,
  } = useGameCenterDB();

  const [activeTab, setActiveTab] = useState("stations");

  // Modal states
  const [createTournamentOpen, setCreateTournamentOpen] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [startSessionOpen, setStartSessionOpen] = useState(false);
  const [editStationOpen, setEditStationOpen] = useState(false);
  const [addStationOpen, setAddStationOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<GameStation | null>(null);

  const stationTypeColors: Record<string, string> = {
    console: "bg-blue-500",
    pc: "bg-green-500", 
    vr: "bg-purple-500",
    arcade: "bg-orange-500",
    playstation: "bg-blue-500",
    xbox: "bg-green-500"
  };

  const statusColors: Record<string, string> = {
    available: "bg-green-500",
    occupied: "bg-red-500",
    maintenance: "bg-yellow-500",
    reserved: "bg-blue-500",
    upcoming: "bg-blue-500",
    registration_open: "bg-green-500",
    in_progress: "bg-green-500", 
    completed: "bg-gray-500",
    cancelled: "bg-red-500",
    confirmed: "bg-blue-500",
    no_show: "bg-gray-500"
  };

  const getStationStats = () => {
    return {
      total: stations.length,
      available: stations.filter(s => s.status === "available").length,
      occupied: stations.filter(s => s.status === "occupied").length,
      maintenance: stations.filter(s => s.status === "maintenance").length,
    };
  };

  const getTournamentStats = () => {
    return {
      total: tournaments.length,
      upcoming: tournaments.filter(t => t.status === "upcoming" || t.status === "registration_open").length,
      active: tournaments.filter(t => t.status === "in_progress").length,
      completed: tournaments.filter(t => t.status === "completed").length,
    };
  };

  const stationStats = getStationStats();
  const tournamentStats = getTournamentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game Center</h1>
          <p className="text-muted-foreground">Manage gaming stations, tournaments, and bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddStationOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Station
          </Button>
          <Button variant="outline" onClick={() => setCreateTournamentOpen(true)}>
            <Trophy className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
          <Button onClick={() => setNewBookingOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-6">
          {/* Station Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stationStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Stations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stationStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stationStats.occupied}</div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stationStats.maintenance}</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </CardContent>
            </Card>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => (
              <Card key={station.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {station.game_type?.toLowerCase().includes("console") && <Gamepad2 className="h-5 w-5" />}
                      {station.game_type?.toLowerCase().includes("pc") && <Monitor className="h-5 w-5" />}
                      {station.game_type?.toLowerCase().includes("vr") && <Joystick className="h-5 w-5" />}
                      {!station.game_type?.toLowerCase().includes("console") && 
                       !station.game_type?.toLowerCase().includes("pc") && 
                       !station.game_type?.toLowerCase().includes("vr") && <Gamepad2 className="h-5 w-5" />}
                      {station.station_name}
                    </CardTitle>
                    <Badge className={`${statusColors[station.status]} text-white`}>
                      {station.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${stationTypeColors[station.game_type?.toLowerCase()] || 'bg-blue-500'} text-white`}>
                      {station.game_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ${station.hourly_rate}/hour
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {station.status === "occupied" && (
                      <div>
                        <div className="text-sm text-muted-foreground">Current Session:</div>
                        <div className="font-medium">Active</div>
                      </div>
                    )}

                    {station.location && (
                      <div>
                        <div className="text-sm text-muted-foreground">Location:</div>
                        <div className="text-sm">{station.location}</div>
                      </div>
                    )}

                    {station.equipment_specs && (
                      <div>
                        <div className="text-sm text-muted-foreground">Specs:</div>
                        <div className="text-sm">{station.equipment_specs}</div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {station.status === "occupied" ? (
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="w-full"
                          onClick={async () => {
                            const activeSession = sessions.find(
                              s => s.station_id === station.id && s.status === "active"
                            );
                            if (activeSession) {
                              await endSession(activeSession.id, "cash");
                            }
                          }}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          End Session
                        </Button>
                      ) : station.status === "available" ? (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setSelectedStation(station);
                            setStartSessionOpen(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={async () => {
                            await updateStationStatus(station.id, "available");
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Set Available
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          {/* Tournament Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{tournamentStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Tournaments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{tournamentStats.upcoming}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{tournamentStats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{tournamentStats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Tournaments List */}
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">{tournament.tournament_name}</h3>
                        <Badge className={`${statusColors[tournament.status]} text-white`}>
                          {tournament.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Game: </span>
                          <span className="font-medium">{tournament.game_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date & Time: </span>
                          <span className="font-medium">{tournament.tournament_date} {tournament.start_time}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Participants: </span>
                          <span className="font-medium">
                            {tournament.current_participants}/{tournament.max_participants}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Prize Pool: </span>
                          <span className="font-medium">${tournament.prize_pool}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${tournament.prize_pool}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {(tournament.status === "upcoming" || tournament.status === "registration_open") && (
                          <Button size="sm">
                            Join Tournament
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {/* Active Bookings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Bookings</h3>
            {bookings.filter(b => b.status === "confirmed").map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h4 className="font-semibold">
                          {stations.find(s => s.id === booking.station_id)?.station_name || 'Station'}
                        </h4>
                        <Badge className={`${statusColors[booking.status]} text-white`}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Player: </span>
                          <span className="font-medium">{booking.player_name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date: </span>
                          <span className="font-medium">{booking.booking_date}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time: </span>
                          <span className="font-medium">{booking.start_time}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-medium">{booking.duration_hours} hours</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold">${booking.total_amount}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {bookings.filter(b => b.status === "confirmed").length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No active bookings
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Leaderboard Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Players
              </CardTitle>
              <CardDescription>Players with the most game time this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  Click "View Full Leaderboard" to see rankings
                </div>
                <Button className="w-full" onClick={() => setLeaderboardOpen(true)}>
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gaming Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{sessions.length}</div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {sessions.filter(s => s.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">Active Sessions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  ${sessions.reduce((sum, s) => sum + (s.total_amount || 0), 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTournamentModal 
        open={createTournamentOpen} 
        onOpenChange={setCreateTournamentOpen} 
      />
      
      <NewBookingModal 
        open={newBookingOpen} 
        onOpenChange={setNewBookingOpen} 
      />
      
      <StartSessionModal 
        open={startSessionOpen} 
        onOpenChange={setStartSessionOpen}
        station={selectedStation}
      />
      
      <LeaderboardModal 
        open={leaderboardOpen} 
        onOpenChange={setLeaderboardOpen} 
      />
      
      <EditStationModal 
        open={editStationOpen} 
        onOpenChange={setEditStationOpen}
        station={selectedStation || undefined}
        onUpdate={updateStation}
      />

      <AddStationModal 
        open={addStationOpen} 
        onOpenChange={setAddStationOpen}
      />
    </div>
  );
};

export default GameCenter;

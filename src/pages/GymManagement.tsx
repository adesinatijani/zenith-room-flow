import { useState } from "react";
import { 
  Dumbbell,
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  Search,
  Filter,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import LiveDashboardModal from "@/components/gym/LiveDashboardModal";
import NewMemberModal from "@/components/gym/NewMemberModal";
import MemberCheckInModal from "@/components/gym/MemberCheckInModal";
import BookTrainerModal from "@/components/gym/BookTrainerModal";
import EquipmentStatusModal from "@/components/gym/EquipmentStatusModal";
import TrainerScheduleModal from "@/components/gym/TrainerScheduleModal";
import AddEquipmentModal from "@/components/gym/AddEquipmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGymDB } from "@/hooks/useGymDB";

const GymManagement = () => {
  const { 
    members, 
    equipment, 
    trainers, 
    loading,
    addMember,
    checkInMember,
    addEquipment,
    updateEquipmentStatus,
    addTrainer,
    bookTrainerSession
  } = useGymDB();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  // Modal states
  const [liveDashboardOpen, setLiveDashboardOpen] = useState(false);
  const [newMemberOpen, setNewMemberOpen] = useState(false);
  const [memberCheckInOpen, setMemberCheckInOpen] = useState(false);
  const [bookTrainerOpen, setBookTrainerOpen] = useState(false);
  const [equipmentStatusOpen, setEquipmentStatusOpen] = useState(false);
  const [trainerScheduleOpen, setTrainerScheduleOpen] = useState(false);
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);

  const membershipColors = {
    "day-pass": "bg-blue-500",
    monthly: "bg-green-500", 
    yearly: "bg-purple-500"
  };

  const statusColors = {
    active: "bg-green-500",
    expired: "bg-red-500",
    suspended: "bg-yellow-500",
    available: "bg-green-500",
    "in-use": "bg-blue-500",
    maintenance: "bg-red-500",
    busy: "bg-yellow-500",
    "off-duty": "bg-gray-500"
  };

  const getMemberStats = () => {
    return {
      total: members.length,
      active: members.filter(m => m.status === "active").length,
      expired: members.filter(m => m.status === "expired").length,
      checkInsToday: 28 // Mock data
    };
  };

  const getEquipmentStats = () => {
    return {
      total: equipment.length,
      available: equipment.filter(e => e.status === "available").length,
      inUse: equipment.filter(e => e.status === "in-use").length,
      maintenance: equipment.filter(e => e.status === "maintenance").length
    };
  };

  const memberStats = getMemberStats();
  const equipmentStats = getEquipmentStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gym Management</h1>
          <p className="text-muted-foreground">Manage gym members, equipment, and trainers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLiveDashboardOpen(true)}>
            <Activity className="h-4 w-4 mr-2" />
            Live Dashboard
          </Button>
          <Button onClick={() => setNewMemberOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Member
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{memberStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{memberStats.active}</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{memberStats.checkInsToday}</div>
                <div className="text-sm text-muted-foreground">Check-ins Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{equipmentStats.inUse}</div>
                <div className="text-sm text-muted-foreground">Equipment In Use</div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setMemberCheckInOpen(true)}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Member Check-in</h3>
                <p className="text-sm text-muted-foreground">Quick member check-in and validation</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setBookTrainerOpen(true)}>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Book Trainer</h3>
                <p className="text-sm text-muted-foreground">Schedule personal training sessions</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setEquipmentStatusOpen(true)}>
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Equipment Status</h3>
                <p className="text-sm text-muted-foreground">View and update equipment status</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Member Search & Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search members..." className="pl-10" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Membership Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="day-pass">Day Pass</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-sm text-muted-foreground">{member.phone}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge className={`${membershipColors[member.membership_type]} text-white mb-2`}>
                        {member.membership_type}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Expires: {member.end_date}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{member.check_ins}</div>
                      <div className="text-sm text-muted-foreground">Check-ins</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[member.status]} text-white`}>
                        {member.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => setMemberCheckInOpen(true)}>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          {/* Equipment Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Equipment Management</h2>
              <p className="text-muted-foreground">Monitor and manage gym equipment</p>
            </div>
            <Button onClick={() => setAddEquipmentOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </div>

          {/* Equipment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{equipmentStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Equipment</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{equipmentStats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{equipmentStats.inUse}</div>
                <div className="text-sm text-muted-foreground">In Use</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{equipmentStats.maintenance}</div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge className={`${statusColors[item.status]} text-white`}>
                      {item.status}
                    </Badge>
                  </div>
                  <CardDescription>{item.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Location:</span>
                      <span className="text-sm">{item.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Maintenance:</span>
                      <span className="text-sm">{item.last_maintenance || 'N/A'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipment(item);
                          setEquipmentStatusOpen(true);
                        }}
                      >
                        Update Status
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipment(item);
                          setEquipmentStatusOpen(true);
                        }}
                      >
                        Maintenance
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trainers" className="space-y-6">
          {/* Trainers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{trainer.name}</CardTitle>
                    <Badge className={`${statusColors[trainer.availability]} text-white`}>
                      {trainer.availability}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-2">
                      <span>Rating: {trainer.rating}/5</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-3 w-3 ${i < Math.floor(trainer.rating) ? 'bg-yellow-400' : 'bg-gray-200'} rounded-full mr-1`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Specialization:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {trainer.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Hourly Rate:</span>
                      <span className="font-semibold">${trainer.hourly_rate}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1" 
                        disabled={trainer.availability !== "available"}
                        onClick={() => {
                          setSelectedTrainer(trainer);
                          setBookTrainerOpen(true);
                        }}
                      >
                        Book Session
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedTrainer(trainer);
                          setTrainerScheduleOpen(true);
                        }}
                      >
                        View Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <LiveDashboardModal 
        open={liveDashboardOpen} 
        onOpenChange={setLiveDashboardOpen} 
      />
      
      <NewMemberModal 
        open={newMemberOpen} 
        onOpenChange={setNewMemberOpen} 
      />
      
      <MemberCheckInModal 
        open={memberCheckInOpen} 
        onOpenChange={setMemberCheckInOpen} 
      />
      
      <BookTrainerModal 
        open={bookTrainerOpen} 
        onOpenChange={setBookTrainerOpen}
        selectedTrainer={selectedTrainer || undefined}
      />
      
      <EquipmentStatusModal 
        open={equipmentStatusOpen} 
        onOpenChange={setEquipmentStatusOpen}
        equipment={selectedEquipment || undefined}
      />
      
      <TrainerScheduleModal 
        open={trainerScheduleOpen} 
        onOpenChange={setTrainerScheduleOpen}
        trainer={selectedTrainer || undefined}
      />
      
      <AddEquipmentModal 
        open={addEquipmentOpen} 
        onOpenChange={setAddEquipmentOpen}
      />
    </div>
  );
};

export default GymManagement;
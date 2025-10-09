import { useState, useEffect } from "react";
import { Activity, Users, Dumbbell, Clock, TrendingUp, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";

interface LiveDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LiveDashboardModal = ({ open, onOpenChange }: LiveDashboardModalProps) => {
  const { formatCurrency } = useGlobalSettings();
  
  const [liveStats, setLiveStats] = useState({
    currentMembers: 24,
    equipmentInUse: 18,
    peakHours: "6-8 PM",
    avgSessionTime: "65 min",
    revenueToday: 1240,
    newMembersToday: 3,
    checkInsToday: 47,
    capacity: 75
  });

  const [recentActivity] = useState([
    { time: "2:45 PM", action: "John Smith checked in", type: "checkin" },
    { time: "2:42 PM", action: "Treadmill #3 marked for maintenance", type: "maintenance" },
    { time: "2:38 PM", action: "Sarah Johnson booked trainer session", type: "booking" },
    { time: "2:35 PM", action: "New member registration: Mike Davis", type: "new_member" },
    { time: "2:30 PM", action: "Equipment inspection completed", type: "inspection" }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        currentMembers: Math.max(15, Math.min(80, prev.currentMembers + Math.floor(Math.random() * 3) - 1)),
        equipmentInUse: Math.max(10, Math.min(25, prev.equipmentInUse + Math.floor(Math.random() * 3) - 1)),
        checkInsToday: prev.checkInsToday + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [open]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkin": return <UserCheck className="h-4 w-4 text-green-500" />;
      case "maintenance": return <Dumbbell className="h-4 w-4 text-red-500" />;
      case "booking": return <Clock className="h-4 w-4 text-blue-500" />;
      case "new_member": return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Gym Dashboard
            <Badge variant="secondary" className="ml-2">Live</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Members</p>
                  <p className="text-2xl font-bold text-green-600">{liveStats.currentMembers}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={(liveStats.currentMembers / 100) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Capacity: {liveStats.capacity}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Equipment in Use</p>
                  <p className="text-2xl font-bold text-blue-600">{liveStats.equipmentInUse}</p>
                </div>
                <Dumbbell className="h-8 w-8 text-blue-500" />
              </div>
              <Progress value={(liveStats.equipmentInUse / 25) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Out of 25 total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-ins Today</p>
                  <p className="text-2xl font-bold text-purple-600">{liveStats.checkInsToday}</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Peak: {liveStats.peakHours}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Today</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(liveStats.revenueToday)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +{liveStats.newMembersToday} new members
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Real-time gym activity feed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Session Time</span>
                <span className="font-semibold">{liveStats.avgSessionTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Peak Hours</span>
                <span className="font-semibold">{liveStats.peakHours}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Equipment Utilization</span>
                <span className="font-semibold">{Math.round((liveStats.equipmentInUse / 25) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Member Satisfaction</span>
                <span className="font-semibold">4.8/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveDashboardModal;
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  ShoppingCart, 
  BarChart3, 
  Users, 
  Settings, 
  Hotel,
  CreditCard,
  Package,
  ChefHat,
  Building,
  Dumbbell,
  Gamepad2,
  Truck,
  Star,
  Crown,
  Gem,
  KeyRound,
  Castle,
  UserPlus,
  LogOut,
  Shield
} from "lucide-react";
import { useGlobalSettings } from "@/contexts/HotelSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Hotel Services", url: "/pos", icon: ShoppingCart },
  { title: "Restaurant POS", url: "/pos/restaurant", icon: ChefHat },
  { title: "Bookings", url: "/admin/bookings", icon: Calendar },
  { title: "Rooms", url: "/admin/rooms", icon: Hotel },
  { title: "Halls", url: "/admin/halls", icon: Building },
  { title: "Gym", url: "/admin/gym", icon: Dumbbell },
  { title: "Game Center", url: "/admin/game-center", icon: Gamepad2 },
  { title: "Guests", url: "/admin/guests", icon: Users },
  { title: "Menu Management", url: "/admin/menu", icon: ChefHat },
  { title: "Recipe Management", url: "/admin/recipes", icon: ChefHat },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Inventory", url: "/admin/inventory", icon: Package },
  { title: "Suppliers", url: "/admin/suppliers", icon: Truck },
  { title: "Accounting", url: "/admin/accounting", icon: BarChart3 },
  { title: "HR Management", url: "/admin/hr", icon: Users },
  { title: "Housekeeping", url: "/admin/housekeeping", icon: Home },
];

const adminItems = [
  { title: "User Management", url: "/admin/users", icon: UserPlus, adminOnly: true },
  { title: "Settings", url: "/admin/settings", icon: Settings, adminOnly: true },
];

export function HotelSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { settings } = useGlobalSettings();
  const { profile, signOut, isAdmin } = useAuth();

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `w-full ${isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"}`;

  // Get the appropriate icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Hotel,
      Home,
      Building,
      Castle,
      Star,
      Crown,
      Gem,
      Key: KeyRound,
    };
    return iconMap[iconName] || Hotel;
  };

  const IconComponent = getIconComponent(settings.hotel_icon || "Hotel");

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"}>
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <IconComponent className="h-6 w-6 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="text-lg font-bold text-foreground">{settings.hotel_name}</h2>
              <p className="text-sm text-muted-foreground">Hotel Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="mr-3 h-5 w-5" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <Shield className="h-4 w-4 mr-2" />
              {state !== "collapsed" && "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-5 w-5" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="p-2 border-t border-border">
                  {state !== "collapsed" && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {profile?.role}
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="w-full justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {state !== "collapsed" && "Sign Out"}
                  </Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
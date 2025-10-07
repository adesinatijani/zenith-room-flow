import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { HotelSettingsProvider } from "@/contexts/HotelSettingsContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { HotelLayout } from "./components/layout/HotelLayout";
import { MobileWrapper } from "./components/mobile/MobileWrapper";
import { applyThemeColors } from "./utils/themeColors";
import { updateSiteSettings } from "./utils/dynamicSiteSettings";
import MobileStaffLogin from "./components/mobile/MobileStaffLogin";
import MobileStaffDashboard from "./components/mobile/MobileStaffDashboard";
import Index from "./pages/Index";
import BookingPage from "./pages/BookingPage";
import POSSystem from "./pages/POSSystem";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import RecipeManagement from "./pages/RecipeManagement";
import MenuManagement from "./pages/MenuManagement";
import RoomManagement from "./pages/RoomManagement";
import HallManagement from "./pages/HallManagement";
import GymManagement from "./pages/GymManagement";
import GameCenter from "./pages/GameCenter";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingManagement from "./pages/BookingManagement";
import GuestManagement from "./pages/GuestManagement";
import PaymentsManagement from "./pages/PaymentsManagement";
import InventoryManagement from "./pages/InventoryManagement";
import AccountingModule from "./pages/AccountingModuleEnhanced";
import HRManagement from "./pages/HRManagement";
import HousekeepingManagement from "./pages/HousekeepingManagement";
import RestaurantPOS from "./components/pos/RestaurantPOS";
import SupplierManagement from "./pages/SupplierManagement";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import RoomsPage from "./pages/RoomsPage";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import DocumentationPage from "./pages/DocumentationPage";
import ContentManagement from "./pages/ContentManagement";

const queryClient = new QueryClient();

// Force refresh to clear cache

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme colors on mount
  useEffect(() => {
    applyThemeColors();
    updateSiteSettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HotelSettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <MobileWrapper>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
              <Routes>
                {/* Mobile Staff Routes */}
                <Route path="/mobile/staff-login" element={<MobileStaffLogin />} />
                <Route path="/mobile/staff-dashboard" element={
                  <ProtectedRoute>
                    <MobileStaffDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Auth routes */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/rooms" element={<RoomsPage />} />
                <Route path="/book" element={<BookingPage />} />
                
                {/* Protected Admin/Staff routes with sidebar layout */}
                <Route path="/pos" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <POSSystem />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/pos/restaurant" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <RestaurantPOS />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <AdminDashboard />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <HotelLayout>
                      <UserManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <HotelLayout>
                      <Settings />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/content" element={
                  <ProtectedRoute requiredRole="admin">
                    <HotelLayout>
                      <ContentManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/recipes" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <RecipeManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/menu" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <MenuManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/rooms" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <RoomManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/halls" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <HallManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <BookingManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/gym" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <GymManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/game-center" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <GameCenter />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/admin/guests" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <GuestManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/payments" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <PaymentsManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/inventory" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <InventoryManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/suppliers" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <SupplierManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/accounting" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <AccountingModule />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/hr" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <HRManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/housekeeping" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <HousekeepingManagement />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <Analytics />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute>
                    <HotelLayout>
                      <Reports />
                    </HotelLayout>
                  </ProtectedRoute>
                } />
                <Route path="/documentation" element={<DocumentationPage />} />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
                </div>
              </SidebarProvider>
              </MobileWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </HotelSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
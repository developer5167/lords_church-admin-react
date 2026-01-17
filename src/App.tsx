import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import CreateService from "./pages/CreateService";
import QRCodeView from "./pages/QRCodeView";
import Attendance from "./pages/Attendance";
import PaymentLink from "./pages/PaymentLink";
import BaptismRequests from "./pages/BaptismRequests";
import VolunteerRequests from "./pages/VolunteerRequests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CreateEvent />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-service/:eventId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CreateService />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qr/:serviceId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <QRCodeView />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/:serviceId"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Attendance />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-link"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PaymentLink />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/baptism-requests"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <BaptismRequests />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/volunteer-requests"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <VolunteerRequests />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

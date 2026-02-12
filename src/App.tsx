import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SocketProvider } from "@/lib/socket-context";
import { AdminAuthProvider, useAdminAuth } from "@/admin/lib/admin-auth-context";
import { SuperAdminAuthProvider, useSuperAdminAuth } from "@/admin/lib/super-admin-auth-context";
import { Loader2 } from "lucide-react";
import React, { Suspense, lazy } from "react";
import { FeedSkeleton } from "@/components/Skeletons";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Explore = lazy(() => import("./pages/Explore"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminRegister = lazy(() => import("./admin/pages/AdminRegister"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const SuperAdminLogin = lazy(() => import("./admin/pages/SuperAdminLogin"));
const SuperAdminRegister = lazy(() => import("./admin/pages/SuperAdminRegister"));
const SuperAdminDashboard = lazy(() => import("./admin/pages/SuperAdminDashboard"));

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function SuperAdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { superAdmin, loading } = useSuperAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!superAdmin) {
    return <Navigate to="/superadmin/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <SocketProvider>
            <AdminAuthProvider>
              <SuperAdminAuthProvider>
                <Routes>
                  {/* User routes */}
                  <Route path="/auth" element={<PublicRoute><Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><Auth /></Suspense></PublicRoute>} />
                  <Route path="/" element={<ProtectedRoute><Suspense fallback={<div className="max-w-2xl mx-auto w-full pt-20 px-4"><FeedSkeleton /></div>}><Home /></Suspense></ProtectedRoute>} />
                  <Route path="/explore" element={<ProtectedRoute><Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><Explore /></Suspense></ProtectedRoute>} />
                  <Route path="/profile/:username" element={<ProtectedRoute><Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><Profile /></Suspense></ProtectedRoute>} />

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><AdminLogin /></Suspense>} />
                  <Route path="/admin/register" element={<Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><AdminRegister /></Suspense>} />
                  <Route path="/admin/dashboard" element={<AdminProtectedRoute><Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><AdminDashboard /></Suspense></AdminProtectedRoute>} />

                  {/* Super Admin routes */}
                  <Route path="/superadmin/login" element={<Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><SuperAdminLogin /></Suspense>} />
                  <Route path="/superadmin/register" element={<Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><SuperAdminRegister /></Suspense>} />
                  <Route path="/superadmin/dashboard" element={<SuperAdminProtectedRoute><Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mt-20" />}><SuperAdminDashboard /></Suspense></SuperAdminProtectedRoute>} />

                  <Route path="*" element={<Suspense fallback={<div />}><NotFound /></Suspense>} />
                </Routes>
              </SuperAdminAuthProvider>
            </AdminAuthProvider>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

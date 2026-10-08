import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { GuestRoute } from "@/components/guards/GuestRoute";
import { LoginPage } from "@/pages/auth/Login";
import { SignupPage } from "@/pages/auth/Signup";
import { AdminDashboardPlaceholder } from "@/pages/admin/DashboardPlaceholder";
import { DeliveryRulesPage } from "@/pages/admin/DeliveryRules";
import { RestaurantDashboardPlaceholder } from "@/pages/restaurant/DashboardPlaceholder";
import { UnauthorizedPage } from "@/pages/Unauthorized";
import { NotFoundPage } from "@/pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest-only routes (redirects authenticated users to their dashboard) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPlaceholder />} />
            <Route path="/admin/settings/delivery" element={<DeliveryRulesPage />} />
          </Route>

          {/* Restaurant Partner Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["restaurant_owner", "admin"]} />}>
            <Route
              path="/restaurant"
              element={<Navigate to="/restaurant/dashboard" replace />}
            />
            <Route
              path="/restaurant/dashboard"
              element={<RestaurantDashboardPlaceholder />}
            />
          </Route>

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Error and Fallback Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";
import { PublicRoute } from "./PublicRoute.jsx";
import { StoreLayout } from "../layouts/StoreLayout.jsx";
import { HomePage } from "../pages/customer/HomePage.jsx";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage.jsx";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage.jsx";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage.jsx";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with StoreLayout */}
      <Route path="/" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      
      {/* Auth Routes - Public Only */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Customer Routes - Protected */}
      {/* Add customer routes here when pages are created */}
      {/* Example:
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        }
      />
      */}

      {/* Seller Routes - Role Protected */}
      {/* Add seller routes here when pages are created */}
      {/* Example:
      <Route
        path="/seller/dashboard"
        element={
          <RoleRoute allowedRoles={["seller", "admin"]}>
            <SellerDashboard />
          </RoleRoute>
        }
      />
      */}

      {/* Admin Routes - Role Protected */}
      {/* Add admin routes here when pages are created */}
      {/* Example:
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      */}
    </Routes>
  );
};

import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";
import { PublicRoute } from "./PublicRoute.jsx";
import { StoreLayout } from "../layouts/StoreLayout.jsx";
import { AccountLayout } from "../layouts/AccountLayout.jsx";
import { HomePage } from "../pages/customer/HomePage.jsx";
import { ShopPage } from "../pages/customer/ShopPage.jsx";
import { ProductDetailsPage } from "../pages/customer/ProductDetailsPage.jsx";
import { CartPage } from "../pages/customer/CartPage.jsx";
import { WishlistPage } from "../pages/customer/WishlistPage.jsx";
import { ProfilePage } from "../pages/customer/ProfilePage.jsx";
import { AddressesPage } from "../pages/customer/AddressesPage.jsx";
import { OrdersPage } from "../pages/customer/OrdersPage.jsx";
import { OrderDetailsPage } from "../pages/customer/OrderDetailsPage.jsx";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { RegisterPage } from "../pages/auth/RegisterPage.jsx";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage.jsx";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage.jsx";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage.jsx";
import { CheckoutPage } from "../pages/customer/CheckoutPage.jsx";
import { OrderConfirmationPage } from "../pages/customer/OrderConfirmationPage.jsx";
import { PaymentSuccessPage } from "../pages/customer/PaymentSuccessPage.jsx";
import { PaymentFailedPage } from "../pages/customer/PaymentFailedPage.jsx";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with StoreLayout */}
      <Route path="/" element={<StoreLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="product/:slug" element={<ProductDetailsPage />} />
        <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
        <Route path="payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
        <Route path="payment/failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
        
        {/* Account Routes */}
        <Route element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
        </Route>
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

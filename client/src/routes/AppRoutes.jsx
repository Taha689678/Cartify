import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";
import { PublicRoute } from "./PublicRoute.jsx";
import { StoreLayout } from "../layouts/StoreLayout.jsx";
import { AccountLayout } from "../layouts/AccountLayout.jsx";
import { SellerLayout } from "../layouts/SellerLayout.jsx";
import { AdminLayout } from "../components/layout/AdminLayout.jsx";
import { Loader2 } from "lucide-react";

// Lazy loaded pages
const HomePage = lazy(() => import("../pages/customer/HomePage.jsx").then(m => ({ default: m.HomePage })));
const ShopPage = lazy(() => import("../pages/customer/ShopPage.jsx").then(m => ({ default: m.ShopPage })));
const ProductDetailsPage = lazy(() => import("../pages/customer/ProductDetailsPage.jsx").then(m => ({ default: m.ProductDetailsPage })));
const AboutPage = lazy(() => import("../pages/customer/AboutPage.jsx").then(m => ({ default: m.AboutPage })));
const CareersPage = lazy(() => import("../pages/customer/CareersPage.jsx").then(m => ({ default: m.CareersPage })));
const ContactPage = lazy(() => import("../pages/customer/ContactPage.jsx").then(m => ({ default: m.ContactPage })));
const TrackOrderPage = lazy(() => import("../pages/customer/TrackOrderPage.jsx").then(m => ({ default: m.TrackOrderPage })));
const ReturnsPage = lazy(() => import("../pages/customer/ReturnsPage.jsx").then(m => ({ default: m.ReturnsPage })));
const FAQPage = lazy(() => import("../pages/customer/FAQPage.jsx").then(m => ({ default: m.FAQPage })));
const PrivacyPolicyPage = lazy(() => import("../pages/customer/PrivacyPolicyPage.jsx").then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import("../pages/customer/TermsPage.jsx").then(m => ({ default: m.TermsPage })));
const CookiePolicyPage = lazy(() => import("../pages/customer/CookiePolicyPage.jsx").then(m => ({ default: m.CookiePolicyPage })));
const CartPage = lazy(() => import("../pages/customer/CartPage.jsx").then(m => ({ default: m.CartPage })));
const WishlistPage = lazy(() => import("../pages/customer/WishlistPage.jsx").then(m => ({ default: m.WishlistPage })));
const ProfilePage = lazy(() => import("../pages/customer/ProfilePage.jsx").then(m => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("../pages/customer/SettingsPage.jsx").then(m => ({ default: m.SettingsPage })));
const PasswordSettingsPage = lazy(() => import("../pages/customer/PasswordSettingsPage.jsx").then(m => ({ default: m.PasswordSettingsPage })));
const AddressesPage = lazy(() => import("../pages/customer/AddressesPage.jsx").then(m => ({ default: m.AddressesPage })));
const OrdersPage = lazy(() => import("../pages/customer/OrdersPage.jsx").then(m => ({ default: m.OrdersPage })));
const OrderDetailsPage = lazy(() => import("../pages/customer/OrderDetailsPage.jsx").then(m => ({ default: m.OrderDetailsPage })));
const LoginPage = lazy(() => import("../pages/auth/LoginPage.jsx").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage.jsx").then(m => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailPage.jsx").then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage.jsx").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage.jsx").then(m => ({ default: m.ResetPasswordPage })));
const CheckoutPage = lazy(() => import("../pages/customer/CheckoutPage.jsx").then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import("../pages/customer/OrderConfirmationPage.jsx").then(m => ({ default: m.OrderConfirmationPage })));
const PaymentSuccessPage = lazy(() => import("../pages/customer/PaymentSuccessPage.jsx").then(m => ({ default: m.PaymentSuccessPage })));
const PaymentFailedPage = lazy(() => import("../pages/customer/PaymentFailedPage.jsx").then(m => ({ default: m.PaymentFailedPage })));

const SellerDashboardPage = lazy(() => import("../pages/seller/SellerDashboardPage.jsx").then(m => ({ default: m.SellerDashboardPage })));
const SellerProductsPage = lazy(() => import("../pages/seller/SellerProductsPage.jsx").then(m => ({ default: m.SellerProductsPage })));
const CreateProductPage = lazy(() => import("../pages/seller/CreateProductPage.jsx").then(m => ({ default: m.CreateProductPage })));
const EditProductPage = lazy(() => import("../pages/seller/EditProductPage.jsx").then(m => ({ default: m.EditProductPage })));
const SellerOrdersPage = lazy(() => import("../pages/seller/SellerOrdersPage.jsx").then(m => ({ default: m.SellerOrdersPage })));
const SellerOrderDetailsPage = lazy(() => import("../pages/seller/SellerOrderDetailsPage.jsx").then(m => ({ default: m.SellerOrderDetailsPage })));

const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage.jsx").then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage.jsx").then(m => ({ default: m.AdminUsersPage })));
const AdminSellerApplicationsPage = lazy(() => import("../pages/admin/AdminSellerApplicationsPage.jsx").then(m => ({ default: m.AdminSellerApplicationsPage })));
const AdminSellersPage = lazy(() => import("../pages/admin/AdminSellersPage.jsx").then(m => ({ default: m.AdminSellersPage })));
const BecomeSellerPage = lazy(() => import("../pages/customer/BecomeSellerPage.jsx").then(m => ({ default: m.BecomeSellerPage })));
const AdminProductsPage = lazy(() => import("../pages/admin/AdminProductsPage.jsx").then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import("../pages/admin/AdminCategoriesPage.jsx").then(m => ({ default: m.AdminCategoriesPage })));
const AdminOrdersPage = lazy(() => import("../pages/admin/AdminOrdersPage.jsx").then(m => ({ default: m.AdminOrdersPage })));
const AdminReviewsPage = lazy(() => import("../pages/admin/AdminReviewsPage.jsx").then(m => ({ default: m.AdminReviewsPage })));

const PageLoader = () => (
  <div className="flex h-[70vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes with StoreLayout */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:slug" element={<ProductDetailsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="track-order" element={<TrackOrderPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="cookie-policy" element={<CookiePolicyPage />} />
          <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
          <Route path="payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
          <Route path="payment/failed" element={<ProtectedRoute><PaymentFailedPage /></ProtectedRoute>} />
          
          {/* Account Routes */}
          <Route element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/password" element={<PasswordSettingsPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="become-seller" element={<BecomeSellerPage />} />
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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />

        {/* Seller Routes */}
        <Route
          path="/seller"
          element={
            <RoleRoute allowedRoles={["seller"]}>
              <SellerLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<SellerDashboardPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="products/new" element={<CreateProductPage />} />
          <Route path="products/:id/edit" element={<EditProductPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="orders/:id" element={<SellerOrderDetailsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="seller-applications" element={<AdminSellerApplicationsPage />} />
          <Route path="sellers" element={<AdminSellersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

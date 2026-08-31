import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { RoleRoute } from "./RoleRoute.jsx";
import { PublicRoute } from "./PublicRoute.jsx";
import { StoreLayout } from "../layouts/StoreLayout.jsx";
import { AccountLayout } from "../layouts/AccountLayout.jsx";
import { HomePage } from "../pages/customer/HomePage.jsx";
import { ShopPage } from "../pages/customer/ShopPage.jsx";
import { ProductDetailsPage } from "../pages/customer/ProductDetailsPage.jsx";
import { AboutPage } from "../pages/customer/AboutPage.jsx";
import { CareersPage } from "../pages/customer/CareersPage.jsx";
import { ContactPage } from "../pages/customer/ContactPage.jsx";
import { TrackOrderPage } from "../pages/customer/TrackOrderPage.jsx";
import { ReturnsPage } from "../pages/customer/ReturnsPage.jsx";
import { FAQPage } from "../pages/customer/FAQPage.jsx";
import { PrivacyPolicyPage } from "../pages/customer/PrivacyPolicyPage.jsx";
import { TermsPage } from "../pages/customer/TermsPage.jsx";
import { CookiePolicyPage } from "../pages/customer/CookiePolicyPage.jsx";
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
import { SellerLayout } from "../layouts/SellerLayout.jsx";
import { SellerDashboardPage } from "../pages/seller/SellerDashboardPage.jsx";
import { SellerProductsPage } from "../pages/seller/SellerProductsPage.jsx";
import { CreateProductPage } from "../pages/seller/CreateProductPage.jsx";
import { EditProductPage } from "../pages/seller/EditProductPage.jsx";
import { SellerOrdersPage } from "../pages/seller/SellerOrdersPage.jsx";
import { SellerOrderDetailsPage } from "../pages/seller/SellerOrderDetailsPage.jsx";

// Admin Imports
import { AdminLayout } from "../components/layout/AdminLayout.jsx";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage.jsx";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage.jsx";
import { AdminSellerApplicationsPage } from "../pages/admin/AdminSellerApplicationsPage.jsx";
import { BecomeSellerPage } from "../pages/customer/BecomeSellerPage.jsx";
import { AdminProductsPage } from "../pages/admin/AdminProductsPage.jsx";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage.jsx";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage.jsx";
import { AdminOrderDetailsPage } from "../pages/admin/AdminOrderDetailsPage.jsx";
import { AdminReviewsPage } from "../pages/admin/AdminReviewsPage.jsx";

export const AppRoutes = () => {
  return (
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
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="order-confirmation/:id"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/failed"
          element={
            <ProtectedRoute>
              <PaymentFailedPage />
            </ProtectedRoute>
          }
        />

        {/* Account Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<ProfilePage />} />
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

      {/* Admin Routes - Role Protected */}
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
        <Route
          path="seller-applications"
          element={<AdminSellerApplicationsPage />}
        />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
      </Route>
    </Routes>
  );
};

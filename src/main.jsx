import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

// Auth pages
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import ForgetPasswordPage from './pages/forget-password.jsx';
import ResetPasswordPage from './pages/reset-password.jsx';
import VerifyRegisterOTPPage from './pages/verify-register-otp.jsx';

// Admin pages
import AdminHomePage from './pages/admin-pages/homepage.jsx';
import UserPage from './components/admin-components/user/user.jsx';
import ProductPage from './components/admin-components/product/product.jsx';

// Customer pages
import CustomerHomePage from './pages/customer-pages/home.jsx';
import ProductListPage from './pages/customer-pages/product-list.jsx';
import ProductDetailPage from './pages/customer-pages/product-detail.jsx';
import CartPage from './pages/customer-pages/cart.jsx';
import CheckoutPage from './pages/customer-pages/checkout.jsx';
import PaymentResultPage from './pages/customer-pages/payment-result.jsx';
import OrdersPage from './pages/customer-pages/orders.jsx';
import PaymentsPage from './pages/customer-pages/payments.jsx';
import ProfilePage from './pages/customer-pages/profile.jsx';

// Staff pages
import SupportOrdersPage from './pages/staff-pages/support-orders.jsx';
import OperationsOrdersPage from './pages/staff-pages/operations-orders.jsx';

// Layouts
import { AuthWrapper } from './context/auth.context.jsx';
import CustomerLayout from './CustomerLayout.jsx';
import AdminLayout from './AdminLayout.jsx';
import ErrorPage from './pages/error/error.page.jsx';
import PrivateRoute from './pages/admin-pages/private.route.jsx';
import ComboPage from './components/admin-components/combo/combo.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // Root redirect
      { index: true, element: <Navigate to="/login" replace /> },

      // --- CUSTOMER ---
      {
        path: "customer",
        element: <CustomerLayout />,
        children: [
          { index: true, element: <CustomerHomePage /> },
          { path: "products", element: <ProductListPage /> },
          { path: "products/:id", element: <ProductDetailPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "payment-result", element: <PaymentResultPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "profile", element: <ProfilePage /> },
        ]
      },

      // --- ADMIN / MANAGER ---
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/login" replace /> },
          {
            path: "homepage", element: (<PrivateRoute><AdminHomePage /></PrivateRoute>),
          },
          {
            path: "users", element: (<PrivateRoute><UserPage /></PrivateRoute>),
          },
          {
            path: "products", element: (<PrivateRoute><ProductPage /></PrivateRoute>),
          },
          {
            path: "combo", element: (<PrivateRoute><ComboPage/></PrivateRoute>),
          }
        ]
      },

      // --- SUPPORT STAFF ---
      { path: "staff/support", element: <SupportOrdersPage /> },
      { path: "staff/support/orders", element: <SupportOrdersPage /> },

      // --- OPERATIONS STAFF ---
      { path: "staff/operations", element: <OperationsOrdersPage /> },
      { path: "staff/operations/orders", element: <OperationsOrdersPage /> },
    ]
  },

  // Auth routes (outside layout)
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-register-otp", element: <VerifyRegisterOTPPage /> },
  { path: "/forget-password", element: <ForgetPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/payment-result", element: <PaymentResultPage /> },
  // Catch-all route for 404
  {
    path: "*",
    element: <ErrorPage />
  }]);

createRoot(document.getElementById('root')).render(
  <AuthWrapper>
    <RouterProvider router={router} />
  </AuthWrapper>
)


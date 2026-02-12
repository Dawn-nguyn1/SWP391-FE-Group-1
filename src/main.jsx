import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import ForgetPasswordPage from './pages/forget-password.jsx';
import ResetPasswordPage from './pages/reset-password.jsx';
import HomePage from './pages/homepage.jsx';
import ProductCatalog from './pages/ProductCatalog.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutFlow from './pages/CheckoutFlow.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import OrderManagement from './pages/admin/OrderManagement.jsx';
import UserPage from './components/user/user.jsx';
import ProductPage from './components/product/product.jsx';
import { AuthWrapper } from './context/auth.context.jsx';
import { CartProvider } from './context/cart.context.jsx';

import StorefrontLayout from './components/layout/StorefrontLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/homepage" replace />,
      },
      {
        element: <StorefrontLayout />,
        children: [
          {
            path: "homepage",
            element: <HomePage />,
          },
          {
            path: "products",
            element: <ProductCatalog />,
          },
          {
            path: "product/:id",
            element: <ProductDetailPage />,
          },
          {
            path: "cart",
            element: <CartPage />,
          },
          {
            path: "checkout",
            element: <CheckoutFlow />,
          },
          {
            path: "account",
            element: <UserDashboard />,
          },
          // Thêm các trang cho khách hàng ở đây
        ]
      },
      {
        path: "admin",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Chào mừng đến với Quản trị hệ thống</div>,
          },
          {
            path: "users",
            element: <UserPage />,
          },
          {
            path: "products",
            element: <ProductPage />,
          },
          {
            path: "orders",
            element: <OrderManagement />,
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forget-password",
    element: <ForgetPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
]);


createRoot(document.getElementById('root')).render(
  //  <React.StrictMode>
  <CartProvider>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </CartProvider>
  // </React.StrictMode>
)

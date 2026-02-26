import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import ForgetPasswordPage from './pages/forget-password.jsx';
import ResetPasswordPage from './pages/reset-password.jsx';
import HomePage from './pages/admin-pages/homepage.jsx';
import UserPage from './components/admin-components/user/user.jsx';
import ProductPage from './components/admin-components/product/product.jsx';
import { AuthWrapper } from './context/auth.context.jsx';
import CustomerLayout from './CustomerLayout.jsx';
import AdminLayout from './AdminLayout.jsx';
import ErrorPage from './pages/error/error.page.jsx';
import PrivateRoute from './pages/admin-pages/private.route.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // --- NHÓM 1: CUSTOMER ---
      {
        path: "/customer",
        element: <CustomerLayout />, // Layout có Navbar/Footer của khách
        // children: [
        //   { index: true, element: <UserHomePage /> },
        //   { path: "product/:id", element: <ProductDetail /> },
        // ]
      },

      // --- NHÓM 2: ADMIN ---
      {
        path: "/admin",
        element: <AdminLayout />, // Layout có Sidebar của Admin
        children: [
          {
            index: true,
            element: <Navigate to="/login" replace />,
          },
          {
            path: "homepage",
            element: (<PrivateRoute><HomePage /></PrivateRoute>),
          },
          {
            path: "users",
            element: (<PrivateRoute><UserPage /></PrivateRoute>),

          },
          {
            path: "products",
            element: (<PrivateRoute><ProductPage /></PrivateRoute>),

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
  // Catch-all route for 404
  {
    path: "*",
    element: <ErrorPage />
  }
]); //khai bao router


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <AuthWrapper>
    <RouterProvider router={router} />
  </AuthWrapper>
  // </StrictMode>,
)

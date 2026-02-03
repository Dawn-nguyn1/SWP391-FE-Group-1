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
import HomePage from './pages/homepage.jsx';
import UserPage from './components/user/user.jsx';
import { AuthWrapper } from './context/auth.context.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // errorElement: <ErrorPage />,
    children: [
       {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        //home page
        path: "/homepage",
        element: <HomePage />,

      },
      {
        //user management
        path: "/users",
        element: <UserPage/>,
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

]); //khai bao router


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <AuthWrapper>
  <RouterProvider router={router} />
  </AuthWrapper>
  // </StrictMode>,
)

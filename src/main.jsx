import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

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
import CartPage from './pages/customer-pages/cart.jsx';
import CheckoutPage from './pages/customer-pages/checkout.jsx';
import PaymentResultPage from './pages/customer-pages/payment-result.jsx';
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
import CampaignPage from './components/admin-components/campaign/campaign.jsx';

const ProductDetailPage = lazy(() => import('./pages/customer-pages/product-detail.jsx'));
const OrdersPage = lazy(() => import('./pages/customer-pages/orders.jsx'));
const PaymentsPage = lazy(() => import('./pages/customer-pages/payments.jsx'));
const PreorderCampaignListPage = lazy(() => import('./pages/customer-pages/preorder-campaign-list.jsx'));
const PreorderCampaignDetailPage = lazy(() => import('./pages/customer-pages/preorder-campaign-detail.jsx'));

const RouteFallback = ({ label }) => (
  <div
    style={{
      minHeight: '52vh',
      display: 'grid',
      placeItems: 'center',
      padding: '32px 20px',
      background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
    }}
  >
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '48px',
        padding: '0 20px',
        borderRadius: '999px',
        background: 'rgba(255, 247, 237, 0.96)',
        border: '1px solid rgba(191, 114, 39, 0.12)',
        color: '#9a3412',
        fontWeight: 800,
        boxShadow: '0 14px 32px rgba(118, 66, 17, 0.08)',
      }}
    >
      {label}
    </span>
  </div>
);

const withCustomerSuspense = (element, label = 'Đang tải trải nghiệm mua sắm...') => (
  <Suspense fallback={<RouteFallback label={label} />}>
    {element}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: 'customer',
        element: <CustomerLayout />,
        children: [
          { index: true, element: <CustomerHomePage /> },
          { path: 'products', element: <ProductListPage /> },
          { path: 'products/:id', element: withCustomerSuspense(<ProductDetailPage />, 'Đang tải chi tiết sản phẩm...') },
          { path: 'preorder-campaigns', element: withCustomerSuspense(<PreorderCampaignListPage />, 'Đang tải chiến dịch đặt trước...') },
          { path: 'preorder-campaigns/:campaignId', element: withCustomerSuspense(<PreorderCampaignDetailPage />, 'Đang tải chiến dịch đặt trước...') },
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'payment-result', element: <PaymentResultPage /> },
          { path: 'orders', element: withCustomerSuspense(<OrdersPage />, 'Đang tải đơn hàng của bạn...') },
          { path: 'payments', element: withCustomerSuspense(<PaymentsPage />, 'Đang tải lịch sử thanh toán...') },
          { path: 'profile', element: <ProfilePage /> },
        ]
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/login" replace /> },
          { path: 'homepage', element: (<PrivateRoute><AdminHomePage /></PrivateRoute>) },
          { path: 'users', element: (<PrivateRoute><UserPage /></PrivateRoute>) },
          { path: 'products', element: (<PrivateRoute><ProductPage /></PrivateRoute>) },
          { path: 'combo', element: (<PrivateRoute><ComboPage /></PrivateRoute>) },
          { path: 'campaign', element: (<PrivateRoute><CampaignPage /></PrivateRoute>) }
        ]
      },
      { path: 'staff/support', element: <SupportOrdersPage /> },
      { path: 'staff/support/orders', element: <SupportOrdersPage /> },
      { path: 'staff/operations', element: <OperationsOrdersPage /> },
      { path: 'staff/operations/orders', element: <OperationsOrdersPage /> },
    ]
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-register-otp', element: <VerifyRegisterOTPPage /> },
  { path: '/forget-password', element: <ForgetPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/payment-result', element: <PaymentResultPage /> },
  { path: '*', element: <ErrorPage /> }
]);

createRoot(document.getElementById('root')).render(
  <AuthWrapper>
    <RouterProvider router={router} />
  </AuthWrapper>
);

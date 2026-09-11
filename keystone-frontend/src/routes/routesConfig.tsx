import type { RouteObject } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Public pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Protected pages
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import WorkOrderPage from '../pages/WorkOrderPage';
import DispatchPage from '../pages/DispatchPage';
import CustomerPage from '../pages/CustomerPage';
import CustomerPortalPage from '../pages/CustomerPortalPage';
import AssetPage from '../pages/AssetPage';
import InventoryPage from '../pages/InventoryPage';
import SlaPage from '../pages/SlaPage';
import ReportPage from '../pages/ReportPage';
import SettingsPage from '../pages/SettingsPage';
import TechnicianPage from '../pages/TechnicianPage';
import NotificationPage from '../pages/NotificationPage';

// Guards
import { AuthGuard, RoleGuard } from './guards';

export const routesConfig: RouteObject[] = [
  // Public Routes
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // Protected Routes Wrapper
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/profile', element: <ProfilePage /> },

          // Admin, Dispatcher, Technician, Auditor Work Orders
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_AUDITOR']} />,
            children: [{ path: '/work-orders', element: <WorkOrderPage /> }],
          },

          // Admin, Dispatcher Dispatch Center
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER']} />,
            children: [{ path: '/dispatch', element: <DispatchPage /> }],
          },

          // Admin, Dispatcher Technicians
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER']} />,
            children: [{ path: '/technicians', element: <TechnicianPage /> }],
          },

          // Admin, Dispatcher, Technician Calendar Board
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN']} />,
            children: [{ path: '/calendar', element: <DispatchPage /> }],
          },

          // Admin, Dispatcher, Auditor Customer directory
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_AUDITOR']} />,
            children: [{ path: '/customers', element: <CustomerPage /> }],
          },

          // Customer portal Only
          {
            element: <RoleGuard allowedRoles={['ROLE_CUSTOMER']} />,
            children: [{ path: '/customer-portal', element: <CustomerPortalPage /> }],
          },

          // All authenticated roles see Assets
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_CUSTOMER', 'ROLE_AUDITOR']} />,
            children: [{ path: '/assets', element: <AssetPage /> }],
          },

          // Admin, Dispatcher, Technician, Auditor Inventory stocks
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_AUDITOR']} />,
            children: [{ path: '/inventory', element: <InventoryPage /> }],
          },

          // Admin, Dispatcher SLA dashboard
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER']} />,
            children: [{ path: '/sla', element: <SlaPage /> }],
          },

          // Admin, Dispatcher, Auditor Reports
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_AUDITOR']} />,
            children: [{ path: '/reports', element: <ReportPage /> }],
          },

          // Admin, Auditor Audit Logs logs settings
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_AUDITOR']} />,
            children: [
              { path: '/audit-logs', element: <SettingsPage /> },
              { path: '/settings', element: <SettingsPage /> }
            ],
          },

          // All authenticated roles see notifications
          {
            element: <RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_DISPATCHER', 'ROLE_TECHNICIAN', 'ROLE_CUSTOMER', 'ROLE_AUDITOR']} />,
            children: [{ path: '/notifications', element: <NotificationPage /> }],
          },
        ],
      },
    ],
  },

  // 404 handler
  { path: '*', element: <NotFoundPage /> },
];
export default routesConfig;

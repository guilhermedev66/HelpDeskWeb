import type { RouteObject } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { DashboardPlaceholder } from './DashboardPlaceholder';
import { ProtectedRoute } from './ProtectedRoute';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [{ index: true, element: <DashboardPlaceholder /> }],
      },
    ],
  },
];

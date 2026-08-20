import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { TicketsListPage } from '../features/tickets/TicketsListPage';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { NewTicketPlaceholder } from './NewTicketPlaceholder';
import { ProtectedRoute } from './ProtectedRoute';
import { TicketDetailsPlaceholder } from './TicketDetailsPlaceholder';

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          { index: true, element: <Navigate to="/tickets" replace /> },
          { path: 'tickets', element: <TicketsListPage /> },
          { path: 'tickets/new', element: <NewTicketPlaceholder /> },
          { path: 'tickets/:ticketId', element: <TicketDetailsPlaceholder /> },
        ],
      },
    ],
  },
];

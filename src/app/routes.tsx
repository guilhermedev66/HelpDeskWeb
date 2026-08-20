import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { NewTicketPage } from '../features/tickets/NewTicketPage';
import { TicketDetailsPage } from '../features/tickets/TicketDetailsPage';
import { TicketsListPage } from '../features/tickets/TicketsListPage';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { ProtectedRoute } from './ProtectedRoute';

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
          { path: 'tickets/new', element: <NewTicketPage /> },
          { path: 'tickets/:ticketId', element: <TicketDetailsPage /> },
        ],
      },
    ],
  },
];

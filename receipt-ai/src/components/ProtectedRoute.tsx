/**
 * Protected Route Component
 * 
 * Guards routes that require authentication.
 * Redirects to login if no valid auth token is found.
 */

import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Check if user has a valid auth token
  const authToken = localStorage.getItem('authToken');
  
  // If no token, redirect to login
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }

  // Token exists, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;

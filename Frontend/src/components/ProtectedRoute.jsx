import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/UserAuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Debug logs
  console.log('ProtectedRoute - Current user:', user);
  console.log('ProtectedRoute - Allowed roles:', allowedRoles);
  console.log('ProtectedRoute - User role:', user?.role);

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log('ProtectedRoute - User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return children;
};

export default ProtectedRoute;
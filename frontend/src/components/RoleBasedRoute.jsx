import React from 'react';
import { Navigate, useLocation } from 'react-router'; // changed from 'react-router-dom' based on your package.json
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#effe8b]">
        <Loader2 className="animate-spin w-10 h-10 text-[#1a1a1a]" />
      </div>
    );
  }

  // 1. Not authenticated -> Redirect to Login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Authenticated but wrong role -> Redirect to 404 or Unauthorized
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/404" replace />;
  }

  // 3. Authorized -> Render children
  return children;
};

export default RoleBasedRoute;
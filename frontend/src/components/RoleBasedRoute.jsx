import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#effe8b]">
        <Loader2 className="w-10 h-10 animate-spin text-[#1a1a1a]" />
      </div>
    );
  }

  // 1. Not Logged In -> Redirect to Login
  // We redirect to Service Login if the user was trying to access a service route, 
  // otherwise default to Customer Login.
  if (!user) {
    const isServiceRoute = location.pathname.includes('eventManager') || location.pathname.includes('store');
    return <Navigate to={isServiceRoute ? "/service-login" : "/login"} state={{ from: location }} replace />;
  }

  // 2. Logged In but Wrong Role -> Redirect to 404 or Home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }

  // 3. Authorized
  return children;
};

export default RoleBasedRoute;
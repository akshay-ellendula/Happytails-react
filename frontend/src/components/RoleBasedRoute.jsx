import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center font-outfit relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#f2c737]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative flex flex-col items-center z-10">
          <Loader2 className="w-16 h-16 animate-spin text-[#f2c737] mb-6" />
          <div className="text-lg font-black tracking-widest uppercase text-white/80 animate-pulse">Establishing Link...</div>
        </div>
      </div>
    );
  }

  // 1. Not Logged In -> Redirect to Login
  // We redirect to Service Login if the user was trying to access a service route,
  // otherwise default to Customer Login.
  if (!user) {
    const isServiceRoute =
      location.pathname.includes("eventManager") ||
      location.pathname.includes("store") ||
      location.pathname.includes("shop") ||
      location.pathname.includes("vendor");
    return (
      <Navigate
        to={isServiceRoute ? "/service-login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  // 2. Logged In but Wrong Role -> Redirect to 404 or Home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />;
  }

  // 3. Authorized
  return children;
};

export default RoleBasedRoute;

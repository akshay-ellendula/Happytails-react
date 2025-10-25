import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextObject";
import { axiosInstance } from "../utils/axios";

// AuthContext is created in AuthContextObject, imported above.

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Role-based endpoint configuration
  const authConfig = {
    customer: {
      signin: "/auth/signin",
      signup: "/auth/signup",
    },
    eventManager: {
      signin: "/auth/eventManagerSignin",
      signup: "/auth/eventManagerSignup",
    },
    storePartner: {
      // Vendor endpoints use JWT; backend sets cookie 'jwt' on login/signup
      signin: "/vendors/login",
      signup: "/vendors/signup",
    },
    admin: {
      signin: "/auth/adminSignin",
      signup: "/auth/adminSignup",
    },
  };

  // 1. Check Auth Status on Mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 1. Check JWT-based auth first
        const response = await axiosInstance.get("/auth/verify");
        setIsAuthenticated(response.data.authenticated);
        if (response.data.authenticated && response.data.user) {
          const u = response.data.user;
          const normalized = {
            ...u,
            customerId: u.customerId || u._id || u.id,
          };
          setUser(normalized);
          setLoading(false);
          return;
        }
        // Previously we supported a session-based fallback for vendors; with cookie-only JWT,
        // this is no longer needed because /auth/verify returns user info for all roles.
      } catch (error) {
        console.log("User not authenticated or verification failed", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // 2. Update Local User State (for Profile updates)
  const updateUser = (newUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserData,
    }));
  };

  // 3. Unified Sign In
  const signin = async (userData, role = "customer") => {
    setLoading(true);
    try {
      // Get the correct endpoint based on role
      const endpoint = authConfig[role]?.signin || authConfig.customer.signin;

      // When calling vendor endpoints, attach the role required by the vendor API
      const payload =
        role === "storePartner"
          ? { ...userData, role: "store-manager" }
          : role === "eventManager"
          ? { ...userData, role: "event-manager" }
          : userData;
      const response = await axiosInstance.post(endpoint, payload);

      // Special logic for Customers: Fetch full profile details
      if (role === "customer" && response.data.user?.customerId) {
        const id = response.data.user.customerId;
        try {
          const fullUserResponse = await axiosInstance.get(`/public/${id}`);
          const f = fullUserResponse.data;
          setUser({ ...f, customerId: f.customerId || f._id || f.id });
        } catch (fetchError) {
          console.error(
            "Could not fetch full user details, using basic info",
            fetchError
          );
          setUser(response.data.user);
        }
      } else if (role === "storePartner") {
        // When storePartner signs in, the server returns the vendor object in the response
        if (response.data?.vendor) {
          const v = response.data.vendor;
          setUser({
            role: "storePartner",
            vendorId: v.vendorId || v._id || v.id,
            ...v,
          });
        }
      } else {
        // For Admin, Event Managers, etc., use the data returned from login
        setUser(response.data.user);
      }

      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Signin error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 4. Unified Sign Up
  const signup = async (userData, role = "customer") => {
    setLoading(true);
    try {
      const endpoint = authConfig[role]?.signup || authConfig.customer.signup;
      const response = await axiosInstance.post(endpoint, userData);

      // Similar fetch logic for signup if backend returns ID immediately
      if (role === "customer" && response.data.user?.customerId) {
        const id = response.data.user.customerId;
        const fullUserResponse = await axiosInstance.get(`/public/${id}`);
        const f = fullUserResponse.data;
        setUser({ ...f, customerId: f.customerId || f._id || f.id });
      } else if (role === "storePartner") {
        // After storePartner signup, the server should return vendor data in response
        if (response.data?.vendor) {
          const v = response.data.vendor;
          setUser({
            role: "storePartner",
            vendorId: v.vendorId || v._id || v.id,
            ...v,
          });
        }
      } else {
        setUser(response.data.user);
      }

      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 5. Sign Out
  const signout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    signin,
    signup,
    signout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

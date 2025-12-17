import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { axiosInstance } from "../utils/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Role-based endpoint configuration (Memoized)
  const authConfig = useMemo(() => ({
    customer: { signin: "/auth/signin", signup: "/auth/signup" },
    eventManager: { signin: "/auth/eventManagerSignin", signup: "/auth/eventManagerSignup" },
    storePartner: { signin: "/auth/storeSignin", signup: "/auth/storeSignup" },
    admin: { signin: "/auth/adminSignin", signup: "/auth/adminSignup" },
  }), []);

  /**
   * Helper: Fetch full profile details based on role.
   */
  const fetchFullUserProfile = useCallback(async (basicUser) => {
    // Defensive check: if basicUser is null/undefined, return null
    if (!basicUser) return null;

    if (basicUser.role === "customer" && (basicUser.customerId || basicUser._id)) {
      try {
        const id = basicUser.customerId || basicUser._id;
        const response = await axiosInstance.get(`/public/${id}`);
        // Merge the basic auth info with the full profile info
        return { ...basicUser, ...response.data };
      } catch (error) {
        console.error("Error fetching full customer profile:", error);
        return basicUser; 
      }
    }
    return basicUser;
  }, []);

  // 2. Check Auth Status on Mount (Persist Login)
  useEffect(() => {
    let isMounted = true;

    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get("/auth/verify");
        
        // Safety check: ensure the response has the expected user data
        if (isMounted && response.data?.authenticated && response.data?.user) {
          const fullUser = await fetchFullUserProfile(response.data.user);
          setUser(fullUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthStatus();
    return () => { isMounted = false; };
  }, [fetchFullUserProfile]);

  // 3. Update Local User State (for Profile updates)
  const updateUser = useCallback((newUserData) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...newUserData } : null));
  }, []);

  // 4. Unified Sign In
  const signin = async (userData, role) => {
    setLoading(true);
    try {
      const endpoint = authConfig[role]?.signin || authConfig.customer.signin;
      const response = await axiosInstance.post(endpoint, userData);

      // CRITICAL FIX: Safety check for basicUser
      const basicUser = response.data?.user;
      
      if (!basicUser) {
        throw new Error("Login successful, but user data was missing from response.");
      }

      // Ensure the user object has the role attached
      if (!basicUser.role) basicUser.role = role;

      const fullUser = await fetchFullUserProfile(basicUser);

      setUser(fullUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Signin error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 5. Unified Sign Up
  const signup = async (userData, role = "customer") => {
    setLoading(true);
    try {
      const endpoint = authConfig[role]?.signup || authConfig.customer.signup;
      const response = await axiosInstance.post(endpoint, userData);

      const basicUser = response.data?.user;
      
      if (!basicUser) {
        throw new Error("Signup successful, but user data was missing from response.");
      }

      if (!basicUser.role) basicUser.role = role;

      const fullUser = await fetchFullUserProfile(basicUser);

      setUser(fullUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Signup failed.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 6. Sign Out
  const signout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear state regardless of network failure
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };

  // 7. Memoize context value to prevent unnecessary re-renders of consuming components
  const value = useMemo(() => ({
    isAuthenticated,
    loading,
    user,
    signin,
    signup,
    signout,
    updateUser,
  }), [isAuthenticated, loading, user, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
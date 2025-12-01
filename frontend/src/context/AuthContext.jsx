import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../utils/axios"; // Ensure this path is correct

const AuthContext = createContext();

// Custom Hook to use the context
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
      signin: "/auth/storeSignin",
      signup: "/auth/storeSignup",
    },
    admin: {
      signin: "/auth/adminSignin",
      signup: "/auth/adminSignup",
    },
  };

  /**
   * Helper: Fetch full profile details based on role.
   * This ensures we get the same data structure on Login AND on Page Refresh.
   */
  const fetchFullUserProfile = useCallback(async (basicUser) => {
    // If it's a customer, we often need more data (address, profile pic, etc.)
    // that might not be in the initial Auth/Verify response.
    if (basicUser?.role === "customer" && basicUser?.customerId) {
      try {
        const response = await axiosInstance.get(`/public/${basicUser.customerId}`);
        // Merge the basic auth info with the full profile info
        return { ...basicUser, ...response.data };
      } catch (error) {
        console.error("Error fetching full customer profile:", error);
        return basicUser; // Fallback to basic info if fetch fails
      }
    }
    // For Admin/Store/Manager, usually the basic auth object is enough
    return basicUser;
  }, []);

  // 1. Check Auth Status on Mount (Persist Login)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Assume backend checks HttpOnly cookie
        const response = await axiosInstance.get("/auth/verify");

        if (response.data.authenticated && response.data.user) {
          setIsAuthenticated(true);
          // Fetch full details (Address, etc) so state is consistent with Login
          const fullUser = await fetchFullUserProfile(response.data.user);
          setUser(fullUser);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        // Quiet failure on verify (user just isn't logged in)
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [fetchFullUserProfile]);

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
      const endpoint = authConfig[role]?.signin || authConfig.customer.signin;
      const response = await axiosInstance.post(endpoint, userData);

      const basicUser = response.data.user;
      
      // Ensure the user object has the role attached if the backend didn't send it
      if (!basicUser.role) basicUser.role = role;

      // Fetch extended details if necessary
      const fullUser = await fetchFullUserProfile(basicUser);

      setUser(fullUser);
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

      const basicUser = response.data.user;
      if (!basicUser.role) basicUser.role = role;

      const fullUser = await fetchFullUserProfile(basicUser);

      setUser(fullUser);
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
    setLoading(true);
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      // Optional: Clear any local storage if you use it alongside cookies
      // localStorage.removeItem('token'); 
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
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../utils/axios";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  // wishlistIds: Set of product id strings for O(1) lookup
  const [wishlistIds, setWishlistIds] = useState(new Set());
  // wishlistItems: full product objects (for My Wishlist page)
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const customerId = user?.customerId || user?._id || user?.id;

  // ─── Fetch wishlist from backend ───────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "customer" || !customerId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/public/${customerId}/wishlist`);
      if (res.data.success) {
        const items = res.data.wishlist || [];
        setWishlistItems(items);
        setWishlistIds(new Set(items.map((p) => p._id?.toString() || p.id?.toString())));
      }
    } catch (err) {
      console.error("fetchWishlist error:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role, customerId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "customer") {
      fetchWishlist();
    } else {
      // Clear wishlist when logged out
      setWishlistIds(new Set());
      setWishlistItems([]);
    }
  }, [isAuthenticated, user?.role, fetchWishlist]);

  // ─── Check if a product is wishlisted ──────────────────────
  const isWishlisted = useCallback(
    (productId) => wishlistIds.has(productId?.toString()),
    [wishlistIds]
  );

  // ─── Toggle wishlist (add / remove) ────────────────────────
  const toggleWishlist = useCallback(
    async (product) => {
      if (!isAuthenticated || user?.role !== "customer") {
        toast.error("Please log in to use wishlist");
        return false;
      }
      const pid = product._id?.toString() || product.id?.toString();
      if (!pid) return false;

      const wasWishlisted = wishlistIds.has(pid);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.delete(pid);
        else next.add(pid);
        return next;
      });

      if (wasWishlisted) {
        setWishlistItems((prev) => prev.filter((p) => (p._id?.toString() || p.id?.toString()) !== pid));
      } else {
        setWishlistItems((prev) => [...prev, product]);
      }

      try {
        if (wasWishlisted) {
          await axiosInstance.delete(`/public/${customerId}/wishlist/${pid}`);
          toast.success("Removed from wishlist");
        } else {
          await axiosInstance.post(`/public/${customerId}/wishlist`, { productId: pid });
          toast.success("Added to wishlist! ❤️");
        }
        return true;
      } catch (err) {
        // Revert optimistic update on error
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasWishlisted) next.add(pid);
          else next.delete(pid);
          return next;
        });
        if (wasWishlisted) {
          setWishlistItems((prev) => [...prev, product]);
        } else {
          setWishlistItems((prev) => prev.filter((p) => (p._id?.toString() || p.id?.toString()) !== pid));
        }
        console.error("toggleWishlist error:", err);
        toast.error("Failed to update wishlist");
        return false;
      }
    },
    [isAuthenticated, user?.role, customerId, wishlistIds]
  );

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, wishlistItems, isWishlisted, toggleWishlist, loading, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { wishlistApi } from '../api/wishlistApi.js';
import { useAuth } from './AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist(null);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await wishlistApi.getWishlist();
      setWishlist(res.data.data.wishlist);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) {
      throw new Error('unauthenticated');
    }
    try {
      const res = await wishlistApi.addToWishlist(productId);
      setWishlist(res.data.data.wishlist);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to wishlist';
      throw new Error(msg);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) {
      throw new Error('unauthenticated');
    }
    try {
      const res = await wishlistApi.removeFromWishlist(productId);
      setWishlist(res.data.data.wishlist);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item from wishlist';
      throw new Error(msg);
    }
  };

  const clearWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await wishlistApi.clearWishlist();
      setWishlist(res.data.data.wishlist);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clear wishlist';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product._id === productId || item.product === productId);
  };

  const wishlistItems = wishlist?.items || [];
  const wishlistItemCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistItems,
        wishlistItemCount,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

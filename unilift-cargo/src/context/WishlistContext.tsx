'use client';

import {
  addToWishlist,
  getWishlistItems,
  removeFromWishlist
} from '@/actions/contractor/wishlist';
import {
  wishlistReducer,
  WishlistStateType
} from '@/reducer/wishlistReducer';
import { WishlistItemType } from '@/types/wishlist.types';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react';
import toast from 'react-hot-toast';

const initialState: WishlistStateType = {
  wishlistItems: [],
  loading: false,
  error: null
};

const WishlistContext = createContext<{
  state: WishlistStateType;
  wishlistProductIds: Set<string>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
} | null>(null);

export function WishlistProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  // O(1) lookup set — always in sync with wishlistItems
  const wishlistProductIds = useMemo(
    () => new Set(state.wishlistItems.map(item => item.productId)),
    [state.wishlistItems]
  );

  const loadWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, success } = await getWishlistItems();
      if (success && data) {
        dispatch({ type: 'SET_ITEMS', payload: data });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, []);

  const addItemToWishlist = useCallback(async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { success, message, data } = await addToWishlist(productId);

      if (!success) throw message;

      if (data) {
        // New item — add to list
        dispatch({ type: 'ADD_ITEM', payload: data as WishlistItemType });
        toast.success('Added to wishlist');
      } else {
        // Already wishlisted (23505 duplicate — success with no data)
        toast('Already in your wishlist');
      }
    } catch {
      toast.error('Failed to add to wishlist. Please try again.');
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const removeItemFromWishlist = useCallback(async (productId: string) => {
    // Optimistic remove — revert on failure
    const snapshot = state.wishlistItems;
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });

    try {
      const { success, message } = await removeFromWishlist(productId);
      if (!success) throw message;
      toast.success('Removed from wishlist');
    } catch {
      // Revert optimistic update
      dispatch({ type: 'SET_ITEMS', payload: snapshot });
      toast.error('Failed to remove from wishlist. Please try again.');
    }
  }, [state.wishlistItems]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (wishlistProductIds.has(productId)) {
        await removeItemFromWishlist(productId);
      } else {
        await addItemToWishlist(productId);
      }
    },
    [wishlistProductIds, addItemToWishlist, removeItemFromWishlist]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistProductIds.has(productId),
    [wishlistProductIds]
  );

  const contextValue = useMemo(
    () => ({
      state,
      wishlistProductIds,
      addToWishlist: addItemToWishlist,
      removeFromWishlist: removeItemFromWishlist,
      toggleWishlist,
      isWishlisted,
      loadWishlist
    }),
    [
      state,
      wishlistProductIds,
      addItemToWishlist,
      removeItemFromWishlist,
      toggleWishlist,
      isWishlisted,
      loadWishlist
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

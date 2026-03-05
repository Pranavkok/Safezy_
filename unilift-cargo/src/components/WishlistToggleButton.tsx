'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useUser } from '@/context/UserContext';
import { USER_ROLES } from '@/constants/constants';

type WishlistToggleButtonProps = {
  productId: string;
  /** When true renders as a labelled secondary button (product details page) */
  showLabel?: boolean;
  className?: string;
};

const WishlistToggleButton: React.FC<WishlistToggleButtonProps> = ({
  productId,
  showLabel = false,
  className = ''
}) => {
  const { userRole } = useUser();
  const { isWishlisted, toggleWishlist, state } = useWishlist();

  // Only render for contractors
  if (userRole !== USER_ROLES.CONTRACTOR) return null;

  const wishlisted = isWishlisted(productId);

  const handleClick = async (e: React.MouseEvent) => {
    // Prevent card <Link> navigation and event bubbling
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(productId);
  };

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        disabled={state.loading}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${
          wishlisted
            ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
            : 'border-gray-300 bg-white text-gray-600 hover:border-red-300 hover:text-red-500'
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            wishlisted ? 'fill-red-500 text-red-500' : 'fill-none'
          }`}
        />
        {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state.loading}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-1.5 rounded-full bg-white shadow-sm hover:scale-110 transition-transform disabled:opacity-50 disabled:pointer-events-none ${className}`}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          wishlisted
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-400 hover:text-red-400'
        }`}
      />
    </button>
  );
};

export default WishlistToggleButton;

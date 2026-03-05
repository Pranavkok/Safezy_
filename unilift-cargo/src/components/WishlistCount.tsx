'use client';

import { Heart } from 'lucide-react';
import React from 'react';
import { useWishlist } from '@/context/WishlistContext';

const WishlistCount = () => {
  const { state } = useWishlist();
  const count = state.wishlistItems.length;

  return (
    <div className="relative inline-block">
      <Heart className="w-5 h-5 text-gray-800" />
      {count > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export default WishlistCount;

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { WishlistItemType } from '@/types/wishlist.types';
import { Button } from '@/components/ui/button';
import CustomRating from '@/components/CustomRating';
import ProductItemSkeleton from '@/skeleton/ProductItemSkeleton';
import { getProductCategoryLabel } from '@/utils';
import { AppRoutes } from '@/constants/AppRoutes';

// ─── Empty State ─────────────────────────────────────────────────────────────

const WishlistEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
      <Heart className="w-10 h-10 text-red-300" />
    </div>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
      Your wishlist is empty
    </h2>
    <p className="text-gray-500 mb-8 max-w-sm">
      Browse products and save your favourites here. They&apos;ll be waiting for
      you when you&apos;re ready to order.
    </p>
    <Link href={AppRoutes.PRODUCT_LISTING}>
      <Button className="flex items-center gap-2">
        <ShoppingBag className="w-4 h-4" />
        Browse Products
      </Button>
    </Link>
  </div>
);

// ─── Wishlist Card ────────────────────────────────────────────────────────────

const WishlistCard = ({ item }: { item: WishlistItemType }) => {
  const { removeFromWishlist } = useWishlist();

  return (
    <div className="relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out p-4">
      {/* Out of Stock badge */}
      {item.isOutOfStock && (
        <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-sm px-3 py-1 rounded-md z-30 shadow-lg">
          Out of Stock
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={() => removeFromWishlist(item.productId)}
        aria-label="Remove from wishlist"
        className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Product image — clicking navigates to product page */}
      <Link href={`/products/${item.productId}`}>
        <div
          className="relative w-full h-40 sm:h-56 xl:h-52 2xl:h-56 bg-white"
          onContextMenu={e => e.preventDefault()}
        >
          <Image
            src={item.image}
            alt={item.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            className="object-contain object-center rounded select-none pointer-events-none"
            draggable={false}
            priority
          />
        </div>

        {/* Product details */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-col">
            <h3
              className="font-semibold text-lg text-gray-900 line-clamp-2"
              style={{ textTransform: 'capitalize' }}
            >
              {item.name
                .split(' ')
                .map(
                  word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ')}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {getProductCategoryLabel(item.category)}
            </p>
          </div>

          <div className="flex flex-col xs:flex-row xs:justify-between xs:items-end gap-2">
            <div className="space-y-1">
              {item.price > 0 && (
                <p className="text-xl md:text-2xl font-bold text-gray-800">
                  ₹{item.price}
                </p>
              )}
              <CustomRating
                size={18}
                initialRating={item.avgRating}
                readonly
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// ─── Wishlist Section ─────────────────────────────────────────────────────────

const WishlistSection = () => {
  const { state } = useWishlist();
  const { wishlistItems, loading } = state;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(8)
          .fill(null)
          .map((_, i) => (
            <ProductItemSkeleton key={i} />
          ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return <WishlistEmptyState />;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map(item => (
          <WishlistCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default WishlistSection;

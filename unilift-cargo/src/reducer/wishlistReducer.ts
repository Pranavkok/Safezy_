import { WishlistItemType } from '@/types/wishlist.types';

export type WishlistStateType = {
  wishlistItems: WishlistItemType[];
  loading: boolean;
  error: string | null;
};

export type WishlistActionType =
  | { type: 'SET_ITEMS'; payload: WishlistItemType[] }
  | { type: 'ADD_ITEM'; payload: WishlistItemType }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

export const wishlistReducer = (
  state: WishlistStateType,
  action: WishlistActionType
): WishlistStateType => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, wishlistItems: action.payload };

    case 'ADD_ITEM':
      return { ...state, wishlistItems: [...state.wishlistItems, action.payload] };

    case 'REMOVE_ITEM':
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter(
          item => item.productId !== action.payload.productId
        )
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

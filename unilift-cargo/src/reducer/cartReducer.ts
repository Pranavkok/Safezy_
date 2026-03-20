import { CartItemType, CartStateType } from '@/context/CartContext';

export type CartActionType =
  | { type: 'ADD_ITEM'; payload: CartItemType }
  | {
      type: 'UPDATE_QUANTITY';
      payload: { id: number; quantity: number; unitPrice: number };
    }
  | { type: 'INCREASE_QUANTITY'; payload: { id: number; unitPrice: number } }
  | { type: 'DECREASE_QUANTITY'; payload: { id: number; unitPrice: number } }
  | {
      type: 'UPDATE_CART_ITEM_PRICE';
      payload: { productId: string; updatedUnitPrice: number };
    }
  | { type: 'REMOVE_ITEM'; payload: { id: number } }
  | { type: 'CLEAR_CART'; payload: string }
  | { type: 'SET_ITEMS'; payload: CartItemType[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

export const cartReducer = (
  state: CartStateType,
  action: CartActionType
): CartStateType => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        cartItems: [...state.cartItems, action.payload]
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: action.payload.quantity,
                unitPrice: action.payload.unitPrice
              }
            : item
        )
      };

    case 'UPDATE_CART_ITEM_PRICE':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.product.id === action.payload.productId
            ? { ...item, unitPrice: action.payload.updatedUnitPrice }
            : item
        )
      };

    case 'INCREASE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                unitPrice: action.payload.unitPrice
              }
            : item
        )
      };

    case 'DECREASE_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id && item.quantity > 1
            ? {
                ...item,
                quantity: item.quantity - 1,
                unitPrice: action.payload.unitPrice
              }
            : item
        )
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== action.payload.id)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: []
      };

    case 'SET_ITEMS':
      return {
        ...state,
        cartItems: action.payload
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

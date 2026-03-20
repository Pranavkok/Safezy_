'use client';

import {
  addToCart,
  clearCart,
  getCartItems,
  removeCartItem,
  updatePrice,
  updateQuantity
} from '@/actions/contractor/cart';
import { cartReducer } from '@/reducer/cartReducer';
import { getProductPriceFromPriceTiers } from '@/utils';
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

export type PriceTierType = {
  minQuantity: number;
  maxQuantity: number;
  price: number;
};

export type LeadTimeTierType = {
  minQuantity: number;
  maxQuantity: number;
  days: number;
};

export type CartItemType = {
  id: number;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  product: {
    id: string;
    name: string;
    category: string;
    image: string;
    priceTiers: PriceTierType[];
    leadTimeTiers: LeadTimeTierType[];
  };
};

export type CartStateType = {
  cartItems: CartItemType[];
  loading: boolean;
  error: string | null;
};

export type AddToCartType = {
  productId: string;
  quantity: number;
  color: string;
  size: string;
  priceTiers: PriceTierType[];
};

const initialState: CartStateType = {
  cartItems: [],
  error: null,
  loading: false
};

const CartContext = createContext<{
  state: CartStateType;
  addItemToCart: (item: AddToCartType) => Promise<void>;
  increaseQuantity: (id: number) => Promise<void>;
  decreaseQuantity: (id: number) => Promise<void>;
  removeItemFromCart: (id: number) => Promise<void>;
  updateCartItemQuantity: (id: number, quantity: number) => Promise<void>;
  clearCartItems: () => Promise<void>;
  loadCartItems: () => Promise<void>;
} | null>(null);

const cartItemAlreadyExists = (
  cartItems: CartItemType[],
  item: AddToCartType
) => {
  return cartItems.find(
    cartItem =>
      cartItem.product.id === item.productId &&
      cartItem.color === item.color &&
      cartItem.size === item.size
  );
};

const calculateGroupQuantity = (
  cartItems: CartItemType[],
  productId: string
) => {
  return cartItems
    .filter(cartItem => cartItem.product.id === productId)
    .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
};

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const loadCartItems = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, success, message } = await getCartItems();

      if (!success) throw message;

      if (data) {
        dispatch({ type: 'SET_ITEMS', payload: data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart items' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadCartItems();
  }, []);

  const addItemToCart = useCallback(
    async (item: AddToCartType) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const existingItem = cartItemAlreadyExists(state.cartItems, item);

        const groupCartItemQuantity = calculateGroupQuantity(
          state.cartItems,
          item.productId
        );

        const updatedProductPrice = getProductPriceFromPriceTiers(
          groupCartItemQuantity + item.quantity,
          item.priceTiers
        );

        if (!existingItem) {
          const { data, success, message } = await addToCart({
            color: item.color,
            quantity: item.quantity,
            productId: item.productId,
            size: item.size,
            itemPrice: updatedProductPrice
          });

          if (!success) throw message;

          if (data) {
            dispatch({ type: 'ADD_ITEM', payload: data });
            await updateCartItemPrice(item.productId, updatedProductPrice);
            toast.success('Item added to cart successfully!');
          }
        } else {
          const updatedQuantity = existingItem.quantity + item.quantity;

          const { message, success } = await updateQuantity(
            existingItem.id,
            updatedQuantity,
            updatedProductPrice
          );

          if (!success) throw message;

          if (success) {
            dispatch({
              type: 'UPDATE_QUANTITY',
              payload: {
                id: existingItem.id,
                quantity: updatedQuantity,
                unitPrice: updatedProductPrice
              }
            });

            await updateCartItemPrice(item.productId, updatedProductPrice);
            toast.success('Item added to cart successfully!');
          }
        }
      } catch (error) {
        if (
          error ===
          'User not found. You need to register first before logging in'
        ) {
          toast.error('Please log in before adding items to your cart');
        } else {
          toast.error('Failed to add item to cart. Please try again.');
        }
        dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.cartItems]
  );

  const increaseQuantity = useCallback(
    async (id: number) => {
      try {
        const existingItem = state.cartItems.find(item => item.id === id);

        if (!existingItem) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        const updatedQuantity = existingItem.quantity + 1;

        const groupCartItemQuantity = calculateGroupQuantity(
          state.cartItems,
          existingItem.product.id
        );

        const updatedProductPrice = getProductPriceFromPriceTiers(
          groupCartItemQuantity + 1,
          existingItem.product?.priceTiers
        );

        const { message, success } = await updateQuantity(
          existingItem.id,
          updatedQuantity,
          updatedProductPrice
        );

        if (!success) throw message;
        if (success) {
          dispatch({
            type: 'INCREASE_QUANTITY',
            payload: { id: existingItem.id, unitPrice: updatedProductPrice }
          });
          await updateCartItemPrice(
            existingItem.product.id,
            updatedProductPrice
          );
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to increase quantity' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.cartItems]
  );

  const decreaseQuantity = useCallback(
    async (id: number) => {
      try {
        const existingItem = state.cartItems.find(item => item.id === id);
        if (!existingItem || existingItem.quantity <= 1) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        const updatedQuantity = existingItem.quantity - 1;

        const groupCartItemQuantity = calculateGroupQuantity(
          state.cartItems,
          existingItem.product.id
        );

        const updatedProductPrice = getProductPriceFromPriceTiers(
          groupCartItemQuantity - 1,
          existingItem.product?.priceTiers
        );
        const { message, success } = await updateQuantity(
          existingItem.id,
          updatedQuantity,
          updatedProductPrice
        );

        if (!success) throw message;
        if (success) {
          dispatch({
            type: 'DECREASE_QUANTITY',
            payload: { id: existingItem.id, unitPrice: updatedProductPrice }
          });
          await updateCartItemPrice(
            existingItem.product.id,
            updatedProductPrice
          );
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to decrease quantity' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.cartItems]
  );

  const updateCartItemPrice = useCallback(
    async (productId: string, itemPrice: number) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const { message, success } = await updatePrice(itemPrice, productId);

        if (!success) throw message;
        if (success)
          dispatch({
            type: 'UPDATE_CART_ITEM_PRICE',
            payload: { productId: productId, updatedUnitPrice: itemPrice }
          });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update price' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    []
  );

  const updateCartItemQuantity = useCallback(
    async (id: number, quantity: number) => {
      try {
        const existingItem = state.cartItems.find(item => item.id === id);
        if (!existingItem) return;

        dispatch({ type: 'SET_LOADING', payload: true });
        const updatedQuantity = quantity;

        const groupCartItemQuantityWithoutActualCartItemQuantity =
          state.cartItems
            .filter(
              cartItem =>
                cartItem.product.id === existingItem.product.id &&
                cartItem.id !== id
            )
            .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

        const updatedProductPrice = getProductPriceFromPriceTiers(
          groupCartItemQuantityWithoutActualCartItemQuantity + updatedQuantity,
          existingItem.product?.priceTiers
        );

        const { message, success } = await updateQuantity(
          existingItem.id,
          updatedQuantity,
          updatedProductPrice
        );

        if (!success) throw message;
        if (success) {
          dispatch({
            type: 'UPDATE_QUANTITY',
            payload: {
              id: existingItem.id,
              quantity: updatedQuantity,
              unitPrice: updatedProductPrice
            }
          });

          await updateCartItemPrice(
            existingItem.product.id,
            updatedProductPrice
          );
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to increase quantity'
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.cartItems]
  );

  const removeItemFromCart = useCallback(
    async (id: number) => {
      try {
        const existingItem = state.cartItems.find(item => item.id === id);
        if (!existingItem) return;
        dispatch({ type: 'SET_LOADING', payload: true });

        const groupCartItemQuantity = calculateGroupQuantity(
          state.cartItems,
          existingItem.product.id
        );

        const updatedProductPrice = getProductPriceFromPriceTiers(
          groupCartItemQuantity - existingItem.quantity,
          existingItem.product?.priceTiers
        );

        const { success, message } = await removeCartItem(existingItem.id);

        if (!success) throw message;
        if (success) {
          dispatch({ type: 'REMOVE_ITEM', payload: { id: id } });
          await updateCartItemPrice(
            existingItem.product.id,
            updatedProductPrice
          );
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to remove item from cart'
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.cartItems]
  );

  const clearCartItems = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { success, message } = await clearCart();

      if (!success) throw message;
      if (success) dispatch({ type: 'CLEAR_CART', payload: '' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to remove item from cart'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      addItemToCart,
      decreaseQuantity,
      increaseQuantity,
      removeItemFromCart,
      clearCartItems,
      loadCartItems,
      updateCartItemQuantity
    }),
    [state]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

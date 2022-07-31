import { createContext, useReducer } from 'react';
import Cookies from 'js-cookie';

import { CART_ADD_ITEM, CART_REMOVE_ITEM } from './consts/cart.types';

export const Store = createContext();

const initialState = {
  cart: Cookies.get('cart') ? JSON.parse(Cookies.get('cart')) : { cartItems: [] },
};

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case CART_ADD_ITEM: {
      // refactor
      const newItem = payload; // contains new quantity

      const existingItem = state.cart.cartItems.find(
        (item) => item.slug === newItem.slug
      );

      const cartItems = existingItem
        ? state.cart.cartItems.map((item) =>
            item.name === existingItem.name ? newItem : item
          )
        : [...state.cart.cartItems, newItem];

      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }));
      
      return { ...state, cart: { ...state.cart, cartItems } };
    }

    case CART_REMOVE_ITEM: {
      // refactor
      const cartItems = state.cart.cartItems.filter(item => item.slug !== payload.slug);
      Cookies.set('cart', JSON.stringify({ ...state.cart, cartItems }))

      return { ...state, cart: { ...state.cart, cartItems } };
    }

    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};

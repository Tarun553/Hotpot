import { createSlice } from "@reduxjs/toolkit";

// Helper function to load state from localStorage
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('hotpotUserState');
    if (serializedState === null) {
      return {
        userData: null,
        token: localStorage.getItem('token') || null,
        city: null,
        currentState: null,
        currentAddress: null,
        cartItems: [],
        myOrders: null,
        shopOrders: null,
        orderStatus: null
      };
    }
    const parsedState = JSON.parse(serializedState);
    return {
      ...parsedState,
      token: localStorage.getItem('token') || parsedState.token,
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return {
      userData: null,
      token: localStorage.getItem('token') || null,
      city: null,
      currentState: null,
      currentAddress: null,
      cartItems: [],
      myOrders: null,
      shopOrders: null,
      orderStatus: null
    };
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: loadFromLocalStorage(),
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      // Persist to localStorage
      try {
        localStorage.setItem('hotpotUserState', JSON.stringify({
          ...state,
          userData: action.payload
        }));
      } catch (err) {
        console.error('Error saving state to localStorage:', err);
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // Store in localStorage
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setCity: (state, action) => {
      state.city = action.payload;
      try {
        localStorage.setItem('hotpotUserState', JSON.stringify(state));
      } catch (err) {
        console.error('Error saving state to localStorage:', err);
      }
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    addToCart: (state, action) => {
     const cartItem = action.payload;
     const existingItem = state.cartItems.find(item => item.id === cartItem.id);
     if (existingItem) {
       existingItem.quantity += cartItem.quantity;
     } else {
       state.cartItems.push(cartItem);
     }
     try {
       localStorage.setItem('hotpotUserState', JSON.stringify(state));
     } catch (err) {
       console.error('Error saving cart to localStorage:', err);
     }
    },
    removeToCart: (state, action) => {
     const id = action.payload;
     state.cartItems = state.cartItems.filter(item => item.id !== id);
     try {
       localStorage.setItem('hotpotUserState', JSON.stringify(state));
     } catch (err) {
       console.error('Error saving cart to localStorage:', err);
     }
    },
    updateToCart: (state, action) => {
     const { id, quantity } = action.payload;
     const existingItem = state.cartItems.find(item => item.id === id);
     if (existingItem) {
       existingItem.quantity = quantity;
     }
     try {
       localStorage.setItem('hotpotUserState', JSON.stringify(state));
     } catch (err) {
       console.error('Error saving cart to localStorage:', err);
     }
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
      try {
        localStorage.setItem('hotpotUserState', JSON.stringify(state));
      } catch (err) {
        console.error('Error saving cart to localStorage:', err);
      }
    },
    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    setShopOrders: (state, action) => {
      state.shopOrders = action.payload;
    },
    setOrderStatus: (state, action) => {
      state.orderStatus = action.payload;
    },
    clearUserData: (state) => {
      // Clear all user-related state
      state.userData = null;
      state.token = null;
      state.cartItems = [];
      state.myOrders = null;
      state.shopOrders = null;
      state.orderStatus = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('hotpotUserState');
    },
    clearCart: (state) => {
      state.cartItems = [];
      try {
        localStorage.setItem('hotpotUserState', JSON.stringify(state));
      } catch (err) {
        console.error('Error clearing cart from localStorage:', err);
      }
    }
}});

export const { 
  setUserData, 
  setToken, 
  setCity, 
  setCurrentState, 
  setCurrentAddress, 
  addToCart, 
  removeToCart, 
  updateToCart, 
  setCartItems, 
  setMyOrders, 
  setShopOrders, 
  setOrderStatus,
  clearUserData,
  clearCart
} = userSlice.actions;

export default userSlice.reducer;

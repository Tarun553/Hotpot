import { createSlice } from "@reduxjs/toolkit";



const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    token: localStorage.getItem('token') || null,
    isLoading: true,
    city: null,
    currentState: null,
    currentAddress: null,
    cartItems: [],
    myOrders: null,
    shopOrders: null,
    orderStatus: null
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // Also store in localStorage as backup
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setCity: (state, action) => {
      state.city = action.payload;
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
    },
    removeToCart: (state, action) => {
     const id = action.payload;
     state.cartItems = state.cartItems.filter(item => item.id !== id);
    },
    updateToCart: (state, action) => {
     const { id, quantity } = action.payload;
     const existingItem = state.cartItems.find(item => item.id === id);
     if (existingItem) {
       existingItem.quantity = quantity;
     }
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
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
}});

export const { setUserData, setLoading, setToken, setCity, setCurrentState, setCurrentAddress, addToCart, removeToCart, updateToCart, setCartItems, setMyOrders, setShopOrders, setOrderStatus } = userSlice.actions;
export default userSlice.reducer;

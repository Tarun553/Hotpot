import { createSlice } from "@reduxjs/toolkit";



const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    city: null,
    currentState: null,
    currentAddress: null,
    cartItems: []
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
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
    }
}});

export const { setUserData, setCity, setCurrentState, setCurrentAddress, addToCart, removeToCart, updateToCart, setCartItems } = userSlice.actions;
export default userSlice.reducer;

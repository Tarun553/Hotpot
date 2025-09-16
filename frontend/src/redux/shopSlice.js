import { createSlice } from "@reduxjs/toolkit";


const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    shopData: null,
    shops: [],
  },
  reducers: {
    setShopData: (state, action) => {
      state.shopData = action.payload;
    },
    setShops: (state, action) => {
      state.shops = action.payload;
    },
  },
});

export const { setShopData, setShops } = shopSlice.actions;

export default shopSlice.reducer;

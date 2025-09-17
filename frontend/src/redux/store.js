import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import ownerSlice from "./ownerSlice";
import shopSlice from "./shopSlice";
import mapSlice from "./mapSlice";
export const store = configureStore({
  reducer: {
    // Add your reducers here
    user: userSlice,
    owner: ownerSlice,
    shop: shopSlice,
    map: mapSlice,
  },
});

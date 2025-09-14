import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";

export const store = configureStore({
  reducer: {
    // Add your reducers here
    user: userSlice,
  },
});

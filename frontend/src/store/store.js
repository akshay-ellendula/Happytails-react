import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import vendorsReducer from "./vendorsSlice";


export const store = configureStore({
  reducer: {
    users: usersReducer,
    vendors: vendorsReducer,
  },
});

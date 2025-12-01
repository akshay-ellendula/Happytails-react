import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import vendorsReducer from "./vendorsSlice";
import eventManagersReducer from "./eventManagersSlice";

export const store = configureStore({
  reducer: {
    users: usersReducer,
    vendors: vendorsReducer,
    eventManagers: eventManagersReducer,
  },
});

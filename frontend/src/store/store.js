import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import vendorsReducer from "./vendorsSlice";
import eventManagersReducer from "./eventManagersSlice";
import eventsReducer from './eventsSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
    vendors: vendorsReducer,
    eventManagers: eventManagersReducer,
    events: eventsReducer,
  },
});

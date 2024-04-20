import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authReducer";
import filesReducer from "./filesReducer";
import adminReducer from "./adminReducer";

// const composeEnhancers = composeWithDevTools();

const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    admin: adminReducer,
  },
});

export default store;

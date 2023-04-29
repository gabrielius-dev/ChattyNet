import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./features/loginSlice";
import locationReducer from "./features/locationSlice";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    location: locationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

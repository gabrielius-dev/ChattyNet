import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import locationReducer from "./features/locationSlice";
import UIReducer from "./features/UISlice";
import postsReducer from "./features/postsSlice";
import profileReducer from "./features/profileSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    location: locationReducer,
    UI: UIReducer,
    posts: postsReducer,
    profile: profileReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

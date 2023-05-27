import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PostData } from "../types/postType";

interface postsState {
  posts: PostData[];
}

const initialState: postsState = {
  posts: [],
};

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PostData[]>) => {
      state.posts = [...state.posts, ...action.payload];
    },
    clearAllPosts: (state) => {
      state.posts = [];
    },
    changePostInfoAfterLiking: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.map((post) => {
        if (post.postId === action.payload) {
          const updatedLikes = post.hasLiked ? post.likes - 1 : post.likes + 1;
          return { ...post, likes: updatedLikes, hasLiked: !post.hasLiked };
        }
        return post;
      });
    },
    addNewPost: (state, action: PayloadAction<PostData>) => {
      state.posts = [action.payload, ...state.posts];
    },
  },
});

export const {
  setPosts,
  clearAllPosts,
  changePostInfoAfterLiking,
  addNewPost,
} = postsSlice.actions;
export default postsSlice.reducer;

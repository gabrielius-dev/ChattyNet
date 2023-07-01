import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface userState {
  isLoggedIn: boolean;
  uid: string;
  email: string;
  fullName: string;
  username: string;
  isSignUpSetupFinished: boolean;
  isAuthenticating: boolean;
  photoURL: string;
  information: string;
  followers: string[];
  followersCount: number;
  followingCount: number;
  bookmarks: string[];
}

const initialState: userState = {
  isLoggedIn: false,
  uid: "",
  email: "",
  fullName: "",
  username: "",
  isSignUpSetupFinished: false,
  isAuthenticating: false,
  photoURL: "",
  information: "",
  followers: [],
  followersCount: 0,
  followingCount: 0,
  bookmarks: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<object>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;

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
  followers: number;
  following: number;
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
  followers: 0,
  following: 0,
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

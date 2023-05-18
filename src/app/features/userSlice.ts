import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface userState {
  isLoggedIn: boolean;
  uid: string;
  email: string;
  username: string;
  isSignUpSetupFinished: boolean;
  isAuthenticating: boolean;
  photoURL: string;
}

const initialState: userState = {
  isLoggedIn: false,
  uid: "",
  email: "",
  username: "",
  isSignUpSetupFinished: false,
  isAuthenticating: false,
  photoURL: "",
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

import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  isLogInFormShowing: boolean;
  isSignUpFormShowing: boolean;
}

const initialState: UIState = {
  isLogInFormShowing: false,
  isSignUpFormShowing: false,
};

export const UISlice = createSlice({
  name: "UI",
  initialState,
  reducers: {
    showLogInForm: (state) => {
      state.isLogInFormShowing = true;
    },
    hideLogInForm: (state) => {
      state.isLogInFormShowing = false;
    },
    showSignUpForm: (state) => {
      state.isSignUpFormShowing = true;
    },
    hideSignUpForm: (state) => {
      state.isSignUpFormShowing = false;
    },
  },
});

export const { showLogInForm, hideLogInForm, showSignUpForm, hideSignUpForm } =
  UISlice.actions;
export default UISlice.reducer;

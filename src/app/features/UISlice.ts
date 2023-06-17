import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface UIState {
  isLogInFormShowing: boolean;
  isSignUpFormShowing: boolean;
  isInitialSignUpFormShowing: boolean;
  isCreateAccountFormShowing: boolean;
  errorMessage: string;
  isSnackbarOpen: boolean;
  isLoginReminderShowing: boolean;
  isEditProfileFormShowing: boolean;
  isHomeContentLoading: boolean;
}

const initialState: UIState = {
  isLogInFormShowing: false,
  isSignUpFormShowing: false,
  isInitialSignUpFormShowing: true,
  isCreateAccountFormShowing: false,
  errorMessage: "",
  isSnackbarOpen: false,
  isLoginReminderShowing: false,
  isEditProfileFormShowing: false,
  isHomeContentLoading: true,
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
      state.isInitialSignUpFormShowing = true;
    },
    hideSignUpForm: (state) => {
      state.isSignUpFormShowing = false;
      state.isInitialSignUpFormShowing = false;
      state.isCreateAccountFormShowing = false;
    },
    showInitialSignUpForm: (state) => {
      state.isInitialSignUpFormShowing = true;
    },
    hideInitialSignUpForm: (state) => {
      state.isInitialSignUpFormShowing = false;
    },

    showCreateAccountForm: (state) => {
      state.isCreateAccountFormShowing = true;
    },
    hideCreateAccountForm: (state) => {
      state.isCreateAccountFormShowing = false;
    },
    showLoginReminder: (state) => {
      state.isLoginReminderShowing = true;
    },
    hideLoginReminder: (state) => {
      state.isLoginReminderShowing = false;
    },
    setErrorMessage: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    setIsSnackbarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSnackbarOpen = action.payload;
    },
    showEditProfileForm: (state) => {
      state.isEditProfileFormShowing = true;
    },
    hideEditProfileForm: (state) => {
      state.isEditProfileFormShowing = false;
    },
    showHomeContent: (state) => {
      state.isHomeContentLoading = false;
    },
    hideHomeContent: (state) => {
      state.isHomeContentLoading = true;
    },
  },
});

export const {
  showLogInForm,
  hideLogInForm,
  showSignUpForm,
  hideSignUpForm,
  showInitialSignUpForm,
  hideInitialSignUpForm,
  showCreateAccountForm,
  hideCreateAccountForm,
  showLoginReminder,
  hideLoginReminder,
  setErrorMessage,
  setIsSnackbarOpen,
  showEditProfileForm,
  hideEditProfileForm,
  showHomeContent,
  hideHomeContent,
} = UISlice.actions;
export default UISlice.reducer;

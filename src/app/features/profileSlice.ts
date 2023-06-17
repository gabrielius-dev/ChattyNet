import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { UserProfileInterface } from "../types/userType";

const initialState: UserProfileInterface = {
  uid: "",
  username: "",
  fullName: "",
  photoURL: null,
  headerPhotoURL: null,
  information: "",
  followersCount: 0,
  followingCount: 0,
  following: [],
  followers: [],
  creationDate: null,
  tweetsCount: 0,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setUserProfileDetails: (state, action: PayloadAction<object>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setUserProfileDetails } = profileSlice.actions;
export default profileSlice.reducer;

import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface LocationState {
  location: string;
}

const initialState: LocationState = {
  location: window.location.pathname,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    changeLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
  },
});

export const { changeLocation } = locationSlice.actions;
export default locationSlice.reducer;

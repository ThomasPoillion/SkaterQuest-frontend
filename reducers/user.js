import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: { token: null, username: null },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Action de connexion
    login: (state, action) => {
      state.value.token = action.payload.token;
      state.value.username = action.payload.username;
    },
    // Action de déconnexion
    logout: (state) => {
      state.value.token = null;
      state.value.username = null;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;

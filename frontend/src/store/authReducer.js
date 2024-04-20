import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { BASIC_URL } from "../settings/basic";

const client = axios.create({
  baseURL: BASIC_URL,
});

axios.defaults.withCredentials = true;

export const fetchCsrfToken = createAsyncThunk(
  "user/fetchCsrfToken",
  async () => {
    try {
      const response = await client.get("accounts/csrf_cookie");
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching CSRF token:", error);
      throw error;
    }
  }
);

export const fetchRegisterUser = createAsyncThunk(
  "user/fetchRegisterUser",
  async ({ username, email, password }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.post(
        "/accounts/register",
        {
          username: username,
          email: email,
          password: password,
        },
        {
          headers: {
            "X-CSRFToken": csrftoken,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.data;
      return data;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessage = Object.values(error.response.data.errors).join(
          ", "
        );
        throw new Error(errorMessage);
      } else {
        throw error;
      }
    }
  }
);

export const fetchLoginUser = createAsyncThunk(
  "user/fetchLoginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");

      const response = await client.post(
        "/accounts/login",
        {
          email: email,
          password: password,
        },
        {
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.data;
      return data;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Authentication failed
        return rejectWithValue("Incorrect email or password.");
      } else {
        // Other errors
        console.error("Error logging in user:", error);
        throw error;
      }
    }
  }
);

export const fetchLogoutUser = createAsyncThunk(
  "user/fetchLogoutUser",
  async () => {
    try {
      const csrftoken = Cookies.get("csrftoken");

      const response = await client.post("/accounts/logout", null, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });

      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error logging out user:", error);
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
    csrf: null,
    message: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: {
    [fetchCsrfToken.pending]: (state) => {
      state.loading = true;
    },
    [fetchCsrfToken.fulfilled]: (state, action) => {
      state.csrf = action.payload;
      state.loading = false;
    },
    [fetchRegisterUser.pending]: (state) => {
      state.loading = true;
    },
    [fetchRegisterUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [fetchRegisterUser.fulfilled]: (state, action) => {
      state.loading = false;
      // state.user = action.payload;
    },
    [fetchLoginUser.pending]: (state) => {
      state.message = null;
      state.loading = true;
    },
    [fetchLoginUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    [fetchLoginUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
    },
    [fetchLogoutUser.pending]: (state) => {
      state.message = null;
      state.loading = true;
    },
    [fetchLogoutUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.message = action.payload;
      state.user = null;
    },
    [fetchLogoutUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
  },
});

export const { clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;

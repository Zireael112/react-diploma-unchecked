import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import axios from "axios";
import { BASIC_URL } from "../settings/basic";

axios.defaults.withCredentials = true;
const client = axios.create({
  baseURL: BASIC_URL,
});

// Fetch all users by Admin
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  try {
    const csrftoken = Cookies.get("csrftoken");
    const response = await client.get("/accounts/get_users", {
      headers: {
        "X-CSRFToken": csrftoken,
      },
    });
    const data = await response.data;
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
});

// Toggle admin status for a user by Admin
export const fetchAdminToggle = createAsyncThunk(
  "users/fetchAdminToggle",
  async ({ userID, is_staff }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.put(
        `/accounts/get_users/${userID}`,
        { is_staff: is_staff },
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
        }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error toggling admin status:", error);
      throw error;
    }
  }
);

// Delete user by Admin
export const fetchDeleteUser = createAsyncThunk(
  "users/fetchDeleteUser",
  async ({ userID }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.delete(`/accounts/get_users/${userID}`, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);

// Fetch files for a specific user by Admin
export const fetchInspectFiles = createAsyncThunk(
  "files/fetchInspectFiles",
  async (id) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.get(`/files/admin?user_id=${id}`, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching files:", error);
      throw error;
    }
  }
);

// Update files for a specific user by Admin
export const AdminUpdateFile = createAsyncThunk(
  "files/AdminUpdateFile",
  async ({ userID, fileID, message }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.patch(
        `/files/admin?user_id=${userID}&file_id=${fileID}`,
        message,
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
      console.error("Error updating file:", error.response.data); // Loging the entire response for more details
      throw error;
    }
  }
);

// Delete files for a specific user by Admin
export const AdminDeleteFile = createAsyncThunk(
  "files/AdminDeleteFile",
  async ({ userID, fileID }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.delete(
        `/files/admin?user_id=${userID}&file_id=${fileID}`,
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
        }
      );
      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error deleting file:", error.response.data); // Loging the entire response for more details
      throw error;
    }
  }
);

export const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    loading: false,
    error: null,
    inspectedUser: null,
    inspectFiles: null,
  },
  reducers: {
    setInspectedUser: (state, action) => {
      state.inspectedUser = action.payload;
    },
    deleteInspectedUser: (state, action) => {
      state.inspectedUser = null;
    },
  },
  extraReducers: {
    [fetchUsers.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [fetchUsers.fulfilled]: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },
    [fetchUsers.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [fetchAdminToggle.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [fetchAdminToggle.fulfilled]: (state, action) => {
      state.loading = false;
      state.users = state.users.map((user) =>
        user.id === action.payload.id ? action.payload : user
      );
    },
    [fetchAdminToggle.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [fetchDeleteUser.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [fetchDeleteUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.users = state.users.filter((user) => user.id !== action.payload.id);
    },
    [fetchDeleteUser.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [fetchInspectFiles.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [fetchInspectFiles.fulfilled]: (state, action) => {
      state.loading = false;
      state.inspectFiles = action.payload;
    },
    [fetchInspectFiles.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [AdminUpdateFile.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [AdminUpdateFile.fulfilled]: (state, action) => {
      state.loading = false;
      state.inspectFiles = state.inspectFiles.map((file) =>
        file.id === action.payload.id ? action.payload : file
      );
    },
    [AdminUpdateFile.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [AdminDeleteFile.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [AdminDeleteFile.fulfilled]: (state, action) => {
      state.loading = false;
      state.inspectFiles = state.inspectFiles.filter(
        (file) => file.id !== action.payload.id
      );
    },
    [AdminDeleteFile.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
  },
});

export const { setInspectedUser, deleteInspectedUser } = adminSlice.actions;
export default adminSlice.reducer;

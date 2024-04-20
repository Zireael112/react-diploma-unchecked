import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import axios from "axios";
import { BASIC_URL } from "../settings/basic";

axios.defaults.withCredentials = true;
const client = axios.create({
  baseURL: BASIC_URL,
});

export const fetchFiles = createAsyncThunk("files/fetchFiles", async () => {
  try {
    const csrftoken = Cookies.get("csrftoken");
    const response = await client.get("/files/get_files", {
      headers: {
        "X-CSRFToken": csrftoken,
      },
    });
    const data = await response.data;
    return data;
  } catch (error) {
    throw error;
  }
});

export const uploadFile = createAsyncThunk(
  "files/uploadFile",
  async ({ formData }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.post("/files/upload", formData, {
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      throw error;
    }
  }
);

export const deleteFile = createAsyncThunk(
  "files/deleteFile",
  async ({ fileID }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.delete(`/files/delete/${fileID}/`, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      throw error;
    }
  }
);

export const updateFile = createAsyncThunk(
  "files/updateFile",
  async ({ fileID, message }) => {
    try {
      const csrftoken = Cookies.get("csrftoken");
      const response = await client.patch(`/files/update/${fileID}/`, message, {
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
        },
      });
      const data = await response.data;
      return data;
    } catch (error) {
      throw error;
    }
  }
);

const fileSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    loading: false,
    uploadStatus: null,
    updateStatus: null,
    error: null,
  },
  reducers: {},
  extraReducers: {
    [fetchFiles.pending]: (state) => {
      state.loading = true;
    },
    [fetchFiles.fulfilled]: (state, action) => {
      state.loading = false;
      state.files = action.payload;
    },
    [fetchFiles.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [uploadFile.pending]: (state) => {
      state.error = null;
      state.uploadStatus = null;
      state.loading = true;
    },
    [uploadFile.fulfilled]: (state, action) => {
      state.loading = false;
      state.files = action.payload;
      state.uploadStatus = "success";
    },
    [uploadFile.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
    [updateFile.pending]: (state) => {
      state.error = null;
      state.updateStatus = null;
      state.loading = true;
    },
    [updateFile.fulfilled]: (state, action) => {
      state.loading = false;
      state.files = state.files.map((file) =>
        file.id === action.payload.id ? action.payload : file
      );
      state.updateStatus = "success";
    },
    [updateFile.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.updateStatus = "failed";
    },
    [deleteFile.pending]: (state) => {
      state.error = null;
      state.loading = true;
    },
    [deleteFile.fulfilled]: (state, action) => {
      state.loading = false;
      state.files = state.files.filter((file) => file.id !== action.payload.id);
    },
    [deleteFile.rejected]: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
  },
});

export default fileSlice.reducer;

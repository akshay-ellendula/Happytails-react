import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../utils/axios";

/* ---------------------------------------
   FETCH ALL USERS
---------------------------------------- */
export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async () => {
        const res = await axiosInstance.get("/admin/customers");
        return res.data.users;
    }
);

/* ---------------------------------------
   FETCH USER STATS
---------------------------------------- */
export const fetchUserStats = createAsyncThunk(
    "users/fetchUserStats",
    async () => {
        const res = await axiosInstance.get("/admin/customers/stats");
        return res.data.stats;
    }
);

/* ---------------------------------------
   FETCH USER DETAILS
---------------------------------------- */
export const fetchUserDetails = createAsyncThunk(
    "users/fetchUserDetails",
    async (id) => {
        const res = await axiosInstance.get(`/admin/customers/${id}`);
        return res.data.Customer;
    }
);

/* ---------------------------------------
   UPDATE USER
---------------------------------------- */
export const updateUser = createAsyncThunk(
    "users/updateUser",
    async ({ id, data }) => {
        const res = await axiosInstance.put(`/admin/customers/${id}`, data);
        // API returns success message, not the updated user.
        // We return the data we sent so we can optimistically update the state.
        return { ...data, id };
    }
);

/* ---------------------------------------
   DELETE USER
---------------------------------------- */
export const deleteUser = createAsyncThunk(
    "users/deleteUser",
    async (id) => {
        await axiosInstance.delete(`/admin/customers/${id}`);
        return id;
    }
);

/* ---------------------------------------
   SLICE
---------------------------------------- */
const usersSlice = createSlice({
    name: "users",
    initialState: {
        usersList: [],
        stats: {},
        selectedUser: null,
        userDetails: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        clearUserDetails: (state) => {
            state.userDetails = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.usersList = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Fetch User Stats
            .addCase(fetchUserStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })

            // Fetch User Details
            .addCase(fetchUserDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.userDetails = action.payload;
            })
            .addCase(fetchUserDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Update User
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                // Merge updated fields into existing userDetails
                if (state.userDetails) {
                    state.userDetails = { ...state.userDetails, ...action.payload };
                }

                // Update users list globally
                const index = state.usersList.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.usersList[index] = { ...state.usersList[index], ...action.payload };
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })

            // Delete User
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.usersList = state.usersList.filter(u => u.id !== action.payload);
                state.userDetails = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setSelectedUser, clearUserDetails } = usersSlice.actions;
export default usersSlice.reducer;

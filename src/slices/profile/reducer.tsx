import { Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { encryptData } from "utils/cryptoUtils";

export interface ProfileState {
    user: User | null;
    token: string | null;
    loading: boolean;
    isUserLogout: boolean;
    error: boolean | null;
    errorMsg: string | null;
}

export const initialState: ProfileState = {
    user: null,
    token: null,
    error: false,// for error msg
    loading: false,
    isUserLogout: false,
    errorMsg: null,// for error
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        loginSuccess(state, action) {
            const tokens = action.payload.tokens;
            const user = action.payload.user;
            const siteSettings = action.payload.configurations;
            const eToken = encryptData(tokens.access.token);
            localStorage.setItem("token", eToken);
            localStorage.setItem("shifts", JSON.stringify(siteSettings.shifts));
            localStorage.setItem("timezone", JSON.stringify(siteSettings.timezone));
            state.token = tokens.access.token
            state.user = user
            state.loading = false;
            state.error = false;
            state.errorMsg = null;
        },
        apiError(state, action) {
            const error = action.payload;
            console.log("apiError >> ", error)
            state.error = true;
            state.errorMsg = error && error.data.message || '';
            state.loading = true;
            state.isUserLogout = false;
        },
        resetLoginFlag(state) {
            // state.error = null;
            state.error = false;
            state.loading = false;
            state.errorMsg = null;
        },
        logoutUserSuccess(state, action) {
            state.error = false;
            state.errorMsg = null;
            state.user = null;
            state.token = null;
            state.isUserLogout = true
        },
    }
});
export const { loginSuccess, apiError, resetLoginFlag, logoutUserSuccess } = profileSlice.actions;
export default profileSlice.reducer as Reducer<ProfileState>;
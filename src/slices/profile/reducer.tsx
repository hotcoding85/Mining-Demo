import { Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "Slices/users/reducer";
import { encryptData } from "Utils/cryptoUtils";

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
    errorMsg: "false",// for error
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        loginSuccess(state, action) {
            const tokens = action.payload.tokens;
            const user = action.payload.user;
            const eToken = encryptData(tokens.access.token);
            localStorage.setItem("token", eToken);
            state.token = tokens.access.token
            state.user = user
            state.loading = false;
            state.error = false;
            state.errorMsg = "";
        },
        apiError(state, action) {
            const error = action.payload
            state.errorMsg = error && error.message || '';
            state.loading = true;
            state.isUserLogout = false;
            state.error = true;
        },
        resetLoginFlag(state) {
            // state.error = null;
            state.error = false;
            state.loading = false;
            state.errorMsg = "";
        },
        logoutUserSuccess(state, action) {
            state.user = null;
            state.token = null;
            state.isUserLogout = true
        },
    }
});
export const { loginSuccess, apiError, resetLoginFlag, logoutUserSuccess } = profileSlice.actions;
export default profileSlice.reducer as Reducer<ProfileState>;
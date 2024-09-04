import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

interface CreateResponse {
    code: number,
    type: string,
    success: boolean,
    data: Configuration,
}

export interface ConfigurationsState {
    siteSettings: object;
    page: number;
    limit: number;
    total: number;
    loading: boolean;
    error: boolean | null;
    errorMsg: string | null;
}

export interface Configuration {
    id: string,
    timezone: string | undefined,
    shifts: object | undefined
}

export const initialState: ConfigurationsState = {
    siteSettings: {},
    page: 1,
    limit: 10,// for error msg
    total: 0,
    loading: false,
    error: false,// for error
    errorMsg: null
};

const configurationsSlice = createSlice({
    name: "configurations",
    initialState,
    reducers: {
        loading(state, action) {
            state.loading = true;
        },
        settingsSuccess(state, action) {
            state.siteSettings = action.payload.results
            state.total = action.payload.totalResults
            state.loading = false;
            state.error = false;
        },
        apiError(state, action) {
            state.loading = true;
            state.error = true;
            state.errorMsg = action.payload.reason
        },
    }
});
export const { settingsSuccess, apiError, loading } = configurationsSlice.actions;
export default configurationsSlice.reducer as Reducer<ConfigurationsState>;
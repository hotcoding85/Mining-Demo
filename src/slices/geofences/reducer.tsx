import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "Slices/users/reducer";
import { Vehicle } from "Slices/fleet/reducer";


interface CreateResponse {
    code: number,
    type: string,
    success: boolean,
    data: GeoFence,
}

interface GeoFence {
    id: string,
    name: string,
    locationId: string,
    geoJson: object
}

export interface GeoFenceState {
    data: GeoFence[];
    page: number;
    limit: number;
    total: number;
    loading: boolean;
    error: boolean | null;
    errorMsg: string | null;
}

export const initialState: GeoFenceState = {
    data: [],
    page: 1,
    limit: 10,// for error msg
    total: 0,
    loading: false,
    error: false,// for error
    errorMsg: null
};

const geoFenceSlice = createSlice({
    name: "geoFence",
    initialState,
    reducers: {
        allSuccess(state, action) {
            state.data = action.payload
            state.total = action.payload.length
            state.loading = false;
            state.error = false;
        },
        createSuccess(state, action: PayloadAction<CreateResponse>) {
            var newFence = action.payload.data
            state.data = [...state.data, newFence]
            state.loading = false;
            state.error = false;
        },
        updateSuccess(state, action: PayloadAction<CreateResponse>) {
            var newFence = action.payload.data
            var data = state.data.filter(item => item.id !== newFence.id)
            state.data = [...data, newFence]
            state.loading = false;
            state.error = false;
        },
        deleteSuccess(state, action) {
            var deletedId = action.payload.data as string
            state.data = state.data.filter(item => item.id !== deletedId);
            state.loading = false;
            state.error = false;
        },
        apiError(state, action) {
            state.loading = true;
            state.error = true;
        },
    }
});
export const { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } = geoFenceSlice.actions;
export default geoFenceSlice.reducer as Reducer<GeoFenceState>;
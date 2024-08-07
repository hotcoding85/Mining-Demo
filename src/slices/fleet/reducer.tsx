import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

interface CreateResponse {
    code: number,
    type: string,
    success: boolean,
    data: Vehicle,
}

export interface FleetState {
    data: Vehicle[];
    page: number;
    limit: number;
    total: number;
    loading: boolean;
    error: boolean | null;
    errorMsg: string | null;
}

export interface Vehicle {
    id: string,
    name: string | undefined,
    serial: string,
    make: string,
    model: string,
    category: string,
    capacity: number,
    odometer: number,
    status: string
}

export const initialState: FleetState = {
    data: [],
    page: 1,
    limit: 10,// for error msg
    total: 0,
    loading: false,
    error: false,// for error
    errorMsg: null
};

const fleetSlice = createSlice({
    name: "fleet",
    initialState,
    reducers: {
        allSuccess(state, action) {
            state.data = action.payload.results
            state.total = action.payload.totalResults
            state.loading = false;
            state.error = false;
        },
        createSuccess(state, action: PayloadAction<CreateResponse>) {
            var newVehicle = action.payload.data
            state.data = [...state.data, newVehicle]
            state.loading = false;
            state.error = false;
        },
        updateSuccess(state, action: PayloadAction<CreateResponse>) {
            var newVehicle = action.payload.data
            var data = state.data.filter(item => item.id !== newVehicle.id)
            state.data = [...data, newVehicle]
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
        tonnesFetched(state, action) {
            state.data = action.payload
            state.total = action.payload.total
            state.loading = false;
            state.error = false;
        },
        latestLocations(state, action) {
            state.data = action.payload
            state.total = action.payload.total
            state.loading = false;
            state.error = false;
        }
    }
});
export const { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess, tonnesFetched, latestLocations } = fleetSlice.actions;
export default fleetSlice.reducer as Reducer<FleetState>;
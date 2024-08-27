import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { Vehicle } from "slices/fleet/reducer";


interface CreateResponse {
    code: number,
    type: string,
    success: boolean,
    data: Target,
}

interface Target {
    id: string,
    roster: string,
    operators: User[],
    vehicle: Vehicle
}

export interface TargetState {
    data: Target[];
    page: number;
    limit: number;
    total: number;
    loading: boolean;
    error: boolean | null;
    errorMsg: string | null;
}

export const initialState: TargetState = {
    data: [],
    page: 1,
    limit: 10,// for error msg
    total: 0,
    loading: false,
    error: false,// for error
    errorMsg: null
};

const targetSlice = createSlice({
    name: "target",
    initialState,
    reducers: {
        allSuccess(state, action) {
            state.data = action.payload
            state.total = action.payload.total
            state.loading = false;
            state.error = false;
        },
        createSuccess(state, action: PayloadAction<CreateResponse>) {
            var newBench = action.payload.data
            state.data = [...state.data, newBench]
            state.loading = false;
            state.error = false;
        },
        updateSuccess(state, action: PayloadAction<CreateResponse>) {
            var newBench = action.payload.data
            var data = state.data.filter(item => item.id !== newBench.id)
            state.data = [...data, newBench]
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
export const { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } = targetSlice.actions;
export default targetSlice.reducer as Reducer<TargetState>;
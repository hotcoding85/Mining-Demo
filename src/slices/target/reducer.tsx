import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { Vehicle } from "slices/fleet/reducer";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: Target;
}

interface TargetData {
  availability: number;
  avgLoad: number;
  avgTime: number;
  loads: number;
  standby: number;
  tonnes: number;
  utilization: number;
}

interface Target {
  id: string;
  roster: string;
  operators: User[];
  vehicleId: string;
  data: TargetData;
  vehicle: Vehicle;
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
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const targetSlice = createSlice({
  name: "target",
  initialState,
  reducers: {
    allSuccess(state, action) {
      state.data = action.payload;
      state.total = action.payload.length;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponse>) {
      var targets: any = action.payload.data;
      state.data = targets;
      state.loading = false;
      state.error = false;
    },
    updateSuccess(state, action: PayloadAction<CreateResponse>) {
      var newTarget = action.payload.data;
      var data = state.data.filter((item) => item.id !== newTarget.id);
      state.data = [...data, newTarget];
      state.loading = false;
      state.error = false;
    },
    deleteSuccess(state, action) {
      var deletedId = action.payload.data as string;
      state.data = state.data.filter((item) => item.id !== deletedId);
      state.loading = false;
      state.error = false;
    },
    apiError(state, action) {
      state.loading = true;
      state.error = true;
    },
  },
});
export const {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} = targetSlice.actions;
export default targetSlice.reducer as Reducer<TargetState>;

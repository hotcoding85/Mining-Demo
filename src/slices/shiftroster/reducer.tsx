import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { Vehicle } from "slices/fleet/reducer";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: ShiftRoster;
}

export interface ShiftRoster {
  id?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  _type?: string;
  roster: string;
  operators: User[];
  vehicle?: Vehicle;
  vehicleId: string;
  trainers: User[];
  trucks: Vehicle[];
}

export interface ShiftRosterState {
  data: ShiftRoster[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export const initialState: ShiftRosterState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const shiftrosterSlice = createSlice({
  name: "shiftroster",
  initialState,
  reducers: {
    allSuccess(state, action) {
      state.data = action.payload;
      state.total = action.payload.length;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponse>) {
      var newBench = action.payload.data;
      state.data = [...state.data, newBench];
      state.loading = false;
      state.error = false;
    },
    upsertSuccess(state, action: PayloadAction<CreateResponse>) {
      var newBenches: any = action.payload.data;
      var newBenchesIds = newBenches?.map((item) => item.id);
      var data = state.data.filter((item) => !newBenchesIds.includes(item.id));
      state.data = [...data, ...newBenches];
      state.loading = false;
      state.error = false;
    },
    updateSuccess(state, action: PayloadAction<CreateResponse>) {
      var newBench = action.payload.data;
      var data = state.data.filter((item) => item.id !== newBench.id);
      state.data = [...data, newBench];
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
  upsertSuccess,
  deleteSuccess,
} = shiftrosterSlice.actions;
export default shiftrosterSlice.reducer as Reducer<ShiftRosterState>;

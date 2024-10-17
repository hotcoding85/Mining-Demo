import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { Vehicle } from "slices/fleet/reducer";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: Dispatch;
}

interface Dispatch {
  id: string;
  roster: string;
  operators: User[];
  vehicle: Vehicle;
}

export interface DispatchState {
  data: Dispatch[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export const initialState: DispatchState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState,
  reducers: {
    allSuccess(state, action) {
      state.data = action.payload;
      state.total = action.payload.length;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponse>) {
      var newBench = action.payload.data[0];
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
      var newBench = action.payload.data[0];
      var data = state.data.filter((item) => item.id !== newBench.id);
      state.data = [...data, newBench];
      state.loading = false;
      state.error = false;
    },
    deleteSuccess(state, action) {
      var deletedIds = action.payload.data as string;
      state.data = state.data.filter((item) => !deletedIds.includes(item.id));
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
} = dispatchSlice.actions;
export default dispatchSlice.reducer as Reducer<DispatchState>;

import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: VehicleStateReason;
}

interface VehicleStateReason {
  id: string;
  vehicleType: string;
  category: string;
  code: string;
  description: string;
}

interface UpsertResponse {
  data: VehicleStateReason[];
}

export interface VehicleStateReasonState {
  data: VehicleStateReason[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export const initialState: VehicleStateReasonState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const stateReasonSlice = createSlice({
  name: "stateReason",
  initialState,
  reducers: {
    allSuccess(state, action) {
      state.data = action.payload.results;
      state.total = action.payload.totalResults;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponse>) {
      var newBench = action.payload.data;
      state.data = [...state.data, newBench];
      state.loading = false;
      state.error = false;
    },
    upsertSuccess(state, action: PayloadAction<UpsertResponse>) {
      var benches = action.payload.data;
      state.data = benches;
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
      toast.error(action?.payload?.data?.message || "Server Error!", {
        autoClose: 2000,
      });
    },
  },
});
export const {
  allSuccess,
  apiError,
  upsertSuccess,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} = stateReasonSlice.actions;
export default stateReasonSlice.reducer as Reducer<VehicleStateReasonState>;

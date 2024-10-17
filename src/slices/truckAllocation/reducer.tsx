import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: TruckAllocation;
}

interface CreateResponses {
  code: number;
  type: string;
  success: boolean;
  data: TruckAllocation[];
}

interface TruckAllocation {
  id: string;
  roster: string;
  truckId: string;
  destinationId: string;
  status: string;
  deleteIds:string[];
}

export interface TruckAllocationState {
  data: TruckAllocation[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export const initialState: TruckAllocationState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const truckAllocationSlice = createSlice({
  name: "truckAllocation",
  initialState,
  reducers: {
    allSuccess(state, action) {
      state.data = action.payload;
      state.total = action.payload.length;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponses>) {
      var newBench = action.payload.data;
      state.data = [...state.data, ...newBench];
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
      var deletedIds = action.payload.data as string[];
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
} = truckAllocationSlice.actions;
export default truckAllocationSlice.reducer as Reducer<TruckAllocationState>;

import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: Tracker;
}

export interface TrackersState {
  data: Tracker[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

interface Tracker {
  id: string;
  name: string | undefined;
  identifier: string;
  platform: number;
  vehicle: object;
  vehicleId: object;
}

export const initialState: TrackersState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const trackersSlice = createSlice({
  name: "trackers",
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
  deleteSuccess,
} = trackersSlice.actions;
export default trackersSlice.reducer as Reducer<TrackersState>;

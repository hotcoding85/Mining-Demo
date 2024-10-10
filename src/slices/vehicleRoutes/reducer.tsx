import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { Feature } from "interfaces/GeoJson";

export interface VehicleRoute {
  id: string;
  name: string | undefined;
  status: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  distance: number;
  duration: number;
  speedLimits: number;
  category: string;
  geoJson: Feature;
}

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: VehicleRoute;
}

export interface VehicleRoutesState {
  data: VehicleRoute[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export const initialState: VehicleRoutesState = {
  data: [],
  page: 1,
  limit: 100, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const vehicleRoutesSlice = createSlice({
  name: "vehicleRoutes",
  initialState,
  reducers: {
    loading(state, action) {
      state.loading = true;
    },
    allSuccess(state, action) {
      state.data = action.payload.results;
      state.total = action.payload.totalResults;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponse>) {
      var user = action.payload.data;
      state.data = [...state.data, user];
      state.loading = false;
      state.error = false;
    },
    updateSuccess(state, action: PayloadAction<CreateResponse>) {
      var user = action.payload.data;
      var data = state.data.filter((item) => item.id !== user.id);
      state.data = [...data, user];
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
  loading,
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} = vehicleRoutesSlice.actions;

export default vehicleRoutesSlice.reducer as Reducer<VehicleRoutesState>;

import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { Vehicle } from "slices/fleet/reducer";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: Events;
}

interface Events {
  id: string;
  roster: string;
  operators: User[];
  vehicle: Vehicle;
}

export interface EventsState {
  data: Events[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
  dashboardTruckingInfo: any[];
  dashboardMaterialTons: any[];
  dashboardFMSUtilPercent: any[];
  dashboardUtilPercent: any[];
  fleetUtilInfo: any[];
  vehicleLatestState: any[];
}

export const initialState: EventsState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
  dashboardTruckingInfo: [],
  dashboardMaterialTons: [],
  dashboardFMSUtilPercent: [],
  dashboardUtilPercent: [],
  fleetUtilInfo: [],
  vehicleLatestState: [],
};

const EventsSlice = createSlice({
  name: "Events",
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
    dashboardTruckingInfoSuccess(state, action) {
      state.dashboardTruckingInfo = action.payload;
      state.loading = false;
      state.error = false;
    },
    dashboardMaterialTonsSuccess(state, action) {
      state.dashboardMaterialTons = action.payload;
    },
    dashboardUtilSuccess(state, action) {
      state.dashboardUtilPercent = action.payload;
    },
    fleetInfoSuccess(state, action) {
      state.fleetUtilInfo = action.payload;
    },
    vehicleLatestStateSuccess(state, action) {
      state.vehicleLatestState = action.payload;
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
  dashboardTruckingInfoSuccess,
  dashboardMaterialTonsSuccess,
  dashboardUtilSuccess,
  fleetInfoSuccess,
  vehicleLatestStateSuccess,
} = EventsSlice.actions;
export default EventsSlice.reducer as Reducer<EventsState>;

import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { User } from "slices/users/reducer";
import { Vehicle } from "slices/fleet/reducer";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: EventMetas;
}

interface CreateResponses {
  code: number;
  type: string;
  success: boolean;
  data: EventMetas[];
}

interface EventMetas {
  id: string;
  roster: string;
  operators: User[];
  vehicle: Vehicle;
}

export interface EventMetaState {
  data: EventMetas[];
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

export const initialState: EventMetaState = {
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

const EventMetasSlice = createSlice({
  name: "EventMetas",
  initialState,
  reducers: {
    allSuccess(state, action) {
      state.data = action.payload.data;
      state.total = action.payload.data?.length;
      state.loading = false;
      state.error = false;
    },
    createSuccess(state, action: PayloadAction<CreateResponses>) {
      var newBench: any = action.payload.data;
      state.data = [...state.data, ...newBench];
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
  deleteSuccess,
} = EventMetasSlice.actions;
export default EventMetasSlice.reducer as Reducer<EventMetaState>;

import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: Material;
}

interface UpsertResponse {
  success: boolean;
  data: Material[];
}

export interface MaterialsState {
  data: Material[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  grade: number;
  tonnes: number;
  color: string;
  status: string;
}

export const initialState: MaterialsState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const materialsSlice = createSlice({
  name: "materials",
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
      var existingData = state.data.filter(
        (bench) => !benches.find((item) => item.id === bench.id)
      );
      state.data = [...existingData, ...benches];
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
  upsertSuccess,
  updateSuccess,
  deleteSuccess,
} = materialsSlice.actions;
export default materialsSlice.reducer as Reducer<MaterialsState>;

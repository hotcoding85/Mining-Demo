import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: MenuSetting;
}

interface MenuSetting {
  id?: string;
  title: string;
  router: string;
  access: string[];
  children?: MenuSetting;
}

interface UpsertResponse {
  data: MenuSetting[];
}

export interface MenuSettingState {
  data: MenuSetting[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export const initialState: MenuSettingState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const menuSettingSlice = createSlice({
  name: "menuSetting",
  initialState,
  reducers: {
    allSuccess(state, action) {
      const result = JSON.parse(action.payload);
      state.data = result?.results || [];
      state.total = result?.totalResults || 0;
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
      // var deletedId = action.payload.data as string;
      // state.data = state.data.filter((item) => item.id !== deletedId);
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
} = menuSettingSlice.actions;
export default menuSettingSlice.reducer;

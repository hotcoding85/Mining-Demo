import { PayloadAction, Reducer, createSlice } from "@reduxjs/toolkit";

interface CreateResponse {
  code: number;
  type: string;
  success: boolean;
  data: User;
}

interface UpsertResponse {
  success: boolean;
  data: User[];
}

export interface UsersState {
  data: User[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: boolean | null;
  errorMsg: string | null;
}

export interface User {
  id: string;
  firstName: string | undefined;
  lastName: string | undefined;
  role: string;
  username: string;
  employeeId: string;
  email: string;
  mobile: string;
  status: string;
  crew: string;
  skills: string[];
}

export const initialState: UsersState = {
  data: [],
  page: 1,
  limit: 10, // for error msg
  total: 0,
  loading: false,
  error: false, // for error
  errorMsg: null,
};

const usersSlice = createSlice({
  name: "users",
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
    upsertSuccess(state, action: PayloadAction<UpsertResponse>) {
      var benches = action.payload.data;
      var existingData = state.data.filter(
        (bench) => !benches.find((item) => item.id === bench.id)
      );
      state.data = [...existingData, ...benches];
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
      state.errorMsg = action.payload.reason;
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
  loading,
} = usersSlice.actions;
export default usersSlice.reducer as Reducer<UsersState>;

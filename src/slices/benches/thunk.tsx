import {
  getBenches,
  postBench,
  putBench,
  deleteBench,
  postUpsertBenches,
} from "Helpers/api_benches_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
  upsertSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getAllBenches =
  (
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "ASC",
    name?,
    category?
  ) =>
  async (dispatch: any) => {
    try {
      let response: any;
      response = await getBenches(
        page,
        limit,
        sortBy,
        sortOrder,
        name,
        category
      );
      dispatch(allSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const addBench = (bench: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postBench(bench);
    dispatch(createSuccess(response));
    return response["data"];
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const upsertBenches = (benches: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postUpsertBenches(benches);
    dispatch(upsertSuccess(response));
    toast.success("Successfully uploaded!", { autoClose: 2000 });
  } catch (error: any) {
    toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
    dispatch(apiError(error));
  }
};

export const updateBench =
  (id: string, bench: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await putBench(id, bench);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeBench = (id: string) => async (dispatch: any) => {
  try {
    let response: any;
    response = await deleteBench(id);
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

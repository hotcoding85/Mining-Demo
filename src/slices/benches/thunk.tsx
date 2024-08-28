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
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const upsertBenches = (benches: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postUpsertBenches(benches);
    dispatch(upsertSuccess(response));
    return true;
  } catch (error) {
    dispatch(apiError(error));
    return false;
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

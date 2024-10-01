import {
  getStateReasons,
  postStateReason,
  putStateReason,
  deleteStateReason,
  postStateReasons,
} from "Helpers/api_statereason_helper";
import {
  allSuccess,
  apiError,
  upsertSuccess,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getVehicleStateReasons =
  (page = 1, limit = 100, sortBy = "code", name?, category?) =>
  async (dispatch: any) => {
    try {
      let response: any = await getStateReasons({
        page: page,
        limit: limit,
        sortBy: sortBy,
      });
      dispatch(allSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const addVehicleStateReason =
  (stateReason: any) => async (dispatch: any) => {
    try {
      let response: any = await postStateReason(stateReason);
      toast.success("State Reason added successfully", { autoClose: 2000 });
      dispatch(createSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const addVehicleStateReasons =
  (stateReason: any) => async (dispatch: any) => {
    try {
      let response: any = await postStateReasons(stateReason);
      toast.success(
        `${response.data?.length} State Reasons added successfully`,
        {
          autoClose: 2000,
        }
      );
      dispatch(upsertSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const updateVehicleStateReason =
  (id: string, stateReason: any) => async (dispatch: any) => {
    try {
      let response: any = await putStateReason(id, stateReason);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeVehicleStateReason =
  (id: string) => async (dispatch: any) => {
    try {
      let response: any = await deleteStateReason(id);
      dispatch(deleteSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

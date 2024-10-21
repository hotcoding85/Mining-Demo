import {
  getTruckAllocation,
  postTruckAllocation,
  putTruckAllocation,
  deleteTruckAllocation,
  deleteTruckAllocations,
  postTruckAllocations,
} from "Helpers/api_truck_allocation_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  upsertSuccess,
  updateSuccess,
  deleteSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getTruckAllocations = (roster) => async (dispatch: any) => {
  try {
    let response: any;
    response = await getTruckAllocation(roster);
    dispatch(allSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const addTruckAllocation =
  (TruckAllocation: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await postTruckAllocations(TruckAllocation);
      toast.success("TruckAllocation added successfully", { autoClose: 2000 });
      dispatch(createSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const addTruckAllocations =
  (truckAllocations: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await postTruckAllocations(truckAllocations);
      toast.success(
        `${response.data.length} truckAllocations added successfully`,
        {
          autoClose: 2000,
        }
      );
      dispatch(createSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const updateTruckAllocation =
  (id: string, TruckAllocation: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await putTruckAllocation(id, TruckAllocation);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeTruckAllocations = (id: any) => async (dispatch: any) => {
  try {
    let response: any;
    if (typeof id === "string") {
      response = await deleteTruckAllocation(id);
    } else {
      response = await deleteTruckAllocations(id);
    }
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const removeTruckAllocationFromState =
  (truckAllocations: any) => async (dispatch: any) => {
    dispatch(
      deleteSuccess({
        data: truckAllocations,
      })
    );
  };
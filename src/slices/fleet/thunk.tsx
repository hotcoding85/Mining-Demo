import {
  getFleet,
  postVehicle,
  putVehicle,
  deleteVehicle,
  getTonnesMovedByRoster,
  getVehicleLatestLocations,
  postUpsertVehicles,
} from "Helpers/api_vehicle_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
  tonnesFetched,
  latestLocations,
  upsertSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getAllFleet =
  (
    page = 1,
    limit = 100,
    sortBy = "name",
    sortOrder = "ASC",
    name?,
    category?
  ) =>
  async (dispatch: any) => {
    try {
      let response: any;
      response = await getFleet(page, limit, sortBy, sortOrder, name, category);
      dispatch(allSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const addVehicle = (vehicle: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postVehicle(vehicle);
    toast.success("Vehicle added successfully", { autoClose: 2000 });
    dispatch(createSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const upsertVehicles = (formData: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postUpsertVehicles(formData);
    toast.success("Vehicles uploaded successfully", { autoClose: 2000 });
    dispatch(upsertSuccess(response));
  } catch (error: any) {
    toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
    dispatch(apiError(error));
  }
};

export const updateVehicle =
  (id: string, vehicle: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await putVehicle(id, vehicle);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeVehicle = (id: string) => async (dispatch: any) => {
  try {
    let response: any;
    response = await deleteVehicle(id);
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const getTonnesMoved = (roster) => async (events: any) => {
  try {
    let response: any;
    response = await getTonnesMovedByRoster(roster);
    events(tonnesFetched(response));
  } catch (error) {
    events(apiError(error));
  }
};

export const getVehicleLatestLocs = (roster) => async (events: any) => {
  try {
    let response: any;
    response = await getVehicleLatestLocations(roster);
    events(latestLocations(response));
  } catch (error) {
    events(apiError(error));
  }
};

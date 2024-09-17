import {
  getGeoFence,
  postGeoFence,
  putGeoFence,
  deleteGeoFence,
  postUpsertGeoFence,
} from "Helpers/api_geofence_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
  upsertSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getGeoFences = () => async (geoFence: any) => {
  try {
    let response: any;
    response = await getGeoFence();
    geoFence(allSuccess(response));
  } catch (error) {
    geoFence(apiError(error));
  }
};

export const addGeoFence = (GeoFence: any) => async (geoFence: any) => {
  try {
    let response: any;
    response = await postGeoFence(GeoFence);
    toast.success("GeoFence added successfully", { autoClose: 2000 });
    geoFence(createSuccess(response));
    return true;
  } catch (error: any) {
    toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
    geoFence(apiError(error));
    return false;
  }
};

export const upsertGeoFence = (formData: any) => async (geoFence: any) => {
  try {
    let response: any;
    response = await postUpsertGeoFence(formData);
    toast.success("GeoFences uploaded successfully", { autoClose: 2000 });
    geoFence(upsertSuccess(response));
  } catch (error: any) {
    toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
    geoFence(apiError(error));
  }
};

export const updateGeoFence =
  (id: string, GeoFence: any) => async (geoFence: any) => {
    try {
      let response: any;
      response = await putGeoFence(id, GeoFence);
      toast.success("GeoFence updated successfully", { autoClose: 2000 });
      geoFence(updateSuccess(response));
      return true;
    } catch (error: any) {
      toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
      geoFence(apiError(error));
      return false;
    }
  };

export const removeGeoFence = (id: string) => async (geoFence: any) => {
  try {
    let response: any;
    response = await deleteGeoFence(id);
    toast.success("GeoFence deleted successfully", { autoClose: 2000 });
    geoFence(deleteSuccess(response));
  } catch (error: any) {
    toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
    geoFence(apiError(error));
  }
};

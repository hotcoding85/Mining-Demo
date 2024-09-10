import {
  getMaterials,
  postMaterial,
  putMaterial,
  deleteMaterial,
  postMaterials,
  postUpsertMaterials,
} from "Helpers/api_materials_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
  upsertSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getAllMaterials =
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
      response = await getMaterials(
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

export const addMaterial = (material: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postMaterial(material);
    toast.success("Material added successfully", { autoClose: 2000 });
    dispatch(createSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const addMaterials = (materials: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postMaterials(materials);
    toast.success(`${response.date?.length} materials added successfully`, {
      autoClose: 2000,
    });
    dispatch(createSuccess(response));
    return response;
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const upsertMaterials = (formData: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postUpsertMaterials(formData);
    toast.success("Materials uploaded successfully", { autoClose: 2000 });
    dispatch(upsertSuccess(response));
  } catch (error: any) {
    toast.error(error?.data?.message || "Server Error!", { autoClose: 2000 });
    dispatch(apiError(error));
  }
};

export const updateMaterial =
  (id: string, material: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await putMaterial(id, material);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeMaterial = (id: string) => async (dispatch: any) => {
  try {
    let response: any;
    response = await deleteMaterial(id);
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

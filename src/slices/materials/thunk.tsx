import { getMaterials, postMaterial, putMaterial, deleteMaterial } from "Helpers/api_materials_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } from "./reducer";
import { toast } from "react-toastify";

export const getAllMaterials = (page = 1, limit = 10) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getMaterials(page, limit)
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const addMaterial = (material: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postMaterial(material)
        toast.success("Material added successfully", { autoClose: 2000 });
        dispatch(createSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const updateMaterial = (id: string, material: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putMaterial(id, material)
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const removeMaterial = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteMaterial(id)
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}
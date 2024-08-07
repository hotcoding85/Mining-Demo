import { getDevices, postDevice, putDevice, deleteDevice } from "Helpers/api_devices_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } from "./reducer";
import { toast } from "react-toastify";

export const getAllDevices = (page = 1, limit = 10) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getDevices(page, limit)
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const addDevice = (device: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postDevice(device)
        toast.success("Device added successfully", { autoClose: 2000 });
        dispatch(createSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const updateDevice = (id: string, device: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putDevice(id, device)
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const removeDevice = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteDevice(id)
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}
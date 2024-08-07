import { getShiftRoster, postShiftRoster, putShiftRoster, deleteShiftRoster } from "Helpers/api_shiftroster_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } from "./reducer";
import { toast } from "react-toastify";


export const getShiftRosters = (roster) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getShiftRoster(roster)
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const addShiftRoster = (ShiftRoster: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postShiftRoster(ShiftRoster)
        toast.success("ShiftRoster added successfully", { autoClose: 2000 });
        dispatch(createSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const updateShiftRoster = (id: string, ShiftRoster: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putShiftRoster(id, ShiftRoster)
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const removeShiftRoster = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteShiftRoster(id)
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}
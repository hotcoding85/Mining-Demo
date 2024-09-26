import { getTargetByRoster, getTargetByRosterAndCategory, putTarget, deleteTarget, postTargets } from "Helpers/api_target_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } from "./reducer";
import { toast } from "react-toastify";


export const getTargetsByRoster = (roster) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getTargetByRoster(roster)
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const getTargetsByRosterAndCategory = (roster, category) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getTargetByRosterAndCategory(roster, category)
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const addTargets = (targets: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postTargets(targets)
        toast.success("Targets updated successfully", { autoClose: 1000, position: 'top-center' });
        dispatch(createSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const updateTarget = (id: string, Target: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putTarget(id, Target)
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const removeTarget = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteTarget(id)
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}
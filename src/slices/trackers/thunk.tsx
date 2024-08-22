import { getTrackers, postTracker, putTracker, deleteTracker } from "Helpers/api_trackers_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } from "./reducer";
import { toast } from "react-toastify";

export const getAllTrackers = (page = 1, limit = 10) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getTrackers(page, limit)
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const addTracker = (tracker: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postTracker(tracker)
        toast.success("Tracker added successfully", { autoClose: 2000 });
        dispatch(createSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const updateTracker = (id: string, tracker: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putTracker(id, tracker)
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const removeTracker = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteTracker(id)
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}
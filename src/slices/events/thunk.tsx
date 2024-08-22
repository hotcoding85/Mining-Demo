import { getEvents, postEvents, putEvents, deleteEvents } from "Helpers/api_events_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess } from "./reducer";
import { toast } from "react-toastify";


export const getAllEvents = (roster) => async (events: any) => {
    try {
        let response: any;
        response = await getEvents(roster)
        events(allSuccess(response));
    } catch (error) {
        events(apiError(error));
    }
}

export const addEvents = (Events: any) => async (events: any) => {
    try {
        let response: any;
        response = await postEvents(Events)
        toast.success("Events added successfully", { autoClose: 2000 });
        events(createSuccess(response));
    } catch (error) {
        events(apiError(error));
    }
}

export const updateEvents = (id: string, Events: any) => async (events: any) => {
    try {
        let response: any;
        response = await putEvents(id, Events)
        events(updateSuccess(response));
    } catch (error) {
        events(apiError(error));
    }
}

export const removeEvents = (id: string) => async (events: any) => {
    try {
        let response: any;
        response = await deleteEvents(id)
        events(deleteSuccess(response));
    } catch (error) {
        events(apiError(error));
    }
}
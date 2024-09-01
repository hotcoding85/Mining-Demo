import { getEvents, postEvents, putEvents, deleteEvents, getDashboardTruckingInfo, getMaterialTons, getUtilInfo, getFleetInfo, getVehicleLatestState } from "Helpers/api_events_helper";
import { allSuccess, apiError, createSuccess, updateSuccess, deleteSuccess, dashboardTruckingInfoSuccess, dashboardMaterialTonsSuccess, dashboardUtilSuccess, fleetInfoSuccess, vehicleLatestStateSuccess } from "./reducer";
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

export const dashboardTruckingInfo = (roster: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getDashboardTruckingInfo(roster)
        dispatch(dashboardTruckingInfoSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const dashboardMaterialTons = (roster: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getMaterialTons(roster)
        dispatch(dashboardMaterialTonsSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const dashboardUtilInfo = (roster: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getUtilInfo(roster);
        dispatch(dashboardUtilSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const fleetInfo = (roster: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await getFleetInfo(roster);
        dispatch(fleetInfoSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const vehicleLatestState = () => async (dispatch: any) => {
    try {
        let response: any;
        response = await getVehicleLatestState();
        dispatch(vehicleLatestStateSuccess(response.data));
    } catch (error) {
        dispatch(apiError(error));
    }
}
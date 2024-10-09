import { getAll, postRoute, putRoute, deleteRoute } from "Helpers/api_auto_routing";
import { allSuccess, apiError, createSuccess, deleteSuccess, loading, updateSuccess } from "./reducer";

export const getAllVehicleRoutes = (
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "ASC",
    name?,
    category?
) => async (dispatch: any) => {
    try {
        let response: any;
        dispatch(loading)
        response = await getAll()
        dispatch(allSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const addRoute = (route: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postRoute(route)
        dispatch(createSuccess(response));
    } catch (error: any) {
        dispatch(apiError(error.data));
    }
}

export const updateRoute = (id: string, route: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putRoute(id, route)
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

export const removeRoute = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteRoute(id)
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}
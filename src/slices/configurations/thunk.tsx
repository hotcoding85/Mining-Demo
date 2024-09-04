import { getConfigurations } from "Helpers/api_configurations_helper";
import { settingsSuccess, apiError, loading } from "./reducer";

export const getSiteSettings = (id) => async (dispatch: any) => {
    try {
        let response: any;
        dispatch(loading)
        response = await getConfigurations(id)
        dispatch(settingsSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
}

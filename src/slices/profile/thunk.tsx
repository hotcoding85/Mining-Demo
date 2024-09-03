import { postLogin } from "Helpers/api_auth_helper";
import { loginSuccess, apiError, logoutUserSuccess, resetLoginFlag } from "./reducer";

export const loginuser = (user: any, history: any) => async (dispatch: any) => {
    try {
        let response = await postLogin({
            username: user.email,
            password: user.password
        })
        if (response && response.configurations && response.configurations && response.configurations.shifts && response.configurations.timezone) {
            dispatch(loginSuccess(response));
        } else {
            dispatch(apiError({
                data: {
                    message: 'Configuration is missing'
                }
            }));
        }
        history('/');
    } catch (error: any) {
        console.log(error)
        dispatch(apiError(error));
    }
}

export const resetLoginFlagState = () => async (dispatch: any) => {
    try {
        dispatch(resetLoginFlag())
    } catch (error) {
        console.log(error)
    }
};

export const logoutUser = () => async (dispatch: any) => {
    try {
        localStorage.removeItem("token");
        dispatch(logoutUserSuccess(true));

    } catch (error) {
        dispatch(apiError(error));
    }
};
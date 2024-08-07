import { postLogin } from "Helpers/api_auth_helper";
import { loginSuccess, apiError, logoutUserSuccess } from "./reducer";

export const loginuser = (user: any, history: any) => async (dispatch: any) => {
    try {
        let response = await postLogin({
            username: user.email,
            password: user.password
        })
        dispatch(loginSuccess(response));
        history('/');
    } catch (error: any) {
        console.log(error)
        dispatch(apiError(error));
    }
}

export const logoutUser = () => async (dispatch: any) => {
    try {
        localStorage.removeItem("token");
        dispatch(logoutUserSuccess(true));
        
    } catch (error) {
        dispatch(apiError(error));
    }
};
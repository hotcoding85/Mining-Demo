import {
    getUsers,
    postUser,
    postUsers,
    putUser,
    deleteUser,
} from "Helpers/api_users_helper";
import {
    allSuccess,
    apiError,
    createSuccess,
    updateSuccess,
    deleteSuccess,
    loading,
} from "./reducer";

export const getAllUsers =
    (
        page = 1,
        limit = 10,
        sortBy = "firstName",
        sortOrder = "ASC",
        firstName?,
        lastName?
    ) =>
        async (dispatch: any) => {
            try {
                let response: any;
                dispatch(loading);
                response = await getUsers(
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                    firstName,
                    lastName
                );
                dispatch(allSuccess(response));
            } catch (error) {
                dispatch(apiError(error));
            }
        };

export const addUser = (user: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postUser(user);
        dispatch(createSuccess(response));
    } catch (error: any) {
        dispatch(apiError(error.data));
    }
};

export const addUsers = (users: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await postUsers(users);
        dispatch(createSuccess(response));
    } catch (error: any) {
        dispatch(apiError(error.data));
    }
};

export const updateUser = (id: string, user: any) => async (dispatch: any) => {
    try {
        let response: any;
        response = await putUser(id, user);
        dispatch(updateSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
};

export const removeUser = (id: string) => async (dispatch: any) => {
    try {
        let response: any;
        response = await deleteUser(id);
        dispatch(deleteSuccess(response));
    } catch (error) {
        dispatch(apiError(error));
    }
};

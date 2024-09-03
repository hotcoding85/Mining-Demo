import {
  getDispatch,
  postDispatch,
  putDispatch,
  deleteDispatch,
  postDispatchs,
} from "Helpers/api_dispatch_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getDispatchs = (roster) => async (dispatch: any) => {
  try {
    let response: any;
    response = await getDispatch(roster);
    dispatch(allSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const addDispatch = (Dispatch: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postDispatch(Dispatch);
    toast.success("Dispatch added successfully", { autoClose: 2000 });
    dispatch(createSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const addDispatchs = (dispatchs: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postDispatchs(dispatchs);
    toast.success(`${response.data.length} dispatchs added successfully`, {
      autoClose: 2000,
    });
    dispatch(createSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const updateDispatch =
  (id: string, Dispatch: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await putDispatch(id, Dispatch);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeDispatch = (id: string) => async (dispatch: any) => {
  try {
    let response: any;
    response = await deleteDispatch(id);
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

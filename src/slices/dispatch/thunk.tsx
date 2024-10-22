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
  upsertSuccess,
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

export const addDispatch =
  (Dispatch: any, disableNotify?: boolean) => async (dispatch: any) => {
    try {
      let response: any;
      response = await postDispatch(Dispatch);
      if (!disableNotify)
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
    dispatch(upsertSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const updateDispatch =
  (id: string, Dispatch: any, disableNotify?: boolean) =>
  async (dispatch: any) => {
    try {
      let response: any;
      response = await putDispatch(id, Dispatch);
      if (!disableNotify) {
        toast.success(`Dispatch updated successfully`, {
          autoClose: 2000,
        });
      }
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeDispatch =
  (id: string, disableNotify?: boolean) => async (dispatch: any) => {
    try {
      let response: any;
      response = await deleteDispatch(id);
      if (!disableNotify)
        toast.success(`Dispatch deleted successfully`, {
          autoClose: 2000,
        });
      dispatch(deleteSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeDispatchFromState =
  (dispatchs: any) => async (dispatch: any) => {
    dispatch(
      deleteSuccess({
        data: dispatchs,
      })
    );
  };

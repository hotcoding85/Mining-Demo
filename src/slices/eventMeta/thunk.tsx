import {
  getEventMeta,
  postEventMetas,
  putEventMetas,
  deleteEventMetas,
} from "Helpers/api_eventMetas_helper";
import {
  allSuccess,
  apiError,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getEventMetas = (roster) => async (dispatch: any) => {
  try {
    let response: any = await getEventMeta(roster);
    dispatch(allSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const addEventMetas = (eventMetas: any) => async (dispatch: any) => {
  try {
    let response: any;
    response = await postEventMetas(eventMetas);
    toast.success("EventMetas added successfully", { autoClose: 2000 });
    dispatch(createSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const updateEventMetas =
  (id: string, eventMetas: any) => async (dispatch: any) => {
    try {
      let response: any;
      response = await putEventMetas(id, eventMetas);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeEventMetas = (ids: any[]) => async (dispatch: any) => {
  try {
    let response: any;
    response = await deleteEventMetas(ids);
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const removeEventMetasFromState =
  (eventMetas: any) => async (dispatch: any) => {
    dispatch(
      deleteSuccess({
        data: eventMetas,
      })
    );
  };

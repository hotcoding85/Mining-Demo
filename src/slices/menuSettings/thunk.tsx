import {
  getMenuSettings as getAllMenuSettings,
  postMenuSetting,
  putMenuSetting,
  deleteMenuSetting,
  postMenuSettings,
} from "Helpers/api_menusettings_helper";
import {
  allSuccess,
  apiError,
  upsertSuccess,
  createSuccess,
  updateSuccess,
  deleteSuccess,
} from "./reducer";
import { toast } from "react-toastify";

export const getMenuSettings =
  (page = 1, limit = 100, sortBy = "title") =>
  async (dispatch: any) => {
    try {
      let response: any = await getAllMenuSettings({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });
      dispatch(allSuccess(JSON.stringify(response)));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const addMenuSetting = (menuSetting: any) => async (dispatch: any) => {
  try {
    let response: any = await postMenuSetting(menuSetting);
    toast.success("Menu structure saved successfully", { autoClose: 2000 });
    dispatch(createSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

export const addMenuSettings =
  (menuSetting: any, deletedIds?: string[]) => async (dispatch: any) => {
    try {
      let response: any = await postMenuSettings(menuSetting, deletedIds);
      toast.success(`Menu structure saved successfully`, {
        autoClose: 2000,
      });
      dispatch(upsertSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const updateMenuSetting =
  (id: string, menuSetting: any) => async (dispatch: any) => {
    try {
      let response: any = await putMenuSetting(id, menuSetting);
      dispatch(updateSuccess(response));
    } catch (error) {
      dispatch(apiError(error));
    }
  };

export const removeMenuSetting = (id: string) => async (dispatch: any) => {
  try {
    let response: any = await deleteMenuSetting(id);
    dispatch(deleteSuccess(response));
  } catch (error) {
    dispatch(apiError(error));
  }
};

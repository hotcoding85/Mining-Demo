import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Dispatch
export const getDispatch = (roster: any) =>
  api.get(`${url.DISPATCH}/${roster}`, {});

// Create Dispatch
export const postDispatch = (dispatch: any) =>
  api.create(url.DISPATCH, dispatch);

// Create Dispatch
export const postDispatchs = (dispatchs: any) =>
  api.create(`${url.DISPATCH}/batch-create`, { data: dispatchs });

// Update Dispatch
export const putDispatch = (id: string, dispatch: any) => {
  return api.put(`${url.DISPATCH}/${id}`, dispatch);
};

// Delete Dispatch
export const deleteDispatch = (id: string) => {
  return api.delete(`${url.DISPATCH}/${id}`, {});
};

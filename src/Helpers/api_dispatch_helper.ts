import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Dispatch
export const getDispatch = (roster: any) => api.get(`${url.DISPATCH}/${roster}`, {});

// Create Dispatch
export const postDispatch = (Dispatch: any) => api.create(url.DISPATCH, Dispatch);

// Update Dispatch
export const putDispatch = (id: string, Dispatch: any) => {
  return api.put(`${url.DISPATCH}/${id}`, Dispatch);
}

// Delete Dispatch
export const deleteDispatch = (id: string) => {
  return api.delete(`${url.DISPATCH}/${id}`, {});
}

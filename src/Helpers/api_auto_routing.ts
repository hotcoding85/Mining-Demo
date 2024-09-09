import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Method
export const getAll = () => api.get(url.VEHICLE_ROUTES, {});

// POST Method
export const postRoute = (data: any) => api.create(url.VEHICLE_ROUTES, data);

// PUT Method
export const putRoute = (id: string, data: any) => api.put(`${url.VEHICLE_ROUTES}/${id}`, data);

// DELETE Method
export const deleteRoute = (id: string) => api.delete(`${url.VEHICLE_ROUTES}/${id}`, {});


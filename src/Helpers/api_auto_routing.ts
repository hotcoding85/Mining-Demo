import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Method
export const getRoutesFromDB = () => api.get(url.AUTO_ROUTING, {});

// POST Method
export const postRoutes = (data: any) => api.create(url.AUTO_ROUTING, data);

// PUT Method
export const putRoutes = (id: string, data: any) => api.put(`${url.AUTO_ROUTING}/${id}`, data);

// DELETE Method
export const deleteRoutes = (id: string) => api.delete(`${url.AUTO_ROUTING}/${id}`, {});


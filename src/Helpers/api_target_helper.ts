import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Target
export const getTarget = (target: any) =>
  api.get(`${url.TARGET}/${target}`, {});

// Create Target
export const postTarget = (target: any) => api.create(url.TARGET, target);

// Create Target
export const postTargets = (targets: any) =>
  api.create(`${url.TARGET}/batch-create`, { data: targets });

// Update Target
export const putTarget = (id: string, target: any) => {
  return api.put(`${url.TARGET}/${id}`, target);
};

// Delete Target
export const deleteTarget = (id: string) => {
  return api.delete(`${url.TARGET}/${id}`, {});
};

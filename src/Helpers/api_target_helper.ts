import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Target
export const getTargetByRoster = (roster: any) => api.get(`${url.TARGET}/${roster}`, {});
export const getTargetByRosterAndCategory = (roster: any, category: any) => api.get(`${url.TARGET}/${roster}/${category}`, {});

// Create Target
export const postTarget = (Target: any) => api.create(url.TARGET, Target);

// Update Target
export const putTarget = (id: string, Target: any) => {
  return api.put(`${url.TARGET}/${id}`, Target);
}

// Delete Target
export const deleteTarget = (id: string) => {
  return api.delete(`${url.TARGET}/${id}`, {});
}

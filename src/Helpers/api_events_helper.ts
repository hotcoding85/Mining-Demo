import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Events
export const getEvents = (roster: any) => api.get(`${url.EVENTS}/${roster}`, {});

// Create Events
export const postEvents = (device: any) => api.create(url.EVENTS, device);

// Update Events
export const putEvents = (id: string, device: any) => {
  return api.update(`${url.EVENTS}/${id}`, device);
}

// Delete Events
export const deleteEvents = (id: string) => {
  return api.delete(`${url.EVENTS}/${id}`, {});
}

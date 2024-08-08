import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Trackers
export const getTrackers = (page = 1, limit = 10) => {
  return api.get(url.TRACKERS, { page: page, limit: limit })
};

// Create Tracker
export const postTracker = (tracker: any) => api.create(url.TRACKERS, tracker);

// Update Tracker
export const putTracker = (id: string, tracker: any) => {
  return api.update(`${url.TRACKERS}/${id}`, tracker);
}

// Delete Tracker
export const deleteTracker = (id: string) => {
  return api.delete(`${url.TRACKERS}/${id}`, {});
}

export const isTrackerNameUnique = (name: string) => {
  return api.get(`${url.TRACKERS}/unique/${name}`, {})
}
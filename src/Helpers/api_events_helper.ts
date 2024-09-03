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

export const getShiftReportData = (roster: string, states: string[]) => {
  let queryParams = '';
  states.forEach((state) => {
    queryParams += `states=${state}&`;
  })
  return api.get(`${url.EVENTS}/reports/shift-report/${roster}?${queryParams}`, {});
}

export const getDashboardTruckingInfo = (roster: string) => {
  return api.get(`${url.EVENTS}/truckinginfo/${roster}`, {})
}

export const getMaterialTons = (roster: string) => {
  return api.get(`${url.EVENTS}/tonsbymaterial/${roster}`, {});
}

export const getFleetInfo = (roster: string) => {
  return api.get(`${url.EVENTS}/fmsutil/${roster}`, {});
}

export const getUtilInfo = (roster: string) => {
  return api.get(`${url.EVENTS}/util/${roster}`, {});
}

export const getVehicleLatestState = () => {
  return api.get(`${url.EVENTS}/vehicle/latest-state`, {});
}
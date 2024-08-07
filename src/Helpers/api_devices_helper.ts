import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Devices
export const getDevices = (page = 1, limit = 10) => {
  return api.get(url.DEVICES, { page: page, limit: limit })
};

// Create Device
export const postDevice = (device: any) => api.create(url.DEVICES, device);

// Update Device
export const putDevice = (id: string, device: any) => {
  return api.update(`${url.DEVICES}/${id}`, device);
}

// Delete Device
export const deleteDevice = (id: string) => {
  return api.delete(`${url.DEVICES}/${id}`, {});
}

import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get TruckAllocation
export const getTruckAllocation = (id: any) =>
  api.get(`${url.TRUCK_ALLOCATION}/${id}`, {});

// Create TruckAllocation
export const postTruckAllocation = (truckAllocation: any) =>
  api.create(url.TRUCK_ALLOCATION, truckAllocation);

// Create TruckAllocation
export const postTruckAllocations = (truckAllocations: any) =>
  api.create(`${url.TRUCK_ALLOCATION}/batch-create`, {
    data: truckAllocations,
  });

// Update TruckAllocation
export const putTruckAllocation = (id: string, truckAllocation: any) => {
  return api.put(`${url.TRUCK_ALLOCATION}/${id}`, truckAllocation);
};

// Delete TruckAllocation
export const deleteTruckAllocation = (id: string) => {
  return api.delete(`${url.TRUCK_ALLOCATION}/${id}`, {});
};

// Delete TruckAllocations
export const deleteTruckAllocations = (ids: any) => {
  return api.delete(`${url.TRUCK_ALLOCATION}/multi-delete`, { data: ids });
};

import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Vehicles
export const getFleet = (page = 1, limit = 10) => {
  return api.get(url.VEHICLES, { page: page, limit: limit })
};

// Create Vehicle
export const postVehicle = (vehicle: any) => api.create(url.VEHICLES, vehicle);

// Update Vehicle
export const putVehicle = (id: string, vehicle: any) => {
  return api.put(`${url.VEHICLES}/${id}`, vehicle);
}

// Delete Vehicle
export const deleteVehicle = (id: string) => {
  return api.delete(`${url.VEHICLES}/${id}`, {});
}

// TonnesMoved Vehicle
export const getTonnesMovedByRoster = (roster: string) => {
  return api.get(`${url.VEHICLES}/tonnesmoved/${roster}`, {});
}

// Vehicle Latest Locations
export const getVehicleLatestLocations = (roster: string) => {
  return api.get(`${url.VEHICLES}/locations/${roster}`, {});
}

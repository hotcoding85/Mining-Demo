import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Vehicles
export const getFleet = (page, limit, sortBy, sortOrder, name?, category?) => {
  var options = {
    page: page,
    limit: limit,
    sortBy: sortBy,
    sortOrder: sortOrder,
  };

  if (name) {
    options["name"] = name;
  }

  if (category) {
    options["category"] = category;
  }
  return api.get(url.VEHICLES, options);
};

// Create Vehicle
export const postVehicle = (vehicle: any) => api.create(url.VEHICLES, vehicle);

// Create Vehicles
export const postUpsertVehicles = (formData: any) =>
  api.create(`${url.VEHICLES}/upsert`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Update Vehicle
export const putVehicle = (id: string, vehicle: any) => {
  return api.put(`${url.VEHICLES}/${id}`, vehicle);
};

// Delete Vehicle
export const deleteVehicle = (id: string) => {
  return api.delete(`${url.VEHICLES}/${id}`, {});
};

// TonnesMoved Vehicle
export const getTonnesMovedByRoster = (roster: string) => {
  return api.get(`${url.VEHICLES}/tonnesmoved/${roster}`, {});
};

// Vehicle Latest Locations
export const getVehicleLatestLocations = (roster: string) => {
  return api.get(`${url.VEHICLES}/locations/${roster}`, {});
};

export const isVehicleNameUnique = (name: string) => {
  return api.get(`${url.VEHICLES}/unique/${name}`, {});
};

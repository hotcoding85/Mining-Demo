import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get GeoFence
export const getGeoFence = () => api.get(`${url.GEO_FENCE}`, {});

// Create GeoFence
export const postGeoFence = (GeoFence: any) =>
  api.create(url.GEO_FENCE, GeoFence);

// Create GeoFence
export const postUpsertGeoFence = (formData: any) =>
  api.create(`${url.GEO_FENCE}/upsert`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Update GeoFence
export const putGeoFence = (id: string, GeoFence: any) => {
  return api.put(`${url.GEO_FENCE}/${id}`, GeoFence);
};

// Delete GeoFence
export const deleteGeoFence = (id: string) => {
  return api.delete(`${url.GEO_FENCE}/${id}`, {});
};

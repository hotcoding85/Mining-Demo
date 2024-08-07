import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Materials
export const getMaterials = (page = 1, limit = 10) => {
  return api.get(url.MATERIALS, { page: page, limit: limit })
};

// Create Material
export const postMaterial = (material: any) => api.create(url.MATERIALS, material);

// Update Material
export const putMaterial = (id: string, material: any) => {
  return api.put(`${url.MATERIALS}/${id}`, material);
}

// Delete Material
export const deleteMaterial = (id: string) => {
  return api.delete(`${url.MATERIALS}/${id}`, {});
}

import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Materials
export const getMaterials = (
  page = 1,
  limit = 10,
  sortBy,
  sortOrder,
  name?,
  category?
) => {
  var options = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  if (name) {
    options["name"] = name;
  }

  if (category) {
    options["category"] = category;
  }
  return api.get(url.MATERIALS, options);
};

// Create Material
export const postMaterial = (material: any) =>
  api.create(url.MATERIALS, material);

// Create Material
export const postMaterials = (materials: any) =>
  api.create(`${url.MATERIALS}/batch-create`, { data: materials });

// Create Users
export const postUpsertMaterials = (formData: any) =>
  api.create(`${url.MATERIALS}/upsert`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Update Material
export const putMaterial = (id: string, material: any) => {
  return api.put(`${url.MATERIALS}/${id}`, material);
};

// Delete Material
export const deleteMaterial = (id: string) => {
  return api.delete(`${url.MATERIALS}/${id}`, {});
};

export const isMaterialNameUnique = (name: string) => {
  return api.get(`${url.MATERIALS}/unique/${name}`, {});
};

export const getROMStatus = (roster: string) => {
  return api.get(`${url.MATERIALS}/inventory/rom-status/${roster}`, {});
};

export const getMaterialMoved = (roster: string) => {
  return api.get(`${url.MATERIALS}/material-moved/${roster}`, {});
};

export const getPitStatusByCategory = (roster: string) => {
  return api.get(`${url.MATERIALS}/pit-status/${roster}`, {});
};

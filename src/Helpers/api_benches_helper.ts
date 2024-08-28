import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Benches
export const getBenches = (page, limit, sortBy, sortOrder, name?, category?) => {
  var options = {page: page, limit: limit, sortBy: sortBy, sortOrder: sortOrder}

  if(name) {
    options['name'] = name
  }

  if(category) {
    options['category'] = category
  }
  return api.get(url.BENCHES, options)
};

// Create Bench
export const postBench = (bench: any) => api.create(url.BENCHES, bench);

// Create Bench
export const postUpsertBenches = (benches: any) => api.create(`${url.BENCHES}/upsert`, benches);

// Update Bench
export const putBench = (id: string, bench: any) => {
  return api.put(`${url.BENCHES}/${id}`, bench);
}

// Delete Bench
export const deleteBench = (id: string) => {
  return api.delete(`${url.BENCHES}/${id}`, {});
}

export const isBenchNameUnique = (name: string) => {
  return api.get(`${url.BENCHES}/unique/${name}`, {})
}
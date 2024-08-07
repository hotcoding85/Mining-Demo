import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Benches
export const getBenches = (page = 1, limit = 10) => {
  return api.get(url.BENCHES, { page: page, limit: limit })
};

// Create Bench
export const postBench = (bench: any) => api.create(url.BENCHES, bench);

// Update Bench
export const putBench = (id: string, bench: any) => {
  return api.put(`${url.BENCHES}/${id}`, bench);
}

// Delete Bench
export const deleteBench = (id: string) => {
  return api.delete(`${url.BENCHES}/${id}`, {});
}

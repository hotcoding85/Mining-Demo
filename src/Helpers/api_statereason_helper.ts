import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Vehicle State Reasons
export const getStateReasonById = (id: string) =>
  api.get(`${url.VEHICLE_STATE_REASONS}/${id}`, {});

export const getStateReasons = (payload) =>
  api.get(`${url.VEHICLE_STATE_REASONS}`, payload);

// Create StateReason
export const postStateReason = (reasons: any) =>
  api.create(url.VEHICLE_STATE_REASONS, reasons);

// Create StateReason
export const postStateReasons = (reasons: any) =>
  api.create(`${url.VEHICLE_STATE_REASONS}/upsert`, { data: reasons });

// Update StateReason
export const putStateReason = (id: string, reason: any) => {
  return api.put(`${url.VEHICLE_STATE_REASONS}/${id}`, reason);
};

// Delete StateReason
export const deleteStateReason = (id: string) => {
  return api.delete(`${url.VEHICLE_STATE_REASONS}/${id}`, {});
};

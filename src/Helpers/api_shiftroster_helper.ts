import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get ShiftRoster
export const getShiftRoster = (roster: any) =>
  api.get(`${url.SHIFT_ROSTER}/${roster}`, {});

// Create ShiftRoster
export const postShiftRoster = (ShiftRoster: any) =>
  api.create(url.SHIFT_ROSTER, ShiftRoster);

// Create ShiftRoster
export const postShiftRosters = (shiftRosters: any) =>
  api.create(`${url.SHIFT_ROSTER}/batch-create`, { data: shiftRosters });

// Update ShiftRoster
export const putShiftRoster = (id: string, ShiftRoster: any) => {
  return api.put(`${url.SHIFT_ROSTER}/${id}`, ShiftRoster);
};

// Delete ShiftRoster
export const deleteShiftRoster = (id: string) => {
  return api.delete(`${url.SHIFT_ROSTER}/${id}`, {});
};

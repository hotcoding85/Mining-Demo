import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// get EventMetas by Roster
export const getEventMeta = (roster: any) =>
  api.get(`${url.EVENTMETAS}/${roster}`, {});

// Create EventMetas
// export const postEventMetas = (device: any) => api.create(url.EVENTMETAS, device);

// Update EventMetas
export const putEventMetas = (id: string, device: any) => {
  return api.update(`${url.EVENTMETAS}/${id}`, device);
};

// Delete EventMetas
export const deleteEventMetas = (id: any) => {
  return api.delete(`${url.EVENTMETAS}/multi-delete`, { data: id });
};

// Create EventMetas
export const postEventMetas = (eventMetas: any) =>
  api.create(`${url.EVENTMETAS}/batch-create`, { data: eventMetas });

export const getShiftReportData = (roster: string, states: string[]) => {
  let queryParams = "";
  states.forEach((state) => {
    queryParams += `states=${state}&`;
  });
  return api.get(
    `${url.EVENTMETAS}/reports/shift-report/${roster}?${queryParams}`,
    {}
  );
};

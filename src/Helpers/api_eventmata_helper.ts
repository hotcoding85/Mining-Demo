import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Create EventMeta
export const postEventMeta = (eventmetas: any) =>
  api.create(url.EVENTMETAS, eventmetas);

// Create EventMetas
export const postEventMetas = (eventmetas: any) =>
  api.create(`${url.EVENTMETAS}/batch-create`, { data: eventmetas });

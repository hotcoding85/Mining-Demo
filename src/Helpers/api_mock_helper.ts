import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All resources
export const getMockResources = async () => {
  return await api.get(`${url.MOCK}/resource`, {});
};

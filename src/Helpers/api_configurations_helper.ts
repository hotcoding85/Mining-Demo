import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Configurations
export const getConfigurations = (configurationId) => {

  return api.get(`${url.CONFIGURATIONS}/${configurationId}`, {})
};

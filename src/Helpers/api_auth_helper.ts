import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Login Method
export const postLogin = (data: any) => api.create(url.POST_LOGIN, data);



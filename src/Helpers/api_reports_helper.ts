import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

export const downloadShiftReport = (roster: string) => {
    return api.get(`${url.REPORTS}/shift-report/${roster}/download`, { responseType: 'blob' });
}
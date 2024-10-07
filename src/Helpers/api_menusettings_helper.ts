import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Menu Settings
export const getMenuSettingById = (id: string) =>
  api.get(`${url.MENU_SETTINGS}/${id}`, {});

export const getMenuSettings = (payload) =>
  api.get(`${url.MENU_SETTINGS}`, payload);

// Create MenuSetting
export const postMenuSetting = (settings: any) =>
  api.create(url.MENU_SETTINGS, settings);

// Create MenuSetting
export const postMenuSettings = (settings: any, deletedIds?: string[]) =>
  api.create(`${url.MENU_SETTINGS}/upsert`, { data: settings, deletedIds });

// Update MenuSetting
export const putMenuSetting = (id: string, setting: any) => {
  return api.put(`${url.MENU_SETTINGS}/${id}`, setting);
};

// Delete MenuSetting
export const deleteMenuSetting = (id: string) => {
  return api.delete(`${url.MENU_SETTINGS}/${id}`, {});
};

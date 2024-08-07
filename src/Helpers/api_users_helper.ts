import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Users
export const getUsers = (page = 1, limit = 10) => {
  return api.get(url.USERS, { page: page, limit: limit })
};

// Create User
export const postUser = (user: any) => api.create(url.USERS, user);

// Update User
export const putUser = (id: string, user: any) => {
  return api.put(`${url.USERS}/${id}`, user);
}

// Delete User
export const deleteUser = (id: string) => {
  return api.delete(`${url.USERS}/${id}`, {});
}

import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// All Users
export const getUsers = (
  page,
  limit,
  sortBy,
  sortOrder,
  firstName,
  lastName
) => {
  var options = {
    page: page,
    limit: limit,
    sortBy: sortBy,
    sortOrder: sortOrder,
  };

  if (firstName) {
    options["firstName"] = firstName;
  }

  if (lastName) {
    options["lastName"] = lastName;
  }
  return api.get(url.USERS, options);
};

// Create User
export const postUser = (user: any) => api.create(url.USERS, user);

export const postUsers = (users: any) =>
  api.create(`${url.USERS}/batch-create`, { data: users });

// Create Users
export const postUpsertUsers = (formData: any) =>
  api.create(`${url.USERS}/upsert`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Update User
export const putUser = (id: string, user: any) => {
  return api.put(`${url.USERS}/${id}`, user);
};

// Delete User
export const deleteUser = (id: string) => {
  return api.delete(`${url.USERS}/${id}`, {});
};

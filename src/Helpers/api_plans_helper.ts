import { APIClient } from "./api_helper";

import * as url from "./url_helper";

const api = new APIClient();

// Get Plan
export const getPlanByRoster = (roster: any) =>
  api.get(`${url.PLANS}/${roster}`, {});

export const getPlanByRosterAndCategory = (roster: any, category: any) =>
  api.get(`${url.PLANS}/${roster}/${category}`, {});

// Create Plan
export const postPlan = (plans: any) => api.create(url.PLANS, plans);

// Create Plan
export const postPlans = (plans: any) =>
  api.create(`${url.PLANS}/batch-create`, { data: plans });

// Update Plan
export const putPlan = (id: string, Plan: any) => {
  return api.put(`${url.PLANS}/${id}`, Plan);
};

// Delete Plan
export const deletePlan = (id: string) => {
  return api.delete(`${url.PLANS}/${id}`, {});
};

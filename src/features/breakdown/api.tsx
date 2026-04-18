import { apiClient } from "../../utils/apiClient";
import type { Breakdown } from "./types/breakdown";

export const machinesApi = {
  getAllBreakDowns: () => apiClient<Breakdown[]>('/machines/all-break-downs/'),
};

export const authApi = {
  initializeCsrf: () => apiClient('/user/auth/csrf/'),
  
  login: (data: any) => apiClient('/user/auth/login/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: () => apiClient('/user/auth/me/'),
};
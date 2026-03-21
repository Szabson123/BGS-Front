import { apiClient } from '../../utils/apiClient';
import type { Breakdown } from './types/breakdown';

export const machinesApi = {
  getAllBreakDowns: () => apiClient<Breakdown[]>('/machines/all-break-downs/'),
};
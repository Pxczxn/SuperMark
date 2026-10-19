import { http } from './client';
import type { DashboardSummary, TopProduct, TrendPoint } from '../types';

export const dashboardApi = {
  summary: () => http.get<DashboardSummary>('/dashboard/summary'),
  trend: (days = 7) => http.get<TrendPoint[]>('/dashboard/trend', { days }),
  topProducts: (limit = 10) => http.get<TopProduct[]>('/dashboard/top-products', { limit })
};

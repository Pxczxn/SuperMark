import { http } from './client';
import { cleanParams } from '../utils/format';
import type { PageResult, SaleOrder, SalePayload, SaleQuery } from '../types';

export const saleApi = {
  page: (query: SaleQuery) => http.get<PageResult<SaleOrder>>('/sales', cleanParams({ ...query })),
  detail: (id: number) => http.get<SaleOrder>(`/sales/${id}`),
  create: (data: SalePayload) => http.post<SaleOrder>('/sales', data),
  today: () => http.get<{ orderCount: number; totalAmount: number; avgAmount: number }>('/sales/today')
};

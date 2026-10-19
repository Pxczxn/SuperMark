import { http } from './client';
import { cleanParams } from '../utils/format';
import type { PageResult, PurchaseOrder, PurchasePayload, PurchaseQuery } from '../types';

export const purchaseApi = {
  page: (query: PurchaseQuery) => http.get<PageResult<PurchaseOrder>>('/purchases', cleanParams({ ...query })),
  detail: (id: number) => http.get<PurchaseOrder>(`/purchases/${id}`),
  create: (data: PurchasePayload) => http.post<PurchaseOrder>('/purchases', data)
};

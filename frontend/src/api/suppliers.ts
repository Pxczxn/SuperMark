import { http } from './client';
import { cleanParams } from '../utils/format';
import type { PageResult, Supplier, SupplierPayload } from '../types';

export const supplierApi = {
  page: (page: number, size: number, keyword?: string) =>
    http.get<PageResult<Supplier>>('/suppliers', cleanParams({ page, size, keyword })),
  all: () => http.get<Supplier[]>('/suppliers/all'),
  create: (data: SupplierPayload) => http.post<Supplier>('/suppliers', data),
  update: (id: number, data: SupplierPayload) => http.put<Supplier>(`/suppliers/${id}`, data),
  remove: (id: number) => http.delete<null>(`/suppliers/${id}`)
};

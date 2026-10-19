import { http } from './client';
import { cleanParams } from '../utils/format';
import type { PageResult, Product, ProductPayload, ProductQuery } from '../types';

export const productApi = {
  page: (query: ProductQuery) =>
    http.get<PageResult<Product>>('/products', cleanParams({ ...query })),
  byBarcode: (barcode: string) => http.get<Product>(`/products/barcode/${encodeURIComponent(barcode)}`),
  create: (data: ProductPayload) => http.post<Product>('/products', data),
  update: (id: number, data: ProductPayload) => http.put<Product>(`/products/${id}`, data),
  remove: (id: number) => http.delete<null>(`/products/${id}`),
  setStatus: (id: number, status: number) => http.put<null>(`/products/${id}/status`, { status })
};

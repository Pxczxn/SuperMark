import { http } from './client';
import { cleanParams } from '../utils/format';
import type { Category, CategoryPayload, PageResult } from '../types';

export const categoryApi = {
  page: (page: number, size: number, keyword?: string) =>
    http.get<PageResult<Category>>('/categories', cleanParams({ page, size, keyword })),
  all: () => http.get<Category[]>('/categories/all'),
  create: (data: CategoryPayload) => http.post<Category>('/categories', data),
  update: (id: number, data: CategoryPayload) => http.put<Category>(`/categories/${id}`, data),
  remove: (id: number) => http.delete<null>(`/categories/${id}`)
};

import { http } from './client';
import { cleanParams } from '../utils/format';
import type { Member, MemberQuery, PageResult } from '../types';

export type MemberPayload = Pick<Member, 'name' | 'phone'> & Partial<Pick<Member, 'gender'>>;

export const memberApi = {
  page: (query: MemberQuery) => http.get<PageResult<Member>>('/members', cleanParams({ ...query })),
  byPhone: (phone: string) => http.get<Member>(`/members/phone/${encodeURIComponent(phone)}`),
  create: (data: MemberPayload) => http.post<Member>('/members', data),
  update: (id: number, data: MemberPayload) => http.put<Member>(`/members/${id}`, data),
  remove: (id: number) => http.delete<null>(`/members/${id}`),
  recharge: (id: number, amount: number) => http.post<Member>(`/members/${id}/recharge`, { amount })
};

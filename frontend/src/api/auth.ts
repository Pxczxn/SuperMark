import { http } from './client';
import type { LoginResult, UserInfo } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    http.post<LoginResult>('/auth/login', { username, password }),
  me: () => http.get<UserInfo>('/auth/me'),
  logout: () => http.post<null>('/auth/logout')
};

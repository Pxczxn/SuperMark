import axios, { AxiosError } from 'axios';
import { getAntdMessage } from '../antdStatic';

/** 统一响应包装（与 docs/API.md 一致） */
export interface ApiEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

const TOKEN_KEY = 'superma…oken';
const USER_KEY = 'superma…_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: unknown): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const client = axios.create({
  baseURL: '/api',
  timeout: 15000
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function gotoLogin(): void {
  clearAuth();
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

client.interceptors.response.use(
  (response) => {
    const body = response.data as ApiEnvelope;
    // 后端约定：HTTP 200 但 body.code !== 0 也是业务错误
    if (body && typeof body.code === 'number' && body.code !== 0) {
      if (body.code === 40101) {
        gotoLogin();
        return Promise.reject(new Error(body.message || '未登录或登录已过期'));
      }
      getAntdMessage()?.error(body.message || `请求失败（code=${body.code}）`);
      return Promise.reject(new Error(body.message || `业务错误 ${body.code}`));
    }
    // 解包：调用方拿到 data
    return body && typeof body.code === 'number' ? body.data : response.data;
  },
  (error: AxiosError<ApiEnvelope>) => {
    const status = error.response?.status;
    const body = error.response?.data;
    if (status === 401 || body?.code === 40101) {
      getAntdMessage()?.warning(body?.message || '未登录或登录已过期，请重新登录');
      gotoLogin();
      return Promise.reject(error);
    }
    if (body && typeof body.code === 'number' && body.code !== 0) {
      getAntdMessage()?.error(body.message || `请求失败（code=${body.code}）`);
      return Promise.reject(error);
    }
    if (status === 403) {
      getAntdMessage()?.error(body?.message || '无权限执行该操作');
      return Promise.reject(error);
    }
    getAntdMessage()?.error(error.message === 'Network Error' ? '网络错误，请检查后端服务是否启动' : error.message);
    return Promise.reject(error);
  }
);

/** 请求返回 data（拦截器已解包），类型参数为 data 的形状 */
export const http = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    client.get(url, { params }) as unknown as Promise<T>,
  post: <T>(url: string, data?: unknown) => client.post(url, data) as unknown as Promise<T>,
  put: <T>(url: string, data?: unknown) => client.put(url, data) as unknown as Promise<T>,
  delete: <T>(url: string) => client.delete(url) as unknown as Promise<T>
};

export default client;

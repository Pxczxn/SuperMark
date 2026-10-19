import dayjs from 'dayjs';
import type { PageParams } from '../types';

/** 金额显示：保留 2 位，可选千分位 */
export function fmtMoney(v: number | undefined | null, thousand = true): string {
  if (v === undefined || v === null || Number.isNaN(v)) return '-';
  const fixed = v.toFixed(2);
  if (!thousand) return fixed;
  const [int, dec] = fixed.split('.');
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${withSep}.${dec}`;
}

export function fmtDateTime(v?: string | null): string {
  return v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-';
}

export function fmtDate(v?: string | null): string {
  return v ? dayjs(v).format('YYYY-MM-DD') : '-';
}

/** 表格分页参数 -> 后端 page/size */
export function toPageParams<P extends PageParams>(page: number, size: number, rest?: Omit<P, 'page' | 'size'>): P {
  return { page, size, ...(rest ?? {}) } as P;
}

/** undefined/'' 的查询参数不发送 */
export function cleanParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

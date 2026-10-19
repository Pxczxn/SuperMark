// 与 docs/API.md 一一对应的类型定义

export type Role = 'ADMIN' | 'CLERK';

export interface UserInfo {
  id: number;
  username: string;
  realName: string;
  role: Role;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}

/** 分页响应 data */
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

/** 通用分页查询参数（page 从 1 开始） */
export interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
}

export interface Category {
  id: number;
  name: string;
  sort: number;
  remark?: string;
}

export type CategoryPayload = Pick<Category, 'name' | 'sort'> & { remark?: string };

export interface Product {
  id: number;
  name: string;
  barcode: string;
  categoryId: number;
  categoryName?: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  warnStock: number;
  /** 1 上架 0 下架 */
  status: number;
  remark?: string;
}

export type ProductPayload = Omit<Product, 'id' | 'categoryName'>;

export interface ProductQuery extends PageParams {
  categoryId?: number;
  status?: number;
  lowStock?: boolean;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  remark?: string;
}

export type SupplierPayload = Omit<Supplier, 'id'>;

export interface Member {
  id: number;
  name: string;
  phone: string;
  /** 1 男 2 女 0 未知 */
  gender?: number;
  points: number;
  balance: number;
  createdAt?: string;
}

export interface MemberQuery extends PageParams {
  phone?: string;
}

export interface PurchaseItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface PurchaseOrder {
  id: number;
  orderNo: string;
  supplierId: number;
  supplierName?: string;
  totalAmount: number;
  itemCount?: number;
  remark?: string;
  createdAt?: string;
  items?: PurchaseItem[];
}

export interface PurchaseQuery extends PageParams {
  startDate?: string;
  endDate?: string;
  supplierId?: number;
}

export interface PurchasePayload {
  supplierId: number;
  remark?: string;
  items: Array<{ productId: number; quantity: number; unitPrice: number }>;
}

/** payType: 1 现金 2 微信 3 支付宝 4 银行卡 */
export type PayType = 1 | 2 | 3 | 4;

export const PAY_TYPE_LABELS: Record<PayType, string> = {
  1: '现金',
  2: '微信',
  3: '支付宝',
  4: '银行卡'
};

export interface SaleItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface SaleOrder {
  id: number;
  orderNo: string;
  memberId?: number;
  memberName?: string;
  cashierName?: string;
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  payType: PayType;
  pointsEarned: number;
  remark?: string;
  createdAt?: string;
  items?: SaleItem[];
}

export interface SaleQuery extends PageParams {
  startDate?: string;
  endDate?: string;
  orderNo?: string;
}

export interface SalePayload {
  memberId?: number;
  payType: PayType;
  remark?: string;
  items: Array<{ productId: number; quantity: number }>;
  /** 使用积分抵扣（100 积分 = 1 元） */
  usePoints?: number;
  /** 余额支付部分 */
  balanceAmount?: number;
}

export interface DashboardSummary {
  todaySales: number;
  todayOrders: number;
  totalProducts: number;
  lowStockCount: number;
  memberCount: number;
  totalStockValue: number;
}

export interface TrendPoint {
  date: string;
  amount: number;
  orders: number;
}

export interface TopProduct {
  productName: string;
  quantity: number;
  amount: number;
}

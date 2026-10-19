import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { App as AntdApp, Result, Button } from 'antd';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import SuppliersPage from './pages/SuppliersPage';
import MembersPage from './pages/MembersPage';
import PurchasesPage from './pages/PurchasesPage';
import PosPage from './pages/PosPage';
import SalesPage from './pages/SalesPage';
import AntdAppBridge from './AntdAppBridge';
import { getToken } from './api/client';

/** 未登录跳 /login；CLERK 访问 adminOnly 页面显示 403 */
function RequireAuth({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isAdmin } = useAuth();
  if (!getToken() || !user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，仅管理员可访问该页面。"
        extra={
          <Button type="primary" onClick={() => (window.location.href = '/#/dashboard')}>
            回到看板
          </Button>
        }
      />
    );
  }
  return <Outlet />;
}

export default function App() {
  return (
    <AntdApp>
      <AntdAppBridge />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pos" element={<PosPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route element={<RequireAuth adminOnly />}>
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/purchases" element={<PurchasesPage />} />
              </Route>
              <Route path="*" element={<Result status="404" title="404" subTitle="页面不存在" />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AntdApp>
  );
}

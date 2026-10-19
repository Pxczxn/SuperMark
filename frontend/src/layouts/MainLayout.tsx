import { useMemo } from 'react';
import { App, Avatar, Dropdown, Grid, Layout, Menu, Space, Typography, theme } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { key: '/dashboard', label: '数据看板', icon: <DashboardOutlined /> },
  { key: '/pos', label: '收银台', icon: <CreditCardOutlined /> },
  { key: '/sales', label: '销售记录', icon: <BarChartOutlined /> },
  { key: '/products', label: '商品管理', icon: <AppstoreOutlined /> },
  { key: '/categories', label: '分类管理', icon: <AppstoreOutlined />, adminOnly: true },
  { key: '/suppliers', label: '供应商管理', icon: <AppstoreOutlined />, adminOnly: true },
  { key: '/purchases', label: '进货管理', icon: <AppstoreOutlined />, adminOnly: true },
  { key: '/members', label: '会员管理', icon: <UserOutlined /> }
];

export default function MainLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const screens = Grid.useBreakpoint();
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  const { modal } = App.useApp();

  const items = useMemo(
    () =>
      MENU_ITEMS.filter((m) => isAdmin || !m.adminOnly).map((m) => ({
        key: m.key,
        icon: m.icon,
        label: m.label
      })),
    [isAdmin]
  );

  const selectedKey = '/' + (location.pathname.split('/')[1] ?? '');

  const onLogout = () => {
    modal.confirm({
      title: '确认退出登录？',
      okText: '退出',
      cancelText: '取消',
      onOk: async () => {
        await logout();
        navigate('/login', { replace: true });
      }
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={screens.md ? 200 : undefined}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontWeight: 600,
            fontSize: collapsed ? 14 : 16,
            color: '#1677ff'
          }}
        >
          <CreditCardOutlined />
          {!collapsed && <span>超市管理系统</span>}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={({ key }) => navigate(key)}
          style={{ borderInlineEnd: 'none' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <Space>
            <span
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Typography.Text strong style={{ fontSize: 16 }}>
              超市管理系统
            </Typography.Text>
          </Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: onLogout
                }
              ]
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span>
                {user?.realName || user?.username}
                <Typography.Text type="secondary" style={{ marginLeft: 6 }}>
                  （{user?.role === 'ADMIN' ? '管理员' : '收银员'}）
                </Typography.Text>
              </span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16 }}>
          <div
            style={{
              padding: screens.sm ? 24 : 12,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

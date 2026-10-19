import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Progress, Row, Spin, Statistic, Table, Tag, Empty } from 'antd';
import {
  AlertOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { dashboardApi } from '../api/dashboard';
import { fmtMoney } from '../utils/format';
import type { DashboardSummary, TopProduct, TrendPoint } from '../types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, t, p] = await Promise.all([
        dashboardApi.summary(),
        dashboardApi.trend(7),
        dashboardApi.topProducts(10)
      ]);
      setSummary(s);
      setTrend(t ?? []);
      setTop(p ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !summary) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  const maxAmount = Math.max(...trend.map((d) => d.amount), 1);

  const cards: Array<{ title: string; value: string | number; icon: React.ReactNode; color?: string; suffix?: string }> = [
    { title: '今日销售额', value: fmtMoney(summary?.todaySales), icon: <WalletOutlined />, color: '#1677ff' },
    { title: '今日订单数', value: summary?.todayOrders ?? 0, icon: <ShoppingCartOutlined />, color: '#52c41a' },
    { title: '商品总数', value: summary?.totalProducts ?? 0, icon: <AppstoreOutlined /> },
    {
      title: '低库存商品',
      value: summary?.lowStockCount ?? 0,
      icon: <AlertOutlined />,
      color: (summary?.lowStockCount ?? 0) > 0 ? '#fa541c' : undefined
    },
    { title: '会员数', value: summary?.memberCount ?? 0, icon: <TeamOutlined />, color: '#722ed1' },
    { title: '库存总值', value: fmtMoney(summary?.totalStockValue), icon: <WalletOutlined />, color: '#13c2c2' }
  ];

  return (
    <div>
      {error && (
        <Alert
          type="error"
          message={error}
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={load}>
              重试
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      <Row gutter={[16, 16]}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={8} xl={4} key={c.title}>
            <Card size="small">
              <Statistic
                title={
                  <span>
                    <span style={{ color: c.color, marginRight: 6 }}>{c.icon}</span>
                    {c.title}
                  </span>
                }
                value={c.value}
                valueStyle={{ color: c.color, fontSize: 22 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="近 7 日销售趋势" size="small" extra={<Button size="small" icon={<ReloadOutlined />} onClick={load}>刷新</Button>}>
            {trend.length === 0 ? (
              <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 220, padding: '8px 4px 0' }}>
                {trend.map((d) => {
                  const h = Math.max((d.amount / maxAmount) * 170, d.amount > 0 ? 4 : 1);
                  return (
                    <div
                      key={d.date}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                      title={`金额 ${fmtMoney(d.amount)} / 订单 ${d.orders}`}
                    >
                      <span style={{ fontSize: 12, color: '#555' }}>{fmtMoney(d.amount, false)}</span>
                      <div
                        style={{
                          width: '60%',
                          height: h,
                          background: 'linear-gradient(180deg, #69b1ff, #1677ff)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height .3s'
                        }}
                      />
                      <span style={{ fontSize: 12, color: '#888' }}>{d.date.slice(5)}</span>
                      <Tag style={{ margin: 0, fontSize: 11 }}>{d.orders} 单</Tag>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="畅销商品 Top 10（近 30 天）" size="small">
            <Table<TopProduct>
              rowKey="productName"
              size="small"
              pagination={false}
              dataSource={top}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" /> }}
              columns={[
                {
                  title: '#',
                  width: 40,
                  render: (_, __, i) => i + 1
                },
                { title: '商品', dataIndex: 'productName', ellipsis: true },
                { title: '销量', dataIndex: 'quantity', width: 70, align: 'right' },
                {
                  title: '销售额',
                  dataIndex: 'amount',
                  width: 110,
                  align: 'right',
                  render: (v: number) => fmtMoney(v)
                },
                {
                  title: '占比',
                  width: 90,
                  render: (_, r) => (
                    <Progress
                      percent={top.length ? Math.round((r.amount / (top[0]?.amount || 1)) * 100) : 0}
                      size="small"
                      showInfo={false}
                    />
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

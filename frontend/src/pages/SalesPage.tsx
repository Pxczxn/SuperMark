import { useCallback, useEffect, useState } from 'react';
import { Button, Col, DatePicker, Descriptions, Drawer, Input, Row, Space, Table, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { saleApi } from '../api/sales';
import { fmtDateTime, fmtMoney } from '../utils/format';
import { PAY_TYPE_LABELS, type PayType, type SaleOrder } from '../types';

export default function SalesPage() {
  const [list, setList] = useState<SaleOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [orderNo, setOrderNo] = useState('');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [detail, setDetail] = useState<SaleOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async (p = page, s = size) => {
    setLoading(true);
    try {
      const res = await saleApi.page({
        page: p,
        size: s,
        orderNo: orderNo || undefined,
        startDate: range?.[0]?.format('YYYY-MM-DD'),
        endDate: range?.[1]?.format('YYYY-MM-DD')
      });
      setList(res.list);
      setTotal(res.total);
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false);
    }
  }, [page, size, orderNo, range]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDetail = async (id: number) => {
    try {
      const res = await saleApi.detail(id);
      setDetail(res);
      setDetailOpen(true);
    } catch {
      /* 拦截器已提示 */
    }
  };

  return (
    <div>
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col>
          <DatePicker.RangePicker
            value={range as never}
            onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)}
            placeholder={['开始日期', '结束日期']}
          />
        </Col>
        <Col>
          <Input
            placeholder="单号"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 220 }}
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            onPressEnter={() => { setPage(1); void load(1, size); }}
          />
        </Col>
        <Col>
          <Button icon={<SearchOutlined />} type="primary" onClick={() => { setPage(1); void load(1, size); }}>
            查询
          </Button>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
        </Col>
      </Row>

      <Table<SaleOrder>
        rowKey="id"
        loading={loading}
        dataSource={list}
        scroll={{ x: 950 }}
        pagination={{
          current: page,
          pageSize: size,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, s) => {
            setPage(p);
            setSize(s);
            void load(p, s);
          }
        }}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 70 },
          { title: '单号', dataIndex: 'orderNo', width: 200 },
          {
            title: '会员',
            dataIndex: 'memberName',
            width: 120,
            render: (v?: string) => v || <Tag>散客</Tag>
          },
          {
            title: '总额',
            dataIndex: 'totalAmount',
            width: 100,
            align: 'right',
            render: (v: number) => fmtMoney(v)
          },
          {
            title: '优惠',
            dataIndex: 'discountAmount',
            width: 90,
            align: 'right',
            render: (v: number) => (v ? <span style={{ color: '#fa8c16' }}>-{fmtMoney(v)}</span> : '-')
          },
          {
            title: '实收',
            dataIndex: 'payAmount',
            width: 110,
            align: 'right',
            render: (v: number) => <strong>{fmtMoney(v)}</strong>
          },
          {
            title: '支付',
            dataIndex: 'payType',
            width: 90,
            render: (v: PayType) => PAY_TYPE_LABELS[v] ?? String(v)
          },
          { title: '收银员', dataIndex: 'cashierName', width: 100, render: (v?: string) => v || '-' },
          {
            title: '时间',
            dataIndex: 'createdAt',
            width: 170,
            render: (v?: string) => fmtDateTime(v)
          },
          {
            title: '操作',
            width: 90,
            fixed: 'right',
            render: (_, row) => (
              <Button size="small" onClick={() => void openDetail(row.id)}>
                详情
              </Button>
            )
          }
        ]}
      />

      <Drawer title={detail ? `销售单 ${detail.orderNo}` : '销售详情'} open={detailOpen} onClose={() => setDetailOpen(false)} width={640}>
        {detail && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="单号">{detail.orderNo}</Descriptions.Item>
              <Descriptions.Item label="时间">{fmtDateTime(detail.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="会员">{detail.memberName || '散客'}</Descriptions.Item>
              <Descriptions.Item label="收银员">{detail.cashierName || '-'}</Descriptions.Item>
              <Descriptions.Item label="商品总额">{fmtMoney(detail.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="优惠抵扣">{fmtMoney(detail.discountAmount)}</Descriptions.Item>
              <Descriptions.Item label="实收">
                <strong style={{ color: '#f5222d' }}>{fmtMoney(detail.payAmount)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">{PAY_TYPE_LABELS[detail.payType] ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="获得积分">{detail.pointsEarned}</Descriptions.Item>
              <Descriptions.Item label="备注">{detail.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <Table
              rowKey={(r) => `${r.productId}`}
              size="small"
              pagination={false}
              dataSource={detail.items ?? []}
              columns={[
                { title: '商品', dataIndex: 'productName', ellipsis: true },
                { title: '单价', dataIndex: 'unitPrice', width: 100, align: 'right', render: (v?: number) => fmtMoney(v ?? 0) },
                { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
                {
                  title: '小计',
                  dataIndex: 'subtotal',
                  width: 110,
                  align: 'right',
                  render: (v?: number, row?) => fmtMoney(v ?? (row?.unitPrice ?? 0) * row!.quantity)
                }
              ]}
            />
            <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
              合计：<strong>{fmtMoney(detail.totalAmount)}</strong>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  );
}

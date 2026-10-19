import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  message
} from 'antd';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { purchaseApi } from '../api/purchases';
import { supplierApi } from '../api/suppliers';
import { productApi } from '../api/products';
import { fmtDateTime, fmtMoney } from '../utils/format';
import type { PurchaseOrder, Supplier, Product } from '../types';

interface ItemRow {
  key: number;
  productId?: number;
  quantity?: number;
  unitPrice?: number;
}

/** 商品远程搜索下拉（入库明细用） */
function useProductOptions() {
  const [options, setOptions] = useState<{ value: number; label: string; product?: Product }[]>([]);
  const [fetching, setFetching] = useState(false);

  const search = useCallback(async (kw: string) => {
    setFetching(true);
    try {
      const res = await productApi.page({ page: 1, size: 20, keyword: kw || undefined });
      setOptions(
        res.list.map((p) => ({
          value: p.id,
          label: `${p.name}（${p.barcode}） 库存${p.stock}`,
          product: p
        }))
      );
    } catch {
      /* 拦截器已提示 */
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void search('');
  }, [search]);

  return { options, fetching, search };
}

export default function PurchasesPage() {
  const [list, setList] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState<number | undefined>();
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm] = Form.useForm<{ supplierId: number; remark?: string }>();
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [rowSeq, setRowSeq] = useState(1);
  const { options: productOptions, fetching, search } = useProductOptions();

  const [detail, setDetail] = useState<PurchaseOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async (p = page, s = size) => {
    setLoading(true);
    try {
      const res = await purchaseApi.page({
        page: p,
        size: s,
        supplierId,
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
  }, [page, size, supplierId, range]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supplierApi.all().then(setSuppliers).catch(() => undefined);
  }, []);

  const openCreate = () => {
    createForm.resetFields();
    setRows([{ key: 0, quantity: 1 }]);
    setRowSeq(1);
    setDrawerOpen(true);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { key: rowSeq, quantity: 1 }]);
    setRowSeq((n) => n + 1);
  };

  const updateRow = (key: number, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeRow = (key: number) => {
    setRows((prev) => prev.filter((r) => r.key !== key));
  };

  const totalAmount = rows.reduce(
    (sum, r) => sum + (r.quantity ?? 0) * (r.unitPrice ?? 0),
    0
  );

  const onSubmit = async () => {
    let values: { supplierId: number; remark?: string };
    try {
      values = await createForm.validateFields();
    } catch {
      return;
    }
    const items = rows.filter((r) => r.productId && r.quantity && r.unitPrice !== undefined);
    if (items.length === 0) {
      message.warning('请至少添加一条有效入库明细（商品、数量、单价）');
      return;
    }
    if (items.length !== rows.length) {
      message.warning('存在未填写完整的明细行，请补全或删除');
      return;
    }
    setSubmitting(true);
    try {
      const res = await purchaseApi.create({
        supplierId: values.supplierId,
        remark: values.remark,
        items: items.map((r) => ({
          productId: r.productId!,
          quantity: r.quantity!,
          unitPrice: r.unitPrice!
        }))
      });
      message.success(`入库成功，单号 ${res.orderNo}`);
      setDrawerOpen(false);
      void load();
    } catch {
      /* 拦截器已提示 */
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (id: number) => {
    try {
      const res = await purchaseApi.detail(id);
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
          <Select
            placeholder="供应商"
            allowClear
            style={{ width: 180 }}
            value={supplierId}
            onChange={setSupplierId}
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            showSearch
            optionFilterProp="label"
          />
        </Col>
        <Col>
          <DatePicker.RangePicker
            value={range as never}
            onChange={(v) => setRange(v as [Dayjs | null, Dayjs | null] | null)}
            placeholder={['开始日期', '结束日期']}
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
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建入库
          </Button>
        </Col>
      </Row>

      <Table<PurchaseOrder>
        rowKey="id"
        loading={loading}
        dataSource={list}
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
          { title: '入库单号', dataIndex: 'orderNo', width: 200 },
          { title: '供应商', dataIndex: 'supplierName', width: 160, render: (v?: string) => v || '-' },
          {
            title: '总金额',
            dataIndex: 'totalAmount',
            width: 120,
            align: 'right',
            render: (v: number) => fmtMoney(v)
          },
          { title: '明细数', dataIndex: 'itemCount', width: 90, align: 'right', render: (v?: number) => v ?? '-' },
          {
            title: '入库时间',
            dataIndex: 'createdAt',
            width: 170,
            render: (v?: string) => fmtDateTime(v)
          },
          {
            title: '操作',
            width: 90,
            render: (_, row) => (
              <Button size="small" onClick={() => void openDetail(row.id)}>
                详情
              </Button>
            )
          }
        ]}
      />

      <Drawer
        title="新建入库单"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={860}
        destroyOnHidden
        extra={
          <Button type="primary" loading={submitting} onClick={() => void onSubmit()}>
            提交入库
          </Button>
        }
      >
        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="supplierId"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="选择供应商"
                  options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={14}>
              <Form.Item name="remark" label="备注">
                <Input maxLength={200} placeholder="可选" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Space style={{ marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
          <strong>入库明细</strong>
          <Button size="small" icon={<PlusOutlined />} onClick={addRow}>
            添加一行
          </Button>
        </Space>

        <Table<ItemRow>
          rowKey="key"
          size="small"
          pagination={false}
          dataSource={rows}
          locale={{ emptyText: '暂无明细，点击「添加一行」' }}
          columns={[
            {
              title: '商品',
              dataIndex: 'productId',
              render: (_, row) => (
                <Select
                  style={{ width: '100%' }}
                  showSearch
                  placeholder="搜索商品名称/条码"
                  filterOption={false}
                  loading={fetching}
                  onSearch={(kw) => void search(kw)}
                  value={row.productId}
                  options={productOptions}
                  onChange={(v, opt) => {
                    const p = (opt as { product?: Product })?.product;
                    updateRow(row.key, {
                      productId: v,
                      unitPrice: p ? p.purchasePrice : undefined
                    });
                  }}
                />
              )
            },
            {
              title: '数量',
              dataIndex: 'quantity',
              width: 110,
              render: (_, row) => (
                <InputNumber
                  min={1}
                  precision={0}
                  style={{ width: '100%' }}
                  value={row.quantity}
                  onChange={(v) => updateRow(row.key, { quantity: v ?? undefined })}
                />
              )
            },
            {
              title: '单价',
              dataIndex: 'unitPrice',
              width: 120,
              render: (_, row) => (
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  value={row.unitPrice}
                  onChange={(v) => updateRow(row.key, { unitPrice: v ?? undefined })}
                />
              )
            },
            {
              title: '小计',
              width: 110,
              align: 'right',
              render: (_, row) => fmtMoney((row.quantity ?? 0) * (row.unitPrice ?? 0))
            },
            {
              title: '',
              width: 50,
              render: (_, row) => (
                <Popconfirm title="删除该行？" okText="删除" cancelText="取消" onConfirm={() => removeRow(row.key)}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )
            }
          ]}
        />

        <div style={{ marginTop: 16, textAlign: 'right', fontSize: 16 }}>
          合计：<strong style={{ color: '#fa541c' }}>{fmtMoney(totalAmount)}</strong> 元
        </div>
      </Drawer>

      <Drawer title={detail ? `入库单 ${detail.orderNo}` : '入库单详情'} open={detailOpen} onClose={() => setDetailOpen(false)} width={640}>
        {detail && (
          <>
            <Descriptions column={2} size="small" style={{ marginBottom: 16 }} bordered>
              <Descriptions.Item label="单号">{detail.orderNo}</Descriptions.Item>
              <Descriptions.Item label="供应商">{detail.supplierName || '-'}</Descriptions.Item>
              <Descriptions.Item label="总金额">{fmtMoney(detail.totalAmount)}</Descriptions.Item>
              <Descriptions.Item label="入库时间">{fmtDateTime(detail.createdAt)}</Descriptions.Item>
              {detail.remark && <Descriptions.Item label="备注" span={2}>{detail.remark}</Descriptions.Item>}
            </Descriptions>
            <Table
              rowKey={(r, i) => `${r.productId}-${i}`}
              size="small"
              pagination={false}
              dataSource={detail.items ?? []}
              columns={[
                { title: '商品', dataIndex: 'productName', ellipsis: true },
                { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
                {
                  title: '单价',
                  dataIndex: 'unitPrice',
                  width: 100,
                  align: 'right',
                  render: (v: number) => fmtMoney(v)
                },
                {
                  title: '小计',
                  dataIndex: 'subtotal',
                  width: 110,
                  align: 'right',
                  render: (v: number) => fmtMoney(v)
                }
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}

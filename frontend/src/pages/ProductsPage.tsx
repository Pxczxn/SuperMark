import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { productApi } from '../api/products';
import { categoryApi } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import { fmtMoney } from '../utils/format';
import type { Category, Product, ProductPayload } from '../types';

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [list, setList] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // 查询条件
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [status, setStatus] = useState<number | undefined>();
  const [lowStock, setLowStock] = useState(false);

  // 编辑 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<ProductPayload>();

  const load = useCallback(
    async (p = page, s = size, overrides?: { lowStock?: boolean }) => {
      setLoading(true);
      try {
        const res = await productApi.page({
          page: p,
          size: s,
          keyword: keyword || undefined,
          categoryId,
          status,
          lowStock: (overrides?.lowStock ?? lowStock) ? true : undefined
        });
        setList(res.list);
        setTotal(res.total);
      } catch {
        /* 拦截器已提示 */
      } finally {
        setLoading(false);
      }
    },
    [page, size, keyword, categoryId, status, lowStock]
  );

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    categoryApi.all().then(setCategories).catch(() => undefined);
  }, []);

  const search = () => {
    setPage(1);
    void load(1, size);
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 1, unit: '个', stock: 0, warnStock: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: Product) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      name: row.name,
      barcode: row.barcode,
      categoryId: row.categoryId,
      unit: row.unit,
      purchasePrice: row.purchasePrice,
      salePrice: row.salePrice,
      stock: row.stock,
      warnStock: row.warnStock,
      status: row.status,
      remark: row.remark
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await productApi.update(editing.id, values);
      } else {
        await productApi.create(values);
      }
      setModalOpen(false);
      void load();
    } catch {
      /* barcode 重复 code=40030 等，拦截器已提示 */
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (row: Product) => {
    try {
      await productApi.setStatus(row.id, row.status === 1 ? 0 : 1);
      void load();
    } catch {
      /* 拦截器已提示 */
    }
  };

  const onDelete = async (id: number) => {
    try {
      await productApi.remove(id);
      void load();
    } catch {
      /* 被引用时 code=40041 拒绝，拦截器已提示 */
    }
  };

  return (
    <div>
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="名称 / 条码"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={search}
          />
        </Col>
        <Col>
          <Select
            placeholder="分类"
            allowClear
            style={{ width: 150 }}
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </Col>
        <Col>
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 110 }}
            value={status}
            onChange={setStatus}
            options={[
              { value: 1, label: '上架' },
              { value: 0, label: '下架' }
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Switch
              checked={lowStock}
              onChange={(v) => {
                setLowStock(v);
                setPage(1);
                void load(1, size, { lowStock: v });
              }}
            />
            <span>仅看低库存</span>
          </Space>
        </Col>
        <Col>
          <Button icon={<SearchOutlined />} type="primary" onClick={search}>
            查询
          </Button>
        </Col>
        <Col>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            刷新
          </Button>
        </Col>
        {isAdmin && (
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              新增商品
            </Button>
          </Col>
        )}
      </Row>

      <Table<Product>
        rowKey="id"
        size="middle"
        loading={loading}
        dataSource={list}
        scroll={{ x: 1100 }}
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
          { title: 'ID', dataIndex: 'id', width: 70, fixed: 'left' },
          { title: '名称', dataIndex: 'name', width: 160, ellipsis: true },
          { title: '条码', dataIndex: 'barcode', width: 140 },
          { title: '分类', dataIndex: 'categoryName', width: 100, render: (v?: string) => v || '-' },
          { title: '单位', dataIndex: 'unit', width: 70, align: 'center' },
          {
            title: '进价',
            dataIndex: 'purchasePrice',
            width: 90,
            align: 'right',
            render: (v: number) => fmtMoney(v)
          },
          {
            title: '售价',
            dataIndex: 'salePrice',
            width: 90,
            align: 'right',
            render: (v: number) => fmtMoney(v)
          },
          {
            title: '库存',
            dataIndex: 'stock',
            width: 110,
            align: 'right',
            render: (v: number, row) => (
              <Space>
                <span style={v <= row.warnStock ? { color: '#fa541c', fontWeight: 600 } : undefined}>{v}</span>
                {v <= row.warnStock && <Tag color="orange">低</Tag>}
              </Space>
            )
          },
          { title: '预警线', dataIndex: 'warnStock', width: 80, align: 'right' },
          {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            render: (v: number) => (v === 1 ? <Tag color="green">上架</Tag> : <Tag>下架</Tag>)
          },
          {
            title: '操作',
            width: isAdmin ? 220 : 90,
            fixed: 'right',
            render: (_, row) =>
              isAdmin ? (
                <Space>
                  <Button size="small" onClick={() => openEdit(row)}>
                    编辑
                  </Button>
                  <Button size="small" onClick={() => void toggleStatus(row)}>
                    {row.status === 1 ? '下架' : '上架'}
                  </Button>
                  <Popconfirm title="确认删除该商品？" okText="删除" cancelText="取消" onConfirm={() => void onDelete(row.id)}>
                    <Button size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              ) : (
                <Tag>只读</Tag>
              )
          }
        ]}
      />

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false} initialValues={{ status: 1, unit: '个', stock: 0, warnStock: 0 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="barcode"
                label="条码"
                rules={[
                  { required: true, message: '请输入条码' },
                  { pattern: /^[0-9A-Za-z-]+$/, message: '仅允许数字、字母和短横线' }
                ]}
              >
                <Input maxLength={64} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="categoryId" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="单位" rules={[{ required: true, message: '请输入单位' }]}>
                <Input maxLength={10} placeholder="个 / 斤 / 箱" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 1, label: '上架' },
                    { value: 0, label: '下架' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="purchasePrice" label="进价" rules={[{ required: true, message: '请输入进价' }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="salePrice" label="售价" rules={[{ required: true, message: '请输入售价' }]}>
                <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="stock" label="库存" rules={[{ required: true, message: '请输入库存' }]}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="warnStock" label="预警库存" rules={[{ required: true, message: '请输入预警库存' }]}>
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea maxLength={200} rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

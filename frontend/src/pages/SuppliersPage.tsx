import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Space, Table } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { supplierApi } from '../api/suppliers';
import type { Supplier, SupplierPayload } from '../types';

export default function SuppliersPage() {
  const [list, setList] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<SupplierPayload>();

  const load = useCallback(async (p = page, s = size, kw = keyword) => {
    setLoading(true);
    try {
      const res = await supplierApi.page(p, s, kw || undefined);
      setList(res.list);
      setTotal(res.total);
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row: Supplier) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      name: row.name,
      contact: row.contact,
      phone: row.phone,
      address: row.address,
      remark: row.remark
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await supplierApi.update(editing.id, values);
      } else {
        await supplierApi.create(values);
      }
      setModalOpen(false);
      void load();
    } catch {
      /* 拦截器已提示 */
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await supplierApi.remove(id);
      void load();
    } catch {
      /* 有进货单引用 code=40050，拦截器已提示 */
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索名称 / 联系人 / 电话"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 240 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => {
            setPage(1);
            void load(1, size, keyword);
          }}
        />
        <Button icon={<SearchOutlined />} onClick={() => { setPage(1); void load(1, size); }}>查询</Button>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>刷新</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增供应商</Button>
      </Space>

      <Table<Supplier>
        rowKey="id"
        loading={loading}
        dataSource={list}
        scroll={{ x: 900 }}
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
          { title: '名称', dataIndex: 'name', width: 180 },
          { title: '联系人', dataIndex: 'contact', width: 120, render: (v?: string) => v || '-' },
          { title: '电话', dataIndex: 'phone', width: 140, render: (v?: string) => v || '-' },
          { title: '地址', dataIndex: 'address', ellipsis: true, render: (v?: string) => v || '-' },
          { title: '备注', dataIndex: 'remark', ellipsis: true, render: (v?: string) => v || '-' },
          {
            title: '操作',
            width: 150,
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => openEdit(row)}>编辑</Button>
                <Popconfirm title="确认删除该供应商？" okText="删除" cancelText="取消" onConfirm={() => void onDelete(row.id)}>
                  <Button size="small" danger>删除</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={editing ? '编辑供应商' : '新增供应商'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false} initialValues={{ remark: '' }}>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入供应商名称' }]}>
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ pattern: /^[\d-+ ]{6,20}$/, message: '电话格式不正确' }]}>
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea maxLength={200} rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

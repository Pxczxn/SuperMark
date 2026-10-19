import { useCallback, useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { categoryApi } from '../api/categories';
import type { Category, CategoryPayload } from '../types';

export default function CategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<CategoryPayload>();

  const load = useCallback(async (p = page, s = size, kw = keyword) => {
    setLoading(true);
    try {
      const res = await categoryApi.page(p, s, kw || undefined);
      setList(res.list);
      setTotal(res.total);
    } catch {
      // 拦截器已提示
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
    form.setFieldsValue({ sort: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: Category) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({ name: row.name, sort: row.sort, remark: row.remark });
    setModalOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await categoryApi.update(editing.id, values);
      } else {
        await categoryApi.create(values);
      }
      setModalOpen(false);
      void load();
    } catch {
      // 拦截器已提示
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await categoryApi.remove(id);
      void load();
    } catch {
      // code=40020 分类下有商品时拒绝，拦截器已提示
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索分类名称"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 220 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => {
            setPage(1);
            void load(1, size, keyword);
          }}
        />
        <Button
          icon={<SearchOutlined />}
          onClick={() => {
            setPage(1);
            void load(1, size, keyword);
          }}
        >
          查询
        </Button>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>
          刷新
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增分类
        </Button>
      </Space>

      <Table<Category>
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
          { title: '分类名称', dataIndex: 'name' },
          { title: '排序', dataIndex: 'sort', width: 90, align: 'center' },
          { title: '备注', dataIndex: 'remark', ellipsis: true },
          {
            title: '操作',
            width: 150,
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => openEdit(row)}>
                  编辑
                </Button>
                <Popconfirm title="确认删除该分类？" okText="删除" cancelText="取消" onConfirm={() => void onDelete(row.id)}>
                  <Button size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false} initialValues={{ sort: 0 }}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input maxLength={50} placeholder="如：休闲零食" />
          </Form.Item>
          <Form.Item name="sort" label="排序" rules={[{ required: true, message: '请输入排序值' }]} extra="数字越小越靠前">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea maxLength={200} rows={2} placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

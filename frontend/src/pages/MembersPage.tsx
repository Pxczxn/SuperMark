import { useCallback, useEffect, useState } from 'react';
import {
  App,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Space,
  Table,
  Tag
} from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, WalletOutlined } from '@ant-design/icons';
import { memberApi, type MemberPayload } from '../api/members';
import { useAuth } from '../context/AuthContext';
import { fmtDateTime, fmtMoney } from '../utils/format';
import type { Member } from '../types';

const GENDER_LABELS: Record<number, string> = { 1: '男', 2: '女', 0: '未知' };

export default function MembersPage() {
  const { isAdmin } = useAuth();
  const { modal } = App.useApp();
  const [list, setList] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [phone, setPhone] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<MemberPayload>();

  const [rechargeMember, setRechargeMember] = useState<Member | null>(null);
  const [rechargeForm] = Form.useForm<{ amount: number }>();
  const [recharging, setRecharging] = useState(false);

  const load = useCallback(async (p = page, s = size) => {
    setLoading(true);
    try {
      const res = await memberApi.page({
        page: p,
        size: s,
        keyword: keyword || undefined,
        phone: phone || undefined
      });
      setList(res.list);
      setTotal(res.total);
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, phone]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ gender: 0 });
    setModalOpen(true);
  };

  const openEdit = (row: Member) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({ name: row.name, phone: row.phone, gender: row.gender ?? 0 });
    setModalOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await memberApi.update(editing.id, values);
      } else {
        await memberApi.create(values);
      }
      setModalOpen(false);
      void load();
    } catch {
      /* phone 重复 code=40061，拦截器已提示 */
    } finally {
      setSaving(false);
    }
  };

  const onRecharge = async () => {
    if (!rechargeMember) return;
    const { amount } = await rechargeForm.validateFields();
    setRecharging(true);
    try {
      await memberApi.recharge(rechargeMember.id, amount);
      modal.success({ title: '充值成功', content: `会员「${rechargeMember.name}」余额已更新。` });
      setRechargeMember(null);
      void load();
    } catch {
      /* 拦截器已提示 */
    } finally {
      setRecharging(false);
    }
  };

  const onDelete = async (id: number) => {
    try {
      await memberApi.remove(id);
      void load();
    } catch {
      /* 拦截器已提示 */
    }
  };

  return (
    <div>
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="姓名"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 160 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => { setPage(1); void load(1, size); }}
          />
        </Col>
        <Col>
          <Input
            placeholder="手机号"
            allowClear
            style={{ width: 160 }}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增会员
          </Button>
        </Col>
      </Row>

      <Table<Member>
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
          { title: '姓名', dataIndex: 'name', width: 120 },
          { title: '手机号', dataIndex: 'phone', width: 130 },
          {
            title: '性别',
            dataIndex: 'gender',
            width: 80,
            render: (v?: number) => GENDER_LABELS[v ?? 0] ?? '未知'
          },
          { title: '积分', dataIndex: 'points', width: 90, align: 'right', render: (v: number) => v ?? 0 },
          {
            title: '余额',
            dataIndex: 'balance',
            width: 110,
            align: 'right',
            render: (v: number) => <span style={{ color: '#1677ff' }}>{fmtMoney(v)}</span>
          },
          {
            title: '注册时间',
            dataIndex: 'createdAt',
            width: 170,
            render: (v?: string) => fmtDateTime(v)
          },
          {
            title: '操作',
            width: 220,
            fixed: 'right',
            render: (_, row) => (
              <Space>
                <Button size="small" onClick={() => openEdit(row)}>编辑</Button>
                <Button
                  size="small"
                  icon={<WalletOutlined />}
                  onClick={() => {
                    rechargeForm.resetFields();
                    setRechargeMember(row);
                  }}
                >
                  充值
                </Button>
                {isAdmin && (
                  <Popconfirm title="确认删除该会员？" okText="删除" cancelText="取消" onConfirm={() => void onDelete(row.id)}>
                    <Button size="small" danger>删除</Button>
                  </Popconfirm>
                )}
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={editing ? '编辑会员' : '新增会员'}
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false} initialValues={{ gender: 1, status: 1 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '手机号为 11 位数字' }
            ]}
          >
            <Input maxLength={11} />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Radio.Group
              options={[
                { value: 1, label: '男' },
                { value: 2, label: '女' },
                { value: 0, label: '未知' }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          rechargeMember ? (
            <Space>
              为会员充值 <Tag color="blue">{rechargeMember.name}</Tag> 当前余额 {fmtMoney(rechargeMember.balance)}
            </Space>
          ) : '充值'
        }
        open={!!rechargeMember}
        onOk={onRecharge}
        onCancel={() => setRechargeMember(null)}
        confirmLoading={recharging}
        okText="确认充值"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={rechargeForm} layout="vertical" preserve={false}>
          <Form.Item
            name="amount"
            label="充值金额（元）"
            rules={[
              { required: true, message: '请输入充值金额' },
              { type: 'number', min: 0.01, message: '金额需大于 0' }
            ]}
          >
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} prefix="¥" placeholder="如 100.00" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

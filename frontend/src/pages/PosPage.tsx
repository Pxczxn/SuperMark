import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Input,
  InputNumber,
  List,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import {
  BarcodeOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { productApi } from '../api/products';
import { memberApi } from '../api/members';
import { saleApi } from '../api/sales';
import { fmtMoney } from '../utils/format';
import type { Member, PayType, Product, SaleOrder } from '../types';
import { PAY_TYPE_LABELS } from '../types';

interface CartLine {
  product: Product;
  quantity: number;
}

export default function PosPage() {
  const [barcode, setBarcode] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [payType, setPayType] = useState<PayType>(1);
  const [usePointsYuan, setUsePointsYuan] = useState<number>(0);
  const [useBalance, setUseBalance] = useState(false);
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState<SaleOrder | null>(null);
  const searchTimer = useRef<number | undefined>(undefined);

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + l.product.salePrice * l.quantity, 0),
    [cart]
  );
  const pointsDiscount = member ? Math.min(Math.floor(usePointsYuan * 100), member.points) / 100 : 0;
  const afterPoints = Math.max(subtotal - pointsDiscount, 0);
  const balancePay = useBalance && member ? Math.min(member.balance, afterPoints) : 0;
  const payable = Math.max(afterPoints - balancePay, 0);

  const addProduct = useCallback((p: Product) => {
    setCart((prev) => {
      const exist = prev.find((l) => l.product.id === p.id);
      if (exist) {
        return prev.map((l) => (l.product.id === p.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  }, []);

  const onBarcodeEnter = async () => {
    const code = barcode.trim();
    if (!code) return;
    setBarcodeLoading(true);
    try {
      const p = await productApi.byBarcode(code);
      addProduct(p);
      setBarcode('');
    } catch {
      /* code=40040 不存在，拦截器已提示 */
    } finally {
      setBarcodeLoading(false);
    }
  };

  const onSearch = (kw: string) => {
    window.clearTimeout(searchTimer.current);
    if (!kw.trim()) {
      setSearchOptions([]);
      return;
    }
    searchTimer.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await productApi.page({ page: 1, size: 10, keyword: kw.trim() });
        setSearchOptions(res.list);
      } catch {
        /* 拦截器已提示 */
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const findMember = async () => {
    const p = phone.trim();
    if (!p) return;
    setPhoneLoading(true);
    try {
      const m = await memberApi.byPhone(p);
      setMember(m);
      message.success(`已识别会员：${m.name}`);
    } catch {
      /* code=40060 不存在，拦截器已提示 */
    } finally {
      setPhoneLoading(false);
    }
  };

  const setQty = (id: number, q: number) => {
    setCart((prev) =>
      prev.flatMap((l) =>
        l.product.id === id ? (q <= 0 ? [] : [{ ...l, quantity: q }]) : [l]
      )
    );
  };

  const checkout = async () => {
    if (cart.length === 0) {
      message.warning('购物车为空');
      return;
    }
    const usePoints = Math.floor(usePointsYuan * 100);
    if (usePoints > 0 && (!member || usePoints > member.points)) {
      message.warning('积分抵扣超出会员可用积分');
      return;
    }
    setSubmitting(true);
    try {
      const order = await saleApi.create({
        memberId: member?.id,
        payType,
        remark: remark || undefined,
        items: cart.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        usePoints: usePoints > 0 ? usePoints : undefined,
        balanceAmount: balancePay > 0 ? balancePay : undefined
      });
      setLastOrder(order);
      setCart([]);
      setMember(null);
      setPhone('');
      setUsePointsYuan(0);
      setUseBalance(false);
      setRemark('');
    } catch {
      /* 库存不足 code=40070 等，拦截器已提示 */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={15}>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space wrap style={{ width: '100%' }}>
            <Input
              prefix={<BarcodeOutlined />}
              placeholder="扫码枪扫描 / 输入条码后回车直接加购"
              style={{ width: 320 }}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onPressEnter={() => void onBarcodeEnter()}
              disabled={barcodeLoading}
              allowClear
            />
            <Select
              showSearch
              filterOption={false}
              placeholder="按名称/条码搜索商品加购"
              style={{ width: 300 }}
              loading={searching}
              onSearch={onSearch}
              value={undefined}
              options={searchOptions.map((p) => ({
                value: p.id,
                label: `${p.name}（${fmtMoney(p.salePrice)}，库存${p.stock}）`,
                product: p
              }))}
              onChange={(_, opt) => {
                const p = (opt as { product?: Product })?.product;
                if (p) addProduct(p);
              }}
              notFoundContent={searching ? '搜索中…' : '输入关键字搜索'}
            />
          </Space>
        </Card>

        <Table<CartLine>
          rowKey={(l) => l.product.id}
          size="small"
          dataSource={cart}
          pagination={false}
          locale={{ emptyText: '购物车为空，请扫码或搜索加购' }}
          scroll={{ x: 640 }}
          columns={[
            { title: '商品', dataIndex: ['product', 'name'], ellipsis: true },
            { title: '条码', dataIndex: ['product', 'barcode'], width: 130 },
            {
              title: '单价',
              width: 90,
              align: 'right',
              render: (_, l) => fmtMoney(l.product.salePrice)
            },
            {
              title: '数量',
              width: 150,
              align: 'center',
              render: (_, l) => (
                <Space>
                  <Button size="small" icon={<MinusOutlined />} onClick={() => setQty(l.product.id, l.quantity - 1)} />
                  <span style={{ minWidth: 24, display: 'inline-block', textAlign: 'center' }}>{l.quantity}</span>
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if (l.quantity + 1 > l.product.stock) {
                        message.warning(`「${l.product.name}」库存仅 ${l.product.stock}`);
                        return;
                      }
                      setQty(l.product.id, l.quantity + 1);
                    }}
                  />
                </Space>
              )
            },
            {
              title: '小计',
              width: 100,
              align: 'right',
              render: (_, l) => fmtMoney(l.product.salePrice * l.quantity)
            },
            {
              title: '库存',
              width: 70,
              align: 'right',
              render: (_, l) => (
                <Tag color={l.quantity >= l.product.stock ? 'red' : 'default'}>{l.product.stock}</Tag>
              )
            },
            {
              title: '',
              width: 50,
              render: (_, l) => (
                <Popconfirm title="移出购物车？" okText="移除" cancelText="取消" onConfirm={() => setQty(l.product.id, 0)}>
                  <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )
            }
          ]}
        />
        {cart.length > 0 && (
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Button danger type="text" onClick={() => setCart([])}>
              清空购物车
            </Button>
          </div>
        )}
      </Col>

      <Col xs={24} lg={9}>
        <Card
          size="small"
          title={
            <Space>
              <ShoppingCartOutlined />
              结算
              <Badge count={cart.reduce((s, l) => s + l.quantity, 0)} showZero color="#1677ff" />
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                prefix={<UserOutlined />}
                placeholder="会员手机号查询"
                value={phone}
                maxLength={11}
                onChange={(e) => setPhone(e.target.value)}
                onPressEnter={() => void findMember()}
              />
              <Button loading={phoneLoading} onClick={() => void findMember()}>
                查询
              </Button>
            </Space.Compact>
            {member && (
              <Alert
                type="info"
                message={
                  <Space wrap>
                    <span>
                      会员：<strong>{member.name}</strong>（{member.phone}）
                    </span>
                    <Tag color="purple">积分 {member.points}</Tag>
                    <Tag color="blue">余额 {fmtMoney(member.balance)}</Tag>
                    <Button size="small" type="link" onClick={() => { setMember(null); setUseBalance(false); setUsePointsYuan(0); }}>
                      移除
                    </Button>
                  </Space>
                }
              />
            )}

            <div>
              <Typography.Text>支付方式</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  value={payType}
                  onChange={(e) => setPayType(e.target.value as PayType)}
                  options={(Object.keys(PAY_TYPE_LABELS) as unknown as string[]).map((k) => ({
                    value: Number(k),
                    label: PAY_TYPE_LABELS[Number(k) as PayType]
                  }))}
                />
              </div>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Checkbox
                  disabled={!member}
                  checked={usePointsYuan > 0}
                  onChange={(e) => setUsePointsYuan(e.target.checked ? 1 : 0)}
                >
                  积分抵扣（100 积分 = 1 元）
                </Checkbox>
                {usePointsYuan > 0 && member && (
                  <InputNumber
                    min={1}
                    max={Math.ceil(member.points / 100)}
                    precision={0}
                    size="small"
                    style={{ width: 90 }}
                    value={usePointsYuan}
                    onChange={(v) => setUsePointsYuan(v ?? 0)}
                    addonAfter="元"
                  />
                )}
              </Space>
              <Checkbox
                disabled={!member || member.balance <= 0}
                checked={useBalance}
                onChange={(e) => setUseBalance(e.target.checked)}
              >
                使用会员余额支付（余额 {fmtMoney(member?.balance ?? 0)}）
              </Checkbox>
              <Input
                placeholder="订单备注（可选）"
                maxLength={200}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </Space>

            <Divider style={{ margin: '4px 0' }} />

            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Statistic title="商品合计" value={fmtMoney(subtotal)} valueStyle={{ fontSize: 16 }} />
              {pointsDiscount > 0 && (
                <Statistic title="积分抵扣" value={`-${fmtMoney(pointsDiscount)}`} valueStyle={{ fontSize: 16, color: '#fa8c16' }} />
              )}
              {balancePay > 0 && (
                <Statistic title="余额支付" value={`-${fmtMoney(balancePay)}`} valueStyle={{ fontSize: 16, color: '#722ed1' }} />
              )}
              <Statistic title="应收" value={fmtMoney(payable)} valueStyle={{ fontSize: 22, color: '#f5222d', fontWeight: 700 }} />
            </Space>

            <Button
              type="primary"
              size="large"
              block
              loading={submitting}
              disabled={cart.length === 0}
              onClick={() => void checkout()}
            >
              结算（{PAY_TYPE_LABELS[payType]}）
            </Button>
          </Space>
        </Card>

        {lastOrder && (
          <Modal
            title="结算成功"
            open
            onOk={() => setLastOrder(null)}
            onCancel={() => setLastOrder(null)}
            okText="继续收银"
            cancelButtonProps={{ style: { display: 'none' } }}
          >
            <List
              size="small"
              header={<Typography.Text strong>小票（打印样式）</Typography.Text>}
              bordered
              dataSource={lastOrder.items ?? []}
              renderItem={(it) => (
                <List.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <span>{it.productName}</span>
                    <span>
                      {it.quantity} × {fmtMoney(it.unitPrice ?? 0)} = {fmtMoney((it.unitPrice ?? 0) * it.quantity)}
                    </span>
                  </Space>
                </List.Item>
              )}
              footer={
                <Space direction="vertical">
                  <Typography.Text>单号：{lastOrder.orderNo}</Typography.Text>
                  <Typography.Text>会员：{lastOrder.memberName || '散客'}</Typography.Text>
                  <Typography.Text>支付：{PAY_TYPE_LABELS[lastOrder.payType]}</Typography.Text>
                  <Typography.Text>
                    应收 <strong style={{ color: '#f5222d' }}>{fmtMoney(lastOrder.payAmount)}</strong> 元，
                    获得积分 {lastOrder.pointsEarned}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    （实际打印小票可由后端/浏览器打印实现，此处为样式提示）
                  </Typography.Text>
                </Space>
              }
            />
          </Modal>
        )}
      </Col>
    </Row>
  );
}

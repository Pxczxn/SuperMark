import { useState } from 'react';
import { Button, Card, Form, Input } from 'antd';
import { LockOutlined, UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      navigate('/', { replace: true });
    } catch {
      // 拦截器已提示错误
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)'
      }}
    >
      <Card
        style={{ width: 380, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
        cover={
          <div style={{ textAlign: 'center', padding: '24px 0 0' }}>
            <ShoppingCartOutlined style={{ fontSize: 40, color: '#1677ff' }} />
            <h2 style={{ margin: '8px 0 0' }}>超市管理系统</h2>
          </div>
        }
      >
        <Form<LoginForm> layout="vertical" size="large" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

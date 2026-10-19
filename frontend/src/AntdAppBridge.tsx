import { App } from 'antd';
import { useEffect } from 'react';
import { setAntdApp } from './antdStatic';

/**
 * 把 antd App.useApp() 返回的上下文实例暴露给组件树外（axios 拦截器、工具函数）。
 * 必须放在 <App> 内部。
 */
export default function AntdAppBridge() {
  const { message, modal } = App.useApp();
  useEffect(() => {
    setAntdApp(message, modal);
  }, [message, modal]);
  return null;
}

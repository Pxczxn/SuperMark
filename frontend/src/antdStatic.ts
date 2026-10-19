import type { MessageInstance } from 'antd/es/message/interface';
import type { HookAPI } from 'antd/es/modal/useModal';

// 用于在 React 组件树之外（如 axios 拦截器）使用「能消费 App 上下文」的 message/modal 实例。
// 由 <AntdAppBridge /> 在挂载时通过 App.useApp() 写入，避免在 client.ts 里直接调用
// 静态 antd message/Modal 而报 “Static function can not consume context” 告警。
let messageInstance: MessageInstance | null = null;
let modalInstance: HookAPI | null = null;

export function setAntdApp(msg: MessageInstance, modal: HookAPI): void {
  messageInstance = msg;
  modalInstance = modal;
}

export function getAntdMessage(): MessageInstance | null {
  return messageInstance;
}

export function getAntdModal(): HookAPI | null {
  return modalInstance;
}


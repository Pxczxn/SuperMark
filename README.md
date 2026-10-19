# Supermark 超市管理系统

前后端分离的超市管理系统。后端 JDK 21 + Spring Boot + JPA + H2（开箱即跑，预留 MySQL profile），前端 React 18 + TypeScript + Vite + Ant Design 5。

## 功能
登录鉴权（JWT）、数据看板、商品分类、商品管理、供应商、会员（积分/储值）、进货入库、销售收银（POS）、销售记录。

## 快速开始
```bash
# 后端（8080）
cd backend
mvn spring-boot:run

# 前端（5173，/api 已代理到 8080）
cd frontend
npm install
npm run dev
```

默认账号：`admin / 123456`（管理员）、`cashier / 123456`（收银员）。

## 文档
- 总体设计：[docs/DESIGN.md](docs/DESIGN.md)
- API 契约：[docs/API.md](docs/API.md)

## 数据库
默认 H2 文件库（`backend/data/`，MySQL 兼容模式，自动建表并注入种子数据）。
切换 MySQL：`mvn spring-boot:run -Dspring-boot.run.profiles=mysql` 并修改 `application-mysql.yml` 连接信息，先执行 `backend/sql/mysql_schema.sql`。

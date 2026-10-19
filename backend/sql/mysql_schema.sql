-- Supermark MySQL schema (run once before switching to mysql profile)
CREATE DATABASE IF NOT EXISTS supermark DEFAULT CHARACTER SET utf8mb4;
USE supermark;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(64),
    role VARCHAR(20) NOT NULL,
    enabled BIT DEFAULT 1,
    created_at DATETIME
);

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    sort INT DEFAULT 0,
    remark VARCHAR(255),
    created_at DATETIME
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    barcode VARCHAR(64) UNIQUE,
    category_id BIGINT,
    unit VARCHAR(16),
    purchase_price DECIMAL(12,2) DEFAULT 0,
    sale_price DECIMAL(12,2) DEFAULT 0,
    stock INT DEFAULT 0,
    warn_stock INT DEFAULT 0,
    status INT DEFAULT 1,
    remark VARCHAR(255),
    created_at DATETIME
);

CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    contact VARCHAR(64),
    phone VARCHAR(32),
    address VARCHAR(255),
    remark VARCHAR(255),
    created_at DATETIME
);

CREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    phone VARCHAR(32) UNIQUE,
    gender INT DEFAULT 0,
    points INT DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    created_at DATETIME
);

CREATE TABLE purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL UNIQUE,
    supplier_id BIGINT,
    supplier_name VARCHAR(128),
    remark VARCHAR(255),
    total_amount DECIMAL(14,2) DEFAULT 0,
    created_at DATETIME
);

CREATE TABLE purchase_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    product_name VARCHAR(128),
    quantity INT,
    unit_price DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(14,2) DEFAULT 0
);

CREATE TABLE sale_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(64) NOT NULL UNIQUE,
    member_id BIGINT,
    member_name VARCHAR(64),
    cashier_id BIGINT,
    cashier_name VARCHAR(64),
    total_amount DECIMAL(14,2) DEFAULT 0,
    discount_amount DECIMAL(14,2) DEFAULT 0,
    pay_amount DECIMAL(14,2) DEFAULT 0,
    pay_type INT,
    remark VARCHAR(255),
    points_earned INT DEFAULT 0,
    created_at DATETIME
);

CREATE TABLE sale_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT,
    product_id BIGINT,
    product_name VARCHAR(128),
    unit VARCHAR(16),
    quantity INT,
    unit_price DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(14,2) DEFAULT 0
);

-- Seed users (password: 123456). Replace hash if needed:
INSERT INTO users(username,password,real_name,role,enabled,created_at)
VALUES ('admin','$2a$10$8K1p//B.9ZQJ1q7w3e7UOe9qZ4y7X1Y2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p','系统管理员','ADMIN',1,NOW())
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO users(username,password,real_name,role,enabled,created_at)
VALUES ('cashier','$2a$10$8K1p//B.9ZQJ1q7w3e7UOe9qZ4y7X1Y2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p','收银员小美','CLERK',1,NOW())
ON DUPLICATE KEY UPDATE id=id;

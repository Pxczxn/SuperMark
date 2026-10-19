package com.supermark.config;

import com.supermark.domain.*;
import com.supermark.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final MemberRepository memberRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final SaleItemRepository saleItemRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository, CategoryRepository categoryRepository,
                           ProductRepository productRepository, SupplierRepository supplierRepository,
                           MemberRepository memberRepository, PurchaseOrderRepository purchaseOrderRepository,
                           PurchaseItemRepository purchaseItemRepository, SaleOrderRepository saleOrderRepository,
                           SaleItemRepository saleItemRepository) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.memberRepository = memberRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseItemRepository = purchaseItemRepository;
        this.saleOrderRepository = saleOrderRepository;
        this.saleItemRepository = saleItemRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(new User("admin", encoder.encode("123456"), "系统管理员", "ADMIN"));
            userRepository.save(new User("cashier", encoder.encode("123456"), "收银员小美", "CLERK"));
        }

        if (categoryRepository.count() == 0) {
            Category c1 = categoryRepository.save(new Category("饮料", 1, "各类饮品"));
            Category c2 = categoryRepository.save(new Category("零食", 2, "休闲零食"));
            Category c3 = categoryRepository.save(new Category("日用", 3, "日用品"));
            Category c4 = categoryRepository.save(new Category("生鲜", 4, "果蔬生鲜"));
            Category c5 = categoryRepository.save(new Category("粮油", 5, "米面粮油"));

            Supplier s1 = supplierRepository.save(new Supplier("康师傅食品", "王经理", "13800000001", "北京市朝阳区", "饮料供应商"));
            Supplier s2 = supplierRepository.save(new Supplier("三只松鼠", "李经理", "13800000002", "安徽省芜湖市", "零食供应商"));
            Supplier s3 = supplierRepository.save(new Supplier("洁云日化", "赵经理", "13800000003", "上海市", "日化供应商"));

            // products: a couple of low stock
            productRepository.save(new Product("可乐330ml", "690123450001", c1.getId(), "瓶",
                    new BigDecimal("2.00"), new BigDecimal("3.50"), 120, 50, "经典碳酸饮料"));
            productRepository.save(new Product("雪碧330ml", "690123450002", c1.getId(), "瓶",
                    new BigDecimal("2.00"), new BigDecimal("3.50"), 80, 50, "柠檬味汽水"));
            productRepository.save(new Product("桶装水5L", "690123450003", c1.getId(), "桶",
                    new BigDecimal("6.00"), new BigDecimal("10.00"), 30, 40, "饮用纯净水"));
            productRepository.save(new Product("薯片原味", "690123450101", c2.getId(), "袋",
                    new BigDecimal("3.50"), new BigDecimal("6.50"), 200, 30, "马铃薯片"));
            productRepository.save(new Product("巧克力", "690123450102", c2.getId(), "块",
                    new BigDecimal("5.00"), new BigDecimal("9.90"), 15, 40, "牛奶巧克力"));
            productRepository.save(new Product("坚果礼盒", "690123450103", c2.getId(), "盒",
                    new BigDecimal("45.00"), new BigDecimal("79.00"), 60, 20, "每日坚果"));
            productRepository.save(new Product("抽纸", "690123450201", c3.getId(), "提",
                    new BigDecimal("12.00"), new BigDecimal("19.90"), 90, 30, "软抽纸巾"));
            productRepository.save(new Product("牙膏", "690123450202", c3.getId(), "支",
                    new BigDecimal("6.00"), new BigDecimal("11.50"), 70, 20, "清新牙膏"));
            productRepository.save(new Product("苹果", "690123450301", c4.getId(), "斤",
                    new BigDecimal("3.00"), new BigDecimal("5.00"), 10, 30, "红富士苹果"));
            productRepository.save(new Product("青菜", "690123450302", c4.getId(), "斤",
                    new BigDecimal("1.50"), new BigDecimal("3.00"), 40, 20, "本地青菜"));
            productRepository.save(new Product("大米5kg", "690123450401", c5.getId(), "袋",
                    new BigDecimal("30.00"), new BigDecimal("49.90"), 100, 20, "东北大米"));
            productRepository.save(new Product("面粉", "690123450402", c5.getId(), "袋",
                    new BigDecimal("25.00"), new BigDecimal("42.00"), 80, 20, "中筋面粉"));

            memberRepository.save(new Member("张三", "13900000001", 1));
            Member m2 = memberRepository.save(new Member("李四", "13900000002", 2));
            m2.setPoints(120);
            m2.setBalance(new BigDecimal("100.00"));
            memberRepository.save(m2);
            memberRepository.save(new Member("王五", "13900000003", 0));

            // sample purchase 3 days ago
            PurchaseOrder po = purchaseOrderRepository.save(
                    new PurchaseOrder("PI" + LocalDateTime.now().minusDays(3).format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "00001",
                            s1.getId(), s1.getName(), "初始铺货"));
            List<Product> drinks = productRepository.findAll().stream()
                    .filter(p -> p.getCategoryId().equals(c1.getId())).toList();
            BigDecimal poTotal = BigDecimal.ZERO;
            for (Product p : drinks) {
                PurchaseItem pi = purchaseItemRepository.save(
                        new PurchaseItem(po.getId(), p.getId(), p.getName(), 50, p.getPurchasePrice()));
                poTotal = poTotal.add(pi.getSubtotal());
            }
            po.setTotalAmount(poTotal);
            purchaseOrderRepository.save(po);

            // sample sales over last 6 days
            List<Product> allProducts = productRepository.findAll();
            for (int d = 6; d >= 1; d--) {
                LocalDateTime day = LocalDateTime.now().minusDays(d).withHour(10).withMinute(0);
                for (int k = 0; k < 2; k++) {
                    SaleOrder so = saleOrderRepository.save(new SaleOrder(
                            "SO" + day.plusHours(k).format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + String.format("%03d", k),
                            1L, "系统管理员"));
                    so.setCreatedAt(day.plusHours(k));
                    BigDecimal total = BigDecimal.ZERO;
                    for (int i = 0; i < 3; i++) {
                        Product p = allProducts.get((d + k + i) % allProducts.size());
                        SaleItem si = new SaleItem(so.getId(), p.getId(), p.getName(), p.getUnit(), 2, p.getSalePrice());
                        saleItemRepository.save(si);
                        total = total.add(si.getSubtotal());
                    }
                    so.setTotalAmount(total);
                    so.setPayAmount(total);
                    so.setPayType(2);
                    saleOrderRepository.save(so);
                }
            }
        }
    }
}

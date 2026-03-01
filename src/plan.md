# Kế hoạch phát triển giao diện – Luồng In-Stock

> Tài liệu này phân tích trạng thái hiện tại của dự án (FE + BE) và đề xuất các bước phát triển giao diện để hoàn thiện luồng **in-stock** theo swimlane diagram.

---

## 1. Phân tích hiện trạng

### 1.1 Backend – Đã có (Spring Boot, port 8081)

| API Group | Endpoint | Mô tả |
|-----------|----------|-------|
| **Auth** | `POST /api/auth/login`, `/register`, `/forgot-password`, `/reset-password` | Xác thực người dùng |
| **Public Products** | `GET /api/public/products`, `/search`, `/{id}`, `/brands` | Danh sách & chi tiết sản phẩm (không cần đăng nhập) |
| **Cart** | `GET/POST/PUT/DELETE /api/customer/cart` | Giỏ hàng |
| **Checkout** | `POST /api/customer/cart/checkout` | Đặt hàng (VNPAY / COD) |
| **Customer** | `/api/customer/profile`, `/addresses`, `/orders/{id}/cancel` | Hồ sơ, địa chỉ, hủy đơn |
| **Payment** | `GET /api/payment/vnpay-return` | Callback VNPAY |
| **Support Staff** | `GET /api/support_staff/orders/waiting`, `POST /{id}/confirm`, `/{id}/cancel` | Duyệt đơn hàng |
| **Operations Staff** | `GET /api/operation_staff/orders/approved`, `POST /{id}/confirm` | Giao hàng qua GHN |
| **Manager** | `/api/manager/products`, `/variants`, `/attributes`, `/combos` | Quản lý sản phẩm |

### 1.2 Frontend – Đã có (React + Vite, port 5173)

| Trang / Component | Route | Trạng thái |
|------------------|-------|-----------|
| Login | `/login` | ✅ Hoàn thiện |
| Register | `/register` | ✅ Hoàn thiện |
| Forgot / Reset Password | `/forget-password`, `/reset-password` | ✅ Hoàn thiện |
| Admin Layout + Sidebar | `/admin/*` | ✅ Có |
| Admin: Quản lý User | `/admin/users` | ✅ Có (CRUD) |
| Admin: Quản lý Product | `/admin/products` | ✅ Có (CRUD đầy đủ) |
| Admin: Homepage Dashboard | `/admin/homepage` | ✅ Có |
| **Customer Layout** | `/customer/*` | ❌ Chưa có trang nào |
| **Trang chủ khách hàng** | `/customer` | ❌ Chưa có |
| **Danh sách sản phẩm** | `/customer/products` | ❌ Chưa có |
| **Chi tiết sản phẩm** | `/customer/products/:id` | ❌ Chưa có |
| **Giỏ hàng** | `/customer/cart` | ❌ Chưa có |
| **Checkout** | `/customer/checkout` | ❌ Chưa có |
| **Theo dõi đơn hàng** | `/customer/orders` | ❌ Chưa có |
| **Hồ sơ cá nhân** | `/customer/profile` | ❌ Chưa có |
| **Support Staff Dashboard** | `/staff/support` | ❌ Chưa có |
| **Operations Staff Dashboard** | `/staff/operations` | ❌ Chưa có |

---

## 2. Luồng In-Stock cần xây dựng

Theo swimlane diagram (`in-stock-swimlane.md`):

```
Customer → Xem sản phẩm → Thêm giỏ hàng → Checkout
       → Thanh toán (VNPAY / COD)
       → Support Staff duyệt đơn
       → Operations Staff giao hàng (GHN)
       → Hoàn thành / Hủy / Trả hàng
```

---

## 3. Kế hoạch phát triển – Ưu tiên theo luồng

### 🔵 GIAI ĐOẠN 1: Customer-Facing – Trang chủ & Sản phẩm

#### 3.1 `CustomerLayout.jsx` – Cập nhật layout
- Thêm **Header** ngang (logo, thanh tìm kiếm, icon giỏ hàng, nút đăng nhập/avatar)
- Thêm **Footer** (liên hệ, chính sách, mạng xã hội)
- API cần: `GET /api/auth/account` (kiểm tra đăng nhập)

#### 3.2 Trang chủ khách hàng – `/customer`
**File:** `src/pages/customer-pages/home.jsx`
- Banner hero (hình ảnh kính mắt nổi bật)
- Section "Sản phẩm nổi bật" (lấy từ `GET /api/public/products`)
- Section "Thương hiệu" (lấy từ `GET /api/public/products/brands`)
- CTA nút mua hàng

#### 3.3 Trang danh sách sản phẩm – `/customer/products`
**File:** `src/pages/customer-pages/product-list.jsx`
- **Sidebar filter**: lọc theo brand, khoảng giá, còn hàng/hết hàng
- **Product grid**: ảnh, tên, giá, badge "Còn hàng"/"Hết hàng"
- **Thanh tìm kiếm** + phân trang
- API: `GET /api/public/products/search?keyword=&brand=&minPrice=&maxPrice=&inStock=true`

#### 3.4 Trang chi tiết sản phẩm – `/customer/products/:id`
**File:** `src/pages/customer-pages/product-detail.jsx`
- Gallery ảnh (carousel các variants)
- Chọn variant (màu sắc, kích thước) → hiển thị giá, tồn kho
- Nút **"Thêm vào giỏ hàng"** (kiểm tra đăng nhập trước)
- Thông tin mô tả, thương hiệu, SKU
- API: `GET /api/public/products/{id}`, `POST /api/customer/cart/add`

---

### 🟢 GIAI ĐOẠN 2: Giỏ hàng & Checkout

#### 3.5 Trang giỏ hàng – `/customer/cart`
**File:** `src/pages/customer-pages/cart.jsx`
- Danh sách sản phẩm trong giỏ (ảnh, tên, variant, giá, số lượng)
- Nút tăng/giảm số lượng, xóa sản phẩm
- Tổng tiền, nút **"Tiến hành đặt hàng"**
- API:
  - `GET /api/customer/cart` – lấy giỏ hàng
  - `PUT /api/customer/cart/items/{itemId}` – cập nhật số lượng
  - `DELETE /api/customer/cart/items/{itemId}` – xóa item
  - `DELETE /api/customer/cart/clear` – xóa toàn bộ

#### 3.6 Trang checkout – `/customer/checkout`
**File:** `src/pages/customer-pages/checkout.jsx`

**Bước 1 – Địa chỉ giao hàng:**
- Hiển thị danh sách địa chỉ đã lưu (radio button)
- Nút thêm địa chỉ mới (modal form)
- API: `GET /api/customer/addresses`, `POST /api/customer/addresses`

**Bước 2 – Xem lại đơn hàng:**
- Danh sách sản phẩm đặt, tổng tiền
- Phí vận chuyển (GHN)

**Bước 3 – Chọn phương thức thanh toán:**
- Radio: `VNPAY` hoặc `COD`
- Nút **"Xác nhận đặt hàng"**
- API: `POST /api/customer/cart/checkout`
  ```json
  {
    "addressId": 1,
    "paymentMethod": "VNPAY" | "COD",
    "note": "..."
  }
  ```

**Bước 4 – Redirect VNPAY (nếu chọn VNPAY):**
- Redirect đến VNPAY URL từ `checkoutResponse.paymentUrl`
- Trang kết quả sau khi VNPAY callback: `/customer/payment-result`

---

### 🟡 GIAI ĐOẠN 3: Theo dõi đơn hàng & Hồ sơ

#### 3.7 Trang đơn hàng – `/customer/orders`
**File:** `src/pages/customer-pages/orders.jsx`
- Danh sách đơn hàng với status badge:
  - 🟡 `PENDING_PAYMENT` – Chờ thanh toán
  - 🟠 `WAITING_CONFIRM` – Chờ xác nhận
  - 🔵 `SUPPORT_CONFIRMED` – Đã xác nhận
  - 🚚 `SHIPPING` – Đang giao hàng
  - ✅ `COMPLETED` – Hoàn thành
  - ❌ `CANCELLED` – Đã hủy
  - 🔄 `RETURNED` – Hoàn trả
- Nút **"Hủy đơn"** (chỉ hiện khi COD + WAITING_CONFIRM)
- API: `GET /api/customer/orders` *(cần thêm vào BE)*
- Hủy đơn: `PUT /api/customer/orders/{orderId}/cancel`

#### 3.8 Trang hồ sơ – `/customer/profile`
**File:** `src/pages/customer-pages/profile.jsx`
- Form cập nhật thông tin (họ tên, số điện thoại, ngày sinh, giới tính)
- Đổi mật khẩu
- Quản lý địa chỉ (thêm/sửa/xóa/đặt mặc định)
- API: `GET/PUT /api/customer/profile`, `PUT /api/customer/profile/change-password`

---

### 🔴 GIAI ĐOẠN 4: Staff Dashboards

#### 3.9 Support Staff – Duyệt đơn hàng
**Route:** `/staff/support/orders`  
**File:** `src/pages/staff-pages/support-orders.jsx`
- Bảng đơn hàng chờ duyệt (status = `WAITING_CONFIRM`)
- Chi tiết đơn (sản phẩm, địa chỉ, phương thức thanh toán)
- Nút **"Xác nhận đơn"** → chuyển sang `SUPPORT_CONFIRMED`
- Nút **"Hủy đơn"** → chuyển sang `CANCELLED`
- API:
  - `GET /api/support_staff/orders/waiting`
  - `POST /api/support_staff/orders/{id}/confirm`
  - `POST /api/support_staff/orders/{id}/cancel`

#### 3.10 Operations Staff – Giao hàng
**Route:** `/staff/operations/orders`  
**File:** `src/pages/staff-pages/operations-orders.jsx`
- Bảng đơn hàng đã được Support xác nhận (status = `SUPPORT_CONFIRMED`)
- Chi tiết đơn, địa chỉ giao hàng
- Nút **"Xác nhận giao hàng"** → gửi đến GHN, chuyển sang `SHIPPING`
- Nút **"Hoàn thành"** và **"Hoàn trả"**
- API:
  - `GET /api/operation_staff/orders/approved`
  - `POST /api/operation_staff/orders/{id}/confirm`

---

## 4. Cấu trúc file đề xuất

```
src/
├── pages/
│   ├── customer-pages/
│   │   ├── home.jsx                  ← Trang chủ khách hàng
│   │   ├── product-list.jsx          ← Danh sách sản phẩm
│   │   ├── product-detail.jsx        ← Chi tiết sản phẩm
│   │   ├── cart.jsx                  ← Giỏ hàng
│   │   ├── checkout.jsx              ← Đặt hàng
│   │   ├── payment-result.jsx        ← Kết quả VNPAY
│   │   ├── orders.jsx                ← Lịch sử đơn hàng
│   │   └── profile.jsx               ← Hồ sơ cá nhân
│   └── staff-pages/
│       ├── support-orders.jsx        ← Support Staff duyệt đơn
│       └── operations-orders.jsx     ← Operations Staff giao hàng
├── components/
│   ├── customer-components/
│   │   ├── header/
│   │   │   └── CustomerHeader.jsx    ← Header ngang
│   │   ├── footer/
│   │   │   └── CustomerFooter.jsx    ← Footer
│   │   ├── product/
│   │   │   ├── ProductCard.jsx       ← Card sản phẩm
│   │   │   └── ProductFilter.jsx     ← Sidebar lọc
│   │   ├── cart/
│   │   │   └── CartItem.jsx          ← Item trong giỏ
│   │   └── order/
│   │       └── OrderStatusBadge.jsx  ← Badge trạng thái
│   └── staff-components/
│       └── OrderTable.jsx            ← Bảng đơn hàng chung
├── context/
│   ├── auth.context.jsx              ← ✅ Đã có
│   └── cart.context.jsx              ← Thêm mới: quản lý giỏ hàng
└── services/
    └── api.service.js                ← Bổ sung thêm các API customer/staff
```

---

## 5. API cần bổ sung vào `api.service.js`

```js
// Public Products
const getPublicProductsAPI = (params) => axios.get('/api/public/products', { params });
const searchProductsAPI = (params) => axios.get('/api/public/products/search', { params });
const getProductDetailAPI = (id) => axios.get(`/api/public/products/${id}`);
const getBrandsAPI = () => axios.get('/api/public/products/brands');

// Cart
const getCartAPI = () => axios.get('/api/customer/cart');
const addToCartAPI = (variantId, quantity) => axios.post('/api/customer/cart/add', { variantId, quantity });
const updateCartItemAPI = (itemId, quantity) => axios.put(`/api/customer/cart/items/${itemId}`, { quantity });
const removeCartItemAPI = (itemId) => axios.delete(`/api/customer/cart/items/${itemId}`);
const clearCartAPI = () => axios.delete('/api/customer/cart/clear');
const checkoutAPI = (dto) => axios.post('/api/customer/cart/checkout', dto);

// Customer
const getProfileAPI = () => axios.get('/api/customer/profile');
const updateProfileAPI = (dto) => axios.put('/api/customer/profile', dto);
const changePasswordAPI = (dto) => axios.put('/api/customer/profile/change-password', dto);
const getAddressesAPI = () => axios.get('/api/customer/addresses');
const createAddressAPI = (dto) => axios.post('/api/customer/addresses', dto);
const cancelOrderAPI = (orderId) => axios.put(`/api/customer/orders/${orderId}/cancel`);

// Support Staff
const getSupportWaitingOrdersAPI = (page, size) => axios.get('/api/support_staff/orders/waiting', { params: { page, size } });
const supportConfirmOrderAPI = (orderId) => axios.post(`/api/support_staff/orders/${orderId}/confirm`);
const supportCancelOrderAPI = (orderId) => axios.post(`/api/support_staff/orders/${orderId}/cancel`);

// Operations Staff
const getApprovedOrdersAPI = (page, size) => axios.get('/api/operation_staff/orders/approved', { params: { page, size } });
const operationsConfirmOrderAPI = (orderId) => axios.post(`/api/operation_staff/orders/${orderId}/confirm`);
```

---

## 6. Routing cần thêm vào `main.jsx`

```jsx
// Customer routes
{ path: "customer", element: <CustomerLayout />, children: [
  { index: true, element: <HomePage /> },
  { path: "products", element: <ProductListPage /> },
  { path: "products/:id", element: <ProductDetailPage /> },
  { path: "cart", element: <CartPage /> },
  { path: "checkout", element: <CheckoutPage /> },
  { path: "payment-result", element: <PaymentResultPage /> },
  { path: "orders", element: <OrdersPage /> },
  { path: "profile", element: <ProfilePage /> },
]}

// Staff routes (cần thêm StaffLayout)
{ path: "staff", element: <StaffLayout />, children: [
  { path: "support/orders", element: <SupportOrdersPage /> },
  { path: "operations/orders", element: <OperationsOrdersPage /> },
]}
```

---

## 7. Điều hướng sau đăng nhập theo Role

Sau khi đăng nhập thành công, cần redirect theo `role` từ JWT:

| Role | Redirect |
|------|---------|
| `CUSTOMER` | `/customer` |
| `SUPPORT_STAFF` | `/staff/support/orders` |
| `OPERATION_STAFF` | `/staff/operations/orders` |
| `MANAGER` | `/admin/homepage` |
| `ADMIN` | `/admin/users` |

Cần cập nhật `login.jsx` – hiện tại hardcode `navigate('/admin/homepage')`.

---

## 8. Thứ tự ưu tiên xây dựng

| Ưu tiên | Tính năng | Effort |
|---------|----------|--------|
| 🔴 Cao | Trang chủ + Danh sách sản phẩm + Chi tiết | 2 ngày |
| 🔴 Cao | Giỏ hàng + Checkout (COD trước) | 2 ngày |
| 🟠 Trung | Checkout VNPAY + Trang kết quả | 1 ngày |
| 🟠 Trung | Lịch sử đơn hàng + Hủy đơn | 1 ngày |
| 🟡 Thấp | Hồ sơ cá nhân + Địa chỉ | 1 ngày |
| 🟡 Thấp | Support Staff dashboard | 1 ngày |
| 🟡 Thấp | Operations Staff dashboard | 1 ngày |
| 🔵 Sau | Redirect theo role + Route guards | 0.5 ngày |

**Tổng ước tính: ~9.5 ngày làm việc**

---

## 9. Ghi chú kỹ thuật

- **Authentication guard**: Các route `/customer/cart`, `/customer/checkout`, `/customer/orders`, `/customer/profile` phải yêu cầu đăng nhập. Dùng `AuthContext` đã có.
- **Cart Context**: Nên thêm `CartContext` để quản lý số lượng sản phẩm trong giỏ (hiển thị badge trên header).
- **VNPAY flow**: Backend trả về `paymentUrl` trong `CheckoutResponseDTO`, FE cần `window.location.href = paymentUrl` để redirect. Sau khi thanh toán, VNPAY gọi `GET /api/payment/vnpay-return`.
- **COD flow**: Sau checkout, đơn chuyển sang `WAITING_CONFIRM`, FE chỉ cần navigate đến trang đơn hàng.
- **GHN Webhook**: Backend có `GhnWebhookController` để cập nhật trạng thái vận chuyển tự động.

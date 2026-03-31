# Dashboard Charts Test Cases

## 📊 Biểu đồ Doanh thu / Đơn hàng (RevenueChart)

### Test Case 1: Hiển thị biểu đồ Line Chart
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Truy cập trang Admin Dashboard | Biểu đồ doanh thu hiển thị mặc định |
| 2 | Kiểm tra tiêu đề biểu đồ | Hiển thị "Biểu đồ Doanh thu" và "Theo thời gian" |
| 3 | Kiểm tra dữ liệu trục X | Hiển thị định dạng thời gian: "time/year" (VD: "3/2024") |
| 4 | Kiểm tra dữ liệu trục Y | Định dạng: triệu đồng (M) khi hiển thị doanh thu |
| 5 | Hover vào điểm dữ liệu | Tooltip hiển thị thời gian và giá trị đúng định dạng VND |

### Test Case 2: Chuyển đổi giữa Doanh thu và Đơn hàng
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click toggle switch "Đơn hàng" | Biểu đồ chuyển sang hiển thị số lượng đơn hàng |
| 2 | Kiểm tra tiêu đề | Đổi thành "Biểu đồ Đơn hàng" |
| 3 | Kiểm tra trục Y | Hiển thị số nguyên (không có đơn vị M) |
| 4 | Hover vào điểm dữ liệu | Tooltip hiển thị số lượng đơn hàng |
| 5 | Click lại toggle về "Doanh thu" | Quay về biểu đồ doanh thu |

### Test Case 3: Xử lý dữ liệu rỗng
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | API trả về mảng rỗng `revenueByMonth: []` | Biểu đồ hiển thị trống, không crash |
| 2 | Kiểm tra message | Có thể hiển thị "Không có dữ liệu" |
| 3 | ResponsiveContainer | Vẫn giữ kích thước height: 300px |

### Test Case 4: Responsive
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Thu nhỏ màn hình xuống mobile | Biểu đồ tự động co lại theo width |
| 2 | Phóng to màn hình | Biểu đồ mở rộng full width container |
| 3 | Kiểm tra font size chữ trục | Vẫn đọc được (fontSize: 12) |

---

## 🏆 Biểu đồ Sản phẩm bán chạy (BestSellersChart)

### Test Case 5: Hiển thị danh sách sản phẩm
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Kiểm tra số lượng hiển thị | Chỉ hiển thị 3 sản phẩm đầu |
| 2 | Kiểm tra thứ tự | Sắp xếp theo totalSold giảm dần |
| 3 | Kiểm tra progress bar | Phần trăm = (totalSold / max) * 100% |
| 4 | Top 1 có màu vàng | Medal icon 🥇 màu vàng (#fbbf24) |
| 5 | Hover vào sản phẩm | Hiển thị tooltip với tên và số lượng |

### Test Case 6: Xử lý dữ liệu Best Sellers
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | API trả về `bestSellers: []` | Hiển thị "Chưa có dữ liệu" |
| 2 | Chỉ có 1 sản phẩm | Hiển thị 1 item với rank #1 |
| 3 | Tổng số bán = 0 | max = 1 (tránh chia cho 0), progress = 0% |
| 4 | Click "Xem chi tiết" | Navigate đến `/admin/best-sellers` |

---

## 📦 Biểu đồ Tồn kho sắp hết (LowStockTable)

### Test Case 7: Hiển thị mức độ tồn kho
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sản phẩm có qty ≤ 2 | Badge màu đỏ "Cực kỳ nguy hiểm" |
| 2 | Sản phẩm có qty 3-10 | Badge màu vàng "Sắp hết hàng" |
| 3 | Sản phẩm có qty 11-20 | Badge màu xanh lá "Ổn định" |
| 4 | Sản phẩm có qty > 20 | Không hiển thị trong danh sách |
| 5 | Progress bar | Màu sắc tương ứng với mức độ |

### Test Case 8: Xử lý dữ liệu Low Stock
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | API trả về `lowStockProducts: []` | Hiển thị "Không có sản phẩm nào" |
| 2 | Tất cả qty = 0 | Hiển thị badge đỏ, progress = 0% |
| 3 | Click "Xem chi tiết" | Navigate đến `/admin/low-stock` |

---

## 🔄 Biểu đồ Giới tính khách hàng (DonutChart)

### Test Case 9: Hiển thị Donut Chart
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Kiểm tra segments | 3 phần: Nam (tím), Nữ (xanh dương), Khác (xanh nhạt) |
| 2 | Kiểm tra tỷ lệ % | Tính đúng: (count / total) * 100 |
| 3 | Hover vào segment | Hiển thị tooltip với % chính xác |
| 4 | SVG viewBox | 0 0 144 144 (cx=72, cy=72, r=54) |

### Test Case 10: Xử lý dữ liệu Donut
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tổng = 0 | Hiển thị "Chưa có dữ liệu" |
| 2 | Chỉ có 1 giới tính | Hiển thị full circle màu đó |
| 3 | Giá trị null/undefined | Xử lý về 0, không crash |

---

## 📈 Biểu đồ Trạng thái đơn hàng (OrderStatusChart)

### Test Case 11: Hiển thị Bar Chart
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Kiểm tra màu bars | Mỗi status có màu riêng |
| 2 | PENDING: vàng (#f59e0b) | PAID: xanh lá (#10b981) |
| 3 | Hover vào bar | Tooltip hiển thị status và count |
| 4 | Trục Y | Hiển thị số nguyên (số lượng đơn) |

---

## 🔧 Common Test Cases

### Test Case 12: Loading State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Đang fetch API | Hiển thị spinner/loading trên tất cả charts |
| 2 | Load thành công | Charts render với animation |
| 3 | Load thất bại | Hiển thị error message, không crash |

### Test Case 13: Data Format
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `revenue` là null | Format thành "0đ" |
| 2 | `totalSold` là undefined | Xử lý thành 0 |
| 3 | `stockQuantity` âm | Vẫn hiển thị đúng màu (≤2 = đỏ) |
| 4 | `productName` rỗng | Hiển thị "(Không tên)" |

### Test Case 14: Accessibility
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tab navigation | Có thể focus vào các controls |
| 2 | Keyboard toggle | Space/Enter để toggle switch |
| 3 | Color contrast | Đủ độ tương phản để đọc |
| 4 | Screen reader | Có aria-labels cho các chart elements |

---

## 🎯 Test Data Samples

### Sample 1: Revenue Data
```json
[
  { "time": 1, "year": 2024, "revenue": 15000000 },
  { "time": 2, "year": 2024, "revenue": 25000000 },
  { "time": 3, "year": 2024, "revenue": 18000000 }
]
```

### Sample 2: Best Sellers
```json
[
  { "productName": "iPhone 15", "totalSold": 50 },
  { "productName": "Samsung S24", "totalSold": 30 },
  { "productName": "iPad Pro", "totalSold": 20 }
]
```

### Sample 3: Low Stock
```json
[
  { "variantId": 1, "productName": "AirPods", "stockQuantity": 1 },
  { "variantId": 2, "productName": "Case iPhone", "stockQuantity": 5 }
]
```

### Sample 4: Gender Stats
```json
[
  { "gender": 1, "count": 150, "label": "Nam" },
  { "gender": 0, "count": 200, "label": "Nữ" },
  { "gender": 2, "count": 50, "label": "Khác" }
]
```

# Swimlane Diagram - Đặt hàng In-Stock

```mermaid
graph TD
    %% Define styles
    classDef customer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef system fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef support fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef operations fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef vnpay fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef decision fill:#fff9c4,stroke:#f57f17,stroke-width:2px

    %% Customer Lane
    subgraph Customer
        C1[Truy cập trang chủ]:::customer
        C2[Duyệt danh mục sản phẩm]:::customer
        C3[Tìm kiếm theo từ khóa]:::customer
        C4[Xem chi tiết sản phẩm]:::customer
        C5[Thêm vào giỏ hàng]:::customer
        C6[Đăng nhập nếu chưa đăng nhập]:::customer
        C7[Tiến hành mua hàng]:::customer
        C8[Kiểm tra đơn hàng]:::customer
        C9[Checkout]:::customer
        C10[Chọn phương thức thanh toán]:::customer
        C11[Xác nhận đơn đặt hàng]:::customer
        C12[Hủy đơn (COD)]:::customer
        C13[Nhận thông báo hủy thành công]:::customer
        C14[Nhận được sản phẩm]:::customer
        C15[Liên lạc nhân viên (VNPAY)]:::customer
    end

    %% System Lane
    subgraph System
        S1[Kiểm tra đăng nhập]:::system
        S2[Kiểm tra số lượng tồn kho]:::system
        S3{Số lượng > 0?}:::decision
        S4[Trừ 1 số lượng sản phẩm]:::system
        S5[Hiển thị thông báo hết hàng]:::system
        S6[Tạo đơn hàng]:::system
        S7[Set trạng thái Pending Payment]:::system
        S8[Set trạng thái COD Pending]:::system
        S9[Thông báo cho Support Staff]:::system
        S10[Cập nhật trạng thái Paid]:::system
        S11[Cập nhật trạng thái Confirmed]:::system
        S12[Cập nhật trạng thái Shipping]:::system
        S13[Cộng tiền vào doanh thu]:::system
        S14[Lưu lịch sử đơn hàng]:::system
        S15[Cộng lại 1 số lượng]:::system
        S16[Cập nhật trạng thái Returned]:::system
    end

    %% Support Staff Lane
    subgraph Support_Staff
        SS1[Nhận thông báo đơn hàng]:::support
        SS2[Review chi tiết đơn hàng]:::support
        SS3[Xác nhận đơn hàng]:::support
        SS4[Ấn chuyển trạng thái]:::support
    end

    %% Operations Staff Lane
    subgraph Operations_Staff
        OS1[Nhận đơn hàng đã xác nhận]:::operations
        OS2[Lấy sản phẩm từ kho]:::operations
        OS3[Đóng gói sản phẩm]:::operations
        OS4[Cập nhật trạng thái Shipping]:::operations
        OS5[Cập nhật trạng thái Completed]:::operations
        OS6[Cập nhật trạng thái Returned]:::operations
    end

    %% VNPAY Lane
    subgraph VNPAY
        V1[Chuyển hướng đến VNPAY]:::vnpay
        V2[Customer thanh toán]:::vnpay
        V3[Gửi xác nhận thanh toán]:::vnpay
    end

    %% Flow connections
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
    C5 --> S1
    S1 --> C6
    C6 --> C7
    C7 --> C8
    C8 --> C9
    C9 --> C10
    C10 --> C11
    C11 --> S2
    
    S2 --> S3
    S3 -->|Yes| S4
    S3 -->|No| S5
    
    S4 --> S6
    S6 --> C10
    C10 -->|VNPAY| S7
    C10 -->|COD| S8
    
    S7 --> V1
    V1 --> V2
    V2 --> V3
    V3 --> S10
    S8 --> S9
    
    S9 --> SS1
    SS1 --> SS2
    SS2 --> SS3
    SS3 --> SS4
    SS4 --> S11
    
    S11 --> OS1
    OS1 --> OS2
    OS2 --> OS3
    OS3 --> OS4
    OS4 --> S12
    
    S12 --> C14
    C14 --> OS5
    OS5 --> S13
    S13 --> S14
    
    %% Cancel flow for COD
    C11 -->|Hủy đơn COD| C12
    C12 --> S15
    S15 --> C13
    
    %% Cancel flow for VNPAY
    C11 -->|Hủy đơn VNPAY| C15
    
    %% Return flow
    OS4 -->|Giao hàng thất bại| OS6
    OS6 --> S16
    S16 --> S15
```

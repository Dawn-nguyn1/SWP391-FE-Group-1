# Swimlane Diagram - Đặt hàng Pre-Order

```mermaid
graph TD
    %% Define styles
    classDef customer fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef system fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef support fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef operations fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef vnpay fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef decision fill:#fff9c4,stroke:#f57f17,stroke-width:2px

    %% USE CASE 1: KHÁCH HÀNG ĐẶT CỌC
    
    %% Customer Lane
    subgraph Customer
        C1[Xem chi tiết sản phẩm Pre-order]:::customer
        C2[Nhấn "Đặt cọc ngay"]:::customer
        C3[Kiểm tra thông tin thanh toán]:::customer
        C4[Chọn thanh toán VNPAY]:::customer
        C5[Nhấn "Thanh toán"]:::customer
        C6[Hoàn tất thanh toán VNPAY]:::customer
        C7[Nhận email xác nhận]:::customer
        C8[Nhận thông báo hàng về]:::customer
        C9[Xem đơn hàng]:::customer
        C10[Nhấn "Thanh toán ngay"]:::customer
        C11[Thanh toán 70% còn lại]:::customer
    end

    %% System Lane
    subgraph System
        S1[Kiểm tra limit Pre-order]:::system
        S2{Còn suất đặt trước?}:::decision
        S3[Hiển thị form thanh toán]:::system
        S4[Hiển thị hết suất]:::system
        S5[Tạo đơn hàng tạm]:::system
        S6[Set trạng thái Pending Deposit]:::system
        S7[Chuyển hướng VNPAY]:::system
        S8[Nhận xác nhận thanh toán]:::system
        S9[Cập nhật trạng thái Waiting Stocks]:::system
        S10[Gửi email xác nhận]:::system
        S11[Kiểm tra 7 ngày timeout]:::system
        S12{Quá 7 ngày chưa thanh toán?}:::decision
        S13[Auto cancel đơn]:::system
        S14[Mất cọc]:::system
        S15[Chuyển thành In-stock]:::system
        S16[Quét danh sách Waiting Stocks]:::system
        S17[Cập nhật trạng thái Arrived - Pending Final Payment]:::system
        S18[Gửi thông báo hàng về]:::system
        S19[Hiển thị số tiền 70%]:::system
        S20[Cập nhật trạng thái Confirmed]:::system
        S21[Set Fully Paid]:::system
        S22[Đưa vào chờ đóng gói]:::system
    end

    %% Operations Staff Lane
    subgraph Operations_Staff
        OS1[Đăng nhập hệ thống kho]:::operations
        OS2[Chọn "Nhập hàng Pre-order"]:::operations
        OS3[Nhập mã sản phẩm và số lượng]:::operations
        OS4[Nhấn "Xác nhận nhập kho"]:::operations
        OS5[Kiểm tra sau 7 ngày]:::operations
        OS6[Tiến hành nhập hàng]:::operations
    end

    %% VNPAY Lane
    subgraph VNPAY
        V1[Chuyển hướng thanh toán cọc]:::vnpay
        V2[Customer thanh toán cọc]:::vnpay
        V3[Gửi xác nhận cọc]:::vnpay
        V4[Chuyển hướng thanh toán nốt]:::vnpay
        V5[Customer thanh toán 70%]:::vnpay
        V6[Gửi xác nhận thanh toán đầy đủ]:::vnpay
    end

    %% USE CASE 1 Flow
    C1 --> C2
    C2 --> S1
    S1 --> S2
    S2 -->|Yes| S3
    S2 -->|No| S4
    S3 --> C3
    C3 --> C4
    C4 --> C5
    C5 --> S5
    S5 --> S6
    S6 --> V1
    V1 --> V2
    V2 --> V3
    V3 --> S8
    S8 --> S9
    S9 --> S10
    S10 --> C7
    
    %% Timeout flow
    S6 --> S11
    S11 --> S12
    S12 -->|Yes| S13
    S13 --> S14
    S14 --> S15
    
    %% USE CASE 2 Flow
    OS1 --> OS2
    OS2 --> OS3
    OS3 --> OS4
    OS4 --> S16
    S16 --> S17
    S17 --> S18
    S18 --> C8
    
    %% 7-day check flow
    S11 --> OS5
    OS5 --> OS6
    
    %% USE CASE 3 Flow
    C8 --> C9
    C9 --> S19
    S19 --> C10
    C10 --> C11
    C11 --> V4
    V4 --> V5
    V5 --> V6
    V6 --> S20
    S20 --> S21
    S21 --> S22
```

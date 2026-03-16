# Note: loi them san pham pre-order vao gio hang

## Ket qua kiem tra

- FE da gui request `POST /api/customer/cart/add`.
- Backend tra ve `400 BAD_REQUEST`.
- Message backend tra ve: `Pre-order slot is full`.
- Path loi: `/api/customer/cart/add`.
- Swagger cho `GET /api/public/products/11` tra ve variant `id: 12`, `saleType: "PRE_ORDER"`, `stockQuantity: 30`.

Tu bang chung hien tai, day khong con la loi UI thuan. FE dang doc duoc du lieu public cho thay variant pre-order con `stockQuantity: 30`, nhung backend add-to-cart lai ket luan `Pre-order slot is full`.

## Cach tai hien

1. Mo trang chi tiet san pham pre-order, vi du `/customer/products/11`.
2. Chon phien ban pre-order.
3. Nhan them vao gio hang.
4. Network tra ve `POST /api/customer/cart/add` voi `400 BAD_REQUEST`.
5. Response body:

```json
{
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Pre-order slot is full",
  "path": "/api/customer/cart/add"
}
```

## Danh gia nguyen nhan

Nguyen nhan hop ly nhat ben backend:

1. Backend dang dung 2 khai niem khac nhau:
   - `stockQuantity` trong API public product detail
   - `pre-order slot/quota` trong API add to cart
2. API `GET /api/public/products/{id}` khong tra ve truong slot pre-order thuc te, nen FE buoc phai tam suy tu `stockQuantity`.
3. API `POST /api/customer/cart/add` dang check mot nguon du lieu/logic khac va tra `Pre-order slot is full`, dan den mau thuan du lieu giua 2 API.

Noi ngan gon: public product detail bao "con 30", nhung add-to-cart bao "het slot". Day la loi contract/nghiep vu ben BE.

## Cach sua de xuat cho BE

Khong sua trong repo FE. Ben backend can:

1. Kiem tra logic tinh `remaining pre-order slots` cua variant duoc them vao gio.
2. Dong bo du lieu giua:
   - API chi tiet san pham `GET /api/public/products/{id}`
   - API them gio hang `POST /api/customer/cart/add`
3. Bo sung field ro rang trong response chi tiet san pham, vi du:
   - `remainingPreOrderSlots`
   - `preOrderAvailable`
   - `preOrderMessage`
4. Dam bao khi slot bang 0 thi API chi tiet san pham cung tra ve trang thai het slot, de FE khoa nut ngay tu dau.
5. Neu co quota theo tung variant, can xac nhan backend dang check dung `variantId/productVariantId` ma FE gui len.
6. Neu `stockQuantity` khong phai la quota pre-order, khong duoc de FE/Swagger hieu rang day la so luong co the dat truoc. Can tach ro:
   - `stockQuantity`
   - `preOrderSlot`
   - `remainingPreOrderSlot`
7. Uu tien sua response message cua API add-to-cart de tra them metadata, vi du:

```json
{
  "message": "Pre-order slot is full",
  "productVariantId": 12,
  "remainingPreOrderSlots": 0
}
```

## Pham vi FE da xu ly

- FE da hien trang thai het suat ro hon tren giao dien.
- FE da khoa o so luong va nut them gio khi backend xac nhan het slot.
- FE khong the tu sua de them thanh cong vao gio neu backend van tra `Pre-order slot is full`.
- FE khong sua code backend.

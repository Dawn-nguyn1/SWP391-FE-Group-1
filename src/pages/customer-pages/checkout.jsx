import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Steps, Radio, Button, Modal, Form, Input, message, Spin } from 'antd';
import { EnvironmentOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
    getCartAPI, getAddressesAPI, createAddressAPI, checkoutAPI
} from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import {
    getCartItemLineTotal,
    getCartItemMeta,
    getCartItemName,
    getCartItemTypeLabel,
    isComboCartItem,
    isPreOrderCartItem,
} from '../../utils/cart-normalize';
import './checkout.css';

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const getMinDeposit = (value) => Math.ceil((Number(value) || 0) * 0.3);
const getApiErrorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback;

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext);
    const [step, setStep] = useState(0);
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [addrModalOpen, setAddrModalOpen] = useState(false);
    const [addrForm] = Form.useForm();

    useEffect(() => {
        let cancelled = false;

        const loadCheckout = async () => {
            try {
                const [cartRes, addressRes] = await Promise.all([getCartAPI(), getAddressesAPI()]);

                if (cancelled) return;

                setCart(cartRes);
                const addrList = Array.isArray(addressRes) ? addressRes : [];
                setAddresses(addrList);
                const def = addrList.find(a => a.isDefault) || addrList[0];
                if (def) setSelectedAddressId(def.id);
            } catch {
                if (!cancelled) message.error('Không thể tải thông tin');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadCheckout();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const hasPreOrder = (cart?.items || []).some((item) => isPreOrderCartItem(item));
        if (hasPreOrder) {
            setPaymentMethod('VNPAY');
        }
    }, [cart]);

    const handleAddAddress = async (vals) => {
        try {
            const dto = {
                receiverName: vals.receiverName,
                phone: vals.phone,
                province: vals.province,
                district: vals.district,
                ward: vals.ward,
                addressLine: vals.addressLine
            };

            const newAddr = await createAddressAPI(dto);
            setAddresses(prev => [...prev, newAddr]);
            setSelectedAddressId(newAddr.id);
            setAddrModalOpen(false);
            addrForm.resetFields();
            message.success('Đã thêm địa chỉ');
        } catch (e) {
            console.error('Add address error:', e);
            message.error(getApiErrorMessage(e, 'Không thể thêm địa chỉ'));
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) { message.warning('Vui lòng chọn địa chỉ giao hàng'); return; }
        const hasPreOrder = (cart?.items || []).some((item) => isPreOrderCartItem(item));
        const mixedCheckout = hasPreOrder && (cart?.items || []).some((item) => isComboCartItem(item) || (!isPreOrderCartItem(item) && !isComboCartItem(item)));
        if (mixedCheckout) {
            message.warning('Không thể checkout chung sản phẩm pre-order với hàng có sẵn hoặc combo.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = hasPreOrder
                ? {
                    addressId: selectedAddressId,
                    paymentMethod: 'VNPAY',
                    depositAmount: getMinDeposit(cart?.finalTotal),
                    remainingPaymentMethod: 'VNPAY',
                }
                : { addressId: selectedAddressId, paymentMethod };
            const res = await checkoutAPI(payload);
            await fetchCart();
            if ((hasPreOrder || paymentMethod === 'VNPAY') && res?.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                navigate('/customer/orders', { state: { ordered: true } });
                message.success(hasPreOrder ? 'Đã tạo đơn đặt trước. Vui lòng hoàn tất thanh toán cọc.' : 'Đặt hàng thành công! Đơn hàng đang chờ xác nhận.');
            }
        } catch (e) {
            console.error('Checkout error:', e);
            message.error(getApiErrorMessage(e, 'Đặt hàng thất bại'));
        } finally { setSubmitting(false); }
    };

    if (loading) return <div className="checkout-loading"><Spin size="large" /></div>;
    const isComboItem = (item) => isComboCartItem(item);
    const hasPreOrderItems = (cart?.items || []).some((item) => isPreOrderCartItem(item));
    const hasMixedCheckout = hasPreOrderItems && (cart?.items || []).some((item) => isComboCartItem(item) || (!isPreOrderCartItem(item) && !isComboCartItem(item)));

    const subTotal = Number(cart?.subTotal ?? 0);
    const discountAmount = Number(cart?.discountAmount ?? 0);
    const total = Number(cart?.finalTotal ?? 0);
    const totalItems = Number(cart?.totalItems ?? cart?.items?.length ?? 0);
    const depositAmount = getMinDeposit(total);
    const remainingAmount = Math.max(total - depositAmount, 0);

    const steps = [
        { title: 'Địa chỉ', icon: <EnvironmentOutlined /> },
        { title: 'Thanh toán', icon: <CreditCardOutlined /> },
        { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
    ];

    return (
        <div className="checkout-page">
            <div className="checkout-inner">
                <h1 className="checkout-title">{hasPreOrderItems ? 'Đặt cọc pre-order' : 'Đặt hàng'}</h1>
                <Steps current={step} items={steps} style={{ marginBottom: 36 }} />

                {cart?.empty && (
                    <div className="checkout-empty-note">
                        Gio hang dang trong. Vui long them san pham hoac combo truoc khi thanh toan.
                    </div>
                )}
                {hasMixedCheckout && (
                    <div className="checkout-empty-note">
                        Giỏ hàng hiện đang trộn sản phẩm pre-order với hàng có sẵn hoặc combo. Hãy tách riêng để backend chấp nhận checkout.
                    </div>
                )}
                {hasPreOrderItems && !hasMixedCheckout && (
                    <div className="checkout-preorder-banner">
                        <strong>Đơn đặt trước</strong>
                        <span>Bạn sẽ thanh toán cọc 30% qua VNPay ở bước này. Phần còn lại sẽ thanh toán sau khi hàng về.</span>
                    </div>
                )}

                <div className="checkout-layout">
                    <div className="checkout-form-area">
                        {/* Step 0: Address */}
                        {step === 0 && (
                            <div className="step-card">
                                <h3>Địa chỉ giao hàng</h3>
                                {addresses.length === 0 ? (
                                    <p style={{ color: '#94a3b8' }}>Bạn chưa có địa chỉ nào.</p>
                                ) : (
                                    <Radio.Group value={selectedAddressId} onChange={e => setSelectedAddressId(e.target.value)} style={{ width: '100%' }}>
                                        <div className="address-list">
                                            {addresses.map(a => (
                                                <Radio key={a.id} value={a.id} className="address-radio">
                                                    <div className="address-card">
                                                        <strong>{a.receiverName || a.recipientName}</strong> — {a.phone}
                                                        <p>{a.addressLine || a.street}, {a.ward}, {a.district}, {a.province || a.city}</p>
                                                        {a.isDefault && <span className="default-badge">Mặc định</span>}
                                                    </div>
                                                </Radio>
                                            ))}
                                        </div>
                                    </Radio.Group>
                                )}
                                <Button onClick={() => setAddrModalOpen(true)} style={{ marginTop: 12 }}>+ Thêm địa chỉ mới</Button>
                                <Button type="primary" className="next-btn" onClick={() => setStep(1)} disabled={!selectedAddressId}>
                                    Tiếp tục
                                </Button>
                            </div>
                        )}

                        {/* Step 1: Payment */}
                        {step === 1 && (
                            <div className="step-card">
                                <h3>{hasPreOrderItems ? 'Phương thức thanh toán cọc' : 'Phương thức thanh toán'}</h3>
                                <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="payment-group">
                                    {!hasPreOrderItems && (
                                        <Radio value="COD" className="payment-radio">
                                            <div className="payment-option">
                                                <span className="pay-icon">🚚</span>
                                                <div><strong>Thanh toán khi nhận hàng (COD)</strong><p>Trả tiền mặt khi nhận hàng</p></div>
                                            </div>
                                        </Radio>
                                    )}
                                    <Radio value="VNPAY" className={`payment-radio ${hasPreOrderItems ? 'payment-radio-featured' : ''}`}>
                                        <div className="payment-option">
                                            <span className="pay-icon">💳</span>
                                            <div><strong>{hasPreOrderItems ? 'Thanh toán cọc qua VNPay' : 'Thanh toán qua VNPay'}</strong><p>ATM, Visa, MasterCard, QR Code</p></div>
                                        </div>
                                    </Radio>
                                </Radio.Group>
                                {hasPreOrderItems && (
                                    <div className="checkout-policy-card">
                                        <div className="checkout-policy-row"><span>Tổng giá trị đơn</span><strong>{formatVND(total)}</strong></div>
                                        <div className="checkout-policy-row"><span>Tiền cọc hôm nay</span><strong>{formatVND(depositAmount)}</strong></div>
                                        <div className="checkout-policy-row"><span>Thanh toán khi hàng về</span><strong>{formatVND(remainingAmount)}</strong></div>
                                        <p className="checkout-policy-copy">
                                            FE đang dùng cùng policy tối thiểu với BE: cọc 30% giá trị đơn và phần còn lại tiếp tục qua VNPay.
                                        </p>
                                    </div>
                                )}
                                <div className="step-btns">
                                    <Button onClick={() => setStep(0)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn" onClick={() => setStep(2)} disabled={hasMixedCheckout}>Xem lại đơn hàng</Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Confirm */}
                        {step === 2 && (
                            <div className="step-card">
                                <h3>Xác nhận đơn hàng</h3>
                                <div className="confirm-section">
                                    <h4>Giao đến:</h4>
                                    {(() => {
                                        const a = addresses.find(x => x.id === selectedAddressId);
                                        return a ? <p>{a.receiverName || a.recipientName} — {a.phone}<br />{a.addressLine || a.street}, {a.ward}, {a.district}, {a.province || a.city}</p> : null;
                                    })()}
                                </div>
                                <div className="confirm-section">
                                    <h4>{hasPreOrderItems ? 'Thanh toán cọc:' : 'Thanh toán:'}</h4>
                                    <p>{hasPreOrderItems ? '💳 VNPay - đặt cọc 30%' : (paymentMethod === 'VNPAY' ? '💳 VNPay' : 'COD – Thanh toán khi nhận')}</p>
                                </div>
                                <div className="confirm-section">
                                    <h4>{hasPreOrderItems ? 'Sản phẩm đặt trước:' : 'Sản phẩm:'}</h4>
                                    {cart?.items?.map(i => {
                                        const combo = isComboItem(i);
                                        return (
                                            <div key={i.cartItemId || i.id} className={`confirm-item ${combo ? 'confirm-item-combo' : ''}`}>
                                                <span className="confirm-item-info">
                                                    {combo && <span className="combo-pill">Combo</span>}
                                                    {getCartItemName(i)} x{i.quantity}
                                                    {!combo && <small>{getCartItemTypeLabel(i)}</small>}
                                                    <small>{getCartItemMeta(i)}</small>
                                                </span>
                                                <span>{formatVND(getCartItemLineTotal(i))}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {hasPreOrderItems && (
                                    <div className="checkout-policy-card">
                                        <div className="checkout-policy-row"><span>Thanh toán hôm nay</span><strong>{formatVND(depositAmount)}</strong></div>
                                        <div className="checkout-policy-row"><span>Thanh toán phần còn lại</span><strong>{formatVND(remainingAmount)}</strong></div>
                                    </div>
                                )}
                                <div className="step-btns">
                                    <Button onClick={() => setStep(1)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn order-btn" loading={submitting} disabled={hasMixedCheckout} onClick={handleCheckout}>
                                        {hasPreOrderItems ? '💳 Thanh toán cọc với VNPay' : (paymentMethod === 'VNPAY' ? '💳 Thanh toán VNPay' : '✅ Đặt hàng COD')}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="checkout-summary">
                        <h3>{hasPreOrderItems ? `Đơn đặt trước (${totalItems} sản phẩm)` : `Đơn hàng (${totalItems} sản phẩm)`}</h3>
                        {cart?.items?.map(i => {
                            const combo = isComboItem(i);
                            return (
                                <div key={i.cartItemId || i.id} className={`summary-item ${combo ? 'summary-item-combo' : ''}`}>
                                    <span className="summary-item-name">
                                        {combo && <span className="combo-pill">Combo</span>}
                                        {getCartItemName(i)} x{i.quantity}
                                        {!combo && <small>{getCartItemTypeLabel(i)}</small>}
                                        <small>{getCartItemMeta(i)}</small>
                                    </span>
                                    <span>{formatVND(getCartItemLineTotal(i))}</span>
                                </div>
                            );
                        })}
                        <div className="summary-divider" />
                        <div className="summary-total summary-sub"><span>Tạm tính</span><strong>{formatVND(subTotal)}</strong></div>
                        <div className="summary-total summary-sub"><span>Giảm giá</span><strong>{discountAmount > 0 ? `- ${formatVND(discountAmount)}` : '0 ₫'}</strong></div>
                        {hasPreOrderItems && !hasMixedCheckout && (
                            <>
                                <div className="summary-total summary-sub"><span>Thanh toán hôm nay</span><strong>{formatVND(depositAmount)}</strong></div>
                                <div className="summary-total summary-sub"><span>Còn lại</span><strong>{formatVND(remainingAmount)}</strong></div>
                            </>
                        )}
                        <div className="summary-total"><strong>Tổng cộng</strong><strong className="total-num">{formatVND(total)}</strong></div>
                        {!!cart?.couponCode && <div className="checkout-summary-note">Ma giam gia: {cart.couponCode}</div>}
                        {!!cart?.orderNote && <div className="checkout-summary-note">Ghi chu: {cart.orderNote}</div>}
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            <Modal title="Thêm địa chỉ mới" open={addrModalOpen} onCancel={() => setAddrModalOpen(false)} footer={null} width={600}>
                <Form form={addrForm} layout="vertical" onFinish={handleAddAddress}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Form.Item name="receiverName" label="Họ tên người nhận" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số điện thoại' },
                                { pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item name="province" label="Tỉnh / Thành phố" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="district" label="Quận / Huyện" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="addressLine" label="Địa chỉ chi tiết" rules={[{ required: true }]}><Input placeholder="Số nhà, tên đường..." /></Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block style={{ marginTop: 12 }}>Lưu địa chỉ</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default CheckoutPage;

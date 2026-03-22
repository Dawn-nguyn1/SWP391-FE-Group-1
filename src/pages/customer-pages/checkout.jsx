import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Steps, Radio, Button, Modal, Form, Input, message, Spin } from 'antd';
import { EnvironmentOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
    getCartAPI, getAddressesAPI, createAddressAPI, checkoutAPI
} from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { normalizeAddress, normalizeAddressListResponse, normalizeCart, formatAddressText } from '../../utils/role-data';
import './checkout.css';

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const getMinDeposit = (amount) => Math.ceil((Number(amount) || 0) * 0.3);

const getPreOrderPlanMeta = ({ depositOption, total, minDeposit, remainingAmount }) => {
    if (depositOption === '100') {
        return {
            title: 'Thanh toán 100% ngay',
            step: 'Thanh toán một lần',
            description: `Bạn thanh toán toàn bộ ${formatVND(total)} qua VNPay ngay khi đặt đơn. Đơn sẽ không có bước thanh toán phần còn lại sau này.`,
            nowLabel: 'Thanh toán ngay',
            laterLabel: 'Thanh toán còn lại',
            laterValue: formatVND(0),
            submitLabel: 'Thanh toán toàn bộ qua VNPay',
        };
    }

        return {
            title: 'Đặt cọc 30%',
            step: 'Bước 1/2 của pre-order',
            description: `Bạn thanh toán trước ${formatVND(minDeposit)}. Sau khi support duyệt, backend sẽ mở bước thanh toán phần còn lại là ${formatVND(remainingAmount)} khi đơn chuyển sang trạng thái chờ thanh toán.`,
            nowLabel: 'Thanh toán ngay',
            laterLabel: 'Thanh toán phần còn lại',
            laterValue: formatVND(remainingAmount),
            submitLabel: 'Thanh toán tiền cọc qua VNPay',
        };
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext);
    const [step, setStep] = useState(0);
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [depositOption, setDepositOption] = useState('30');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [addrModalOpen, setAddrModalOpen] = useState(false);
    const [addrForm] = Form.useForm();

    useEffect(() => {
        Promise.all([getCartAPI(), getAddressesAPI()])
            .then(([c, addrs]) => {
                setCart(normalizeCart(c));
                const addrList = normalizeAddressListResponse(addrs);
                setAddresses(addrList);
                const def = addrList.find(a => a.isDefault) || addrList[0];
                if (def) setSelectedAddressId(def.id);
            })
            .catch(() => message.error('Không thể tải thông tin'))
            .finally(() => setLoading(false));
    }, []);

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

            const newAddr = normalizeAddress(await createAddressAPI(dto));
            setAddresses(prev => [...prev, newAddr]);
            setSelectedAddressId(newAddr.id);
            setAddrModalOpen(false);
            addrForm.resetFields();
            message.success('Đã thêm địa chỉ');
        } catch (e) {
            console.error('Add address error:', e);
            message.error(e?.message || 'Không thể thêm địa chỉ');
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) { message.warning('Vui lòng chọn địa chỉ giao hàng'); return; }
        setSubmitting(true);
        try {
            const payload = { addressId: selectedAddressId, paymentMethod };

            if (isPreOrderCart) {
                payload.paymentMethod = 'VNPAY';
                payload.depositAmount = depositAmount;
            }

            const res = await checkoutAPI(payload);
            await fetchCart();
            if (payload.paymentMethod === 'VNPAY' && res?.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                navigate('/customer/orders', { state: { ordered: true } });
                message.success('Đặt hàng thành công! Đơn hàng đang chờ xác nhận.');
            }
        } catch (e) {
            console.error('Checkout error:', e);
            const errorMessage = e?.response?.data?.message || e?.message || 'Đặt hàng thất bại';
            if (typeof errorMessage === 'string' && errorMessage.includes('PRE_ORDER must be paid online by VNPAY')) {
                setPaymentMethod('VNPAY');
                setStep(1);
                message.warning('Đơn pre-order cần thanh toán online qua VNPAY. Tôi đã chuyển bạn về bước chọn thanh toán.');
            } else {
                message.error(errorMessage);
            }
        } finally { setSubmitting(false); }
    };

    if (loading) return <div className="checkout-loading"><Spin size="large" /></div>;
    const total = cart?.finalTotal || 0;
    const isPreOrderCart = cart?.items?.some(item => item.saleType === 'PRE_ORDER');
    const minDeposit = getMinDeposit(total);
    const depositAmount = depositOption === '100' ? total : minDeposit;
    const remainingAmount = Math.max(total - depositAmount, 0);
    const preOrderPlanMeta = getPreOrderPlanMeta({ depositOption, total, minDeposit, remainingAmount });

    const steps = [
        { title: 'Địa chỉ', icon: <EnvironmentOutlined /> },
        { title: 'Thanh toán', icon: <CreditCardOutlined /> },
        { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
    ];

    return (
        <div className="checkout-page">
            <div className="checkout-inner">
                <h1 className="checkout-title">Đặt hàng</h1>
                <Steps current={step} items={steps} style={{ marginBottom: 36 }} />

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
                                                        <strong>{a.receiverName}</strong> — {a.phone}
                                                        <p>{formatAddressText(a)}</p>
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
                                <h3>Phương thức thanh toán</h3>
                                {isPreOrderCart ? (
                                    <>
                                        <div className="preorder-payment-note">
                                            <strong>Đơn pre-order thanh toán online qua VNPay.</strong>
                                            <p>Timeline mới: thanh toán cọc hoặc thanh toán toàn bộ khi đặt đơn. Nếu chọn cọc 30%, bước thanh toán phần còn lại chỉ xuất hiện khi backend chuyển đơn sang trạng thái chờ thanh toán.</p>
                                        </div>
                                        <Radio.Group value={depositOption} onChange={e => setDepositOption(e.target.value)} className="payment-group">
                                            <Radio value="30" className="payment-radio">
                                                <div className="payment-option">
                                                    <span className="pay-icon">💳</span>
                                                    <div>
                                                        <strong>Đặt cọc 30%</strong>
                                                        <p>Bước 1/2 của pre-order. Thanh toán trước {formatVND(minDeposit)}, phần còn lại {formatVND(remainingAmount)} sẽ được mở sau khi support duyệt và đơn chuyển sang chờ thanh toán.</p>
                                                    </div>
                                                </div>
                                            </Radio>
                                            <Radio value="100" className="payment-radio">
                                                <div className="payment-option">
                                                    <span className="pay-icon">💳</span>
                                                    <div>
                                                        <strong>Thanh toán 100%</strong>
                                                        <p>Thanh toán toàn bộ {formatVND(total)} ngay trong lần đặt đơn. Đơn sẽ không có bước thanh toán còn lại.</p>
                                                    </div>
                                                </div>
                                            </Radio>
                                        </Radio.Group>
                                        <div className="preorder-payment-note" style={{ marginTop: 16 }}>
                                            <strong>{preOrderPlanMeta.title}</strong>
                                            <p>{preOrderPlanMeta.description}</p>
                                        </div>
                                    </>
                                ) : (
                                    <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="payment-group">
                                        <Radio value="COD" className="payment-radio">
                                            <div className="payment-option">
                                                <span className="pay-icon">🚚</span>
                                                <div><strong>Thanh toán khi nhận hàng (COD)</strong><p>Trả tiền mặt khi nhận hàng</p></div>
                                            </div>
                                        </Radio>
                                        <Radio value="VNPAY" className="payment-radio">
                                            <div className="payment-option">
                                                <span className="pay-icon">💳</span>
                                                <div><strong>Thanh toán qua VNPay</strong><p>ATM, Visa, MasterCard, QR Code</p></div>
                                            </div>
                                        </Radio>
                                    </Radio.Group>
                                )}
                                <div className="step-btns">
                                    <Button onClick={() => setStep(0)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn" onClick={() => setStep(2)}>Xem lại đơn hàng</Button>
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
                                        return a ? <p>{a.receiverName} — {a.phone}<br />{formatAddressText(a)}</p> : null;
                                    })()}
                                </div>
                                <div className="confirm-section">
                                    <h4>Thanh toán:</h4>
                                    <p>
                                        {isPreOrderCart
                                            ? `💳 VNPay - ${preOrderPlanMeta.title}`
                                            : paymentMethod === 'VNPAY'
                                                ? '💳 VNPay'
                                                : '🚚 COD – Thanh toán khi nhận'}
                                    </p>
                                    {isPreOrderCart && (
                                        <div className="preorder-payment-breakdown">
                                            <span>Tiến độ: <strong>{preOrderPlanMeta.step}</strong></span>
                                            <span>{preOrderPlanMeta.nowLabel}: <strong>{formatVND(depositAmount)}</strong></span>
                                            <span>{preOrderPlanMeta.laterLabel}: <strong>{preOrderPlanMeta.laterValue}</strong></span>
                                        </div>
                                    )}
                                </div>
                                <div className="confirm-section">
                                    <h4>Sản phẩm:</h4>
                                    {cart?.items?.map(i => (
                                        <div key={i.clientKey} className="confirm-item">
                                            <span>{i.productName} x{i.quantity}</span>
                                            <span>{formatVND(i.lineTotal || (i.unitPrice || 0) * (i.quantity || 1))}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="step-btns">
                                    <Button onClick={() => setStep(1)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn order-btn" loading={submitting} onClick={handleCheckout}>
                                        {isPreOrderCart
                                            ? `💳 ${preOrderPlanMeta.submitLabel}`
                                            : paymentMethod === 'VNPAY'
                                                ? '💳 Thanh toán VNPay'
                                                : '✅ Đặt hàng COD'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="checkout-summary">
                        <h3>Đơn hàng ({cart?.items?.length || 0} sản phẩm)</h3>
                        {cart?.items?.map(i => (
                            <div key={i.clientKey} className="summary-item">
                                <span className="summary-item-name">{i.productName} x{i.quantity}</span>
                                <span>{formatVND(i.lineTotal || (i.unitPrice || 0) * (i.quantity || 1))}</span>
                            </div>
                        ))}
                        <div className="summary-divider" />
                        {isPreOrderCart && (
                            <>
                                <div className="summary-item">
                                    <span className="summary-item-name">{preOrderPlanMeta.nowLabel}</span>
                                    <span>{formatVND(depositAmount)}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-item-name">{preOrderPlanMeta.laterLabel}</span>
                                    <span>{preOrderPlanMeta.laterValue}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-item-name">Tiến độ pre-order</span>
                                    <span>{preOrderPlanMeta.step}</span>
                                </div>
                                <div className="summary-divider" />
                            </>
                        )}
                        <div className="summary-total"><strong>Tổng cộng</strong><strong className="total-num">{formatVND(total)}</strong></div>
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

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Steps, Radio, Button, Modal, Form, Input, message, Spin } from 'antd';
import { EnvironmentOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
    getCartAPI,
    getAddressesAPI,
    createAddressAPI,
    checkoutAPI,
    getPublicCampaignsAPI,
    getPublicCampaignDetailAPI,
    getPublicProductDetailAPI,
} from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { normalizeAddress, normalizeAddressListResponse, normalizeCart, formatAddressText, normalizeCollectionResponse } from '../../utils/role-data';
import { buildCampaignConfigIndex, getCartLineTotal, getPreOrderDepositAmount, normalizeCampaignPayload, resolvePreOrderPolicy } from '../../utils/preorder-cart-policy';
import './checkout.css';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
const normalizeText = (value) => String(value || '').trim().toLowerCase();
const buildAttributeSignature = (attributes = []) => (Array.isArray(attributes) ? attributes : []).map((attribute) => `${normalizeText(attribute?.attributeName)}:${normalizeText(attribute?.attributeValue)}`).filter(Boolean).sort().join('|');
const getCheckoutErrorMessage = (error) => {
    const rawMessage = error?.response?.data?.message || error?.message || '';
    if (rawMessage === 'Deposit must be exactly 30% or 100% of total') {
        return 'Backend checkout vẫn đang áp dụng quy tắc cũ 30% hoặc 100%. Hãy kiểm tra lại service BE đang chạy và khởi động lại server sau khi cập nhật.';
    }
    return rawMessage || 'Đặt hàng thất bại';
};

const resolveCartVariantId = (item, productDetail) => {
    const variants = Array.isArray(productDetail?.variants) ? productDetail.variants : [];
    if (variants.length === 0) return null;
    if (variants.length === 1) return variants[0]?.id || null;
    const cartSignature = buildAttributeSignature(item?.attributes);
    const unitPrice = Number(item?.unitPrice || item?.lineTotal || 0);
    return variants.find((variant) => {
        const signature = buildAttributeSignature(variant?.attributes);
        return signature === cartSignature || (Number(variant?.price || 0) === unitPrice && signature === cartSignature);
    })?.id || null;
};

const getPlanMeta = ({ paymentMode, total, depositAmount, remainingAmount, preorderPolicy }) => {
    const percent = Number(preorderPolicy?.depositPercent || 0);
    const percentLabel = percent > 0 ? `${percent}%` : 'theo campaign';
    if (preorderPolicy?.paymentOption === 'FULL_ONLY' || paymentMode === 'full') {
        return {
            title: 'Thanh toán 100%',
            step: 'Thanh toán một lần',
            desc: `Bạn thanh toán toàn bộ ${formatVND(total)} ngay bây giờ.`,
            nowLabel: 'Thanh toán hôm nay',
            laterLabel: 'Thanh toán sau',
            laterValue: formatVND(0),
            submitLabel: 'Thanh toán toàn bộ qua VNPay',
        };
    }
    return {
        title: `Đặt cọc ${percentLabel}`,
        step: `Đặt cọc ${percentLabel}`,
        desc: `Bạn thanh toán trước ${formatVND(depositAmount)} để giữ chỗ. Phần còn lại là ${formatVND(remainingAmount)}.`,
        nowLabel: 'Thanh toán hôm nay',
        laterLabel: 'Thanh toán sau',
        laterValue: formatVND(remainingAmount),
        submitLabel: `Thanh toán đặt cọc ${percentLabel} qua VNPay`,
    };
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { fetchCart } = useContext(CartContext);
    const [step, setStep] = useState(0);
    const [cart, setCart] = useState(null);
    const [preorderPolicy, setPreorderPolicy] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [depositOption, setDepositOption] = useState('deposit');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [addrModalOpen, setAddrModalOpen] = useState(false);
    const [addrForm] = Form.useForm();

    useEffect(() => {
        const loadCheckout = async () => {
            try {
                const [cartResponse, addressResponse, campaignResponse] = await Promise.all([
                    getCartAPI(),
                    getAddressesAPI(),
                    getPublicCampaignsAPI(),
                ]);

                const normalizedCart = normalizeCart(cartResponse);
                const preorderProductIds = [...new Set(
                    normalizedCart.items.filter((item) => item?.saleType === 'PRE_ORDER' && item?.productId).map((item) => item.productId)
                )];
                const productDetails = new Map(await Promise.all(
                    preorderProductIds.map(async (productId) => {
                        try { return [String(productId), await getPublicProductDetailAPI(productId)]; }
                        catch { return [String(productId), null]; }
                    })
                ));

                const enrichedCart = {
                    ...normalizedCart,
                    items: normalizedCart.items.map((item) => item?.saleType !== 'PRE_ORDER' ? item : {
                        ...item,
                        resolvedVariantId: resolveCartVariantId(item, item?.productId ? productDetails.get(String(item.productId)) : null) || null,
                    }),
                };

                const campaigns = normalizeCollectionResponse(campaignResponse).items;
                const detailedCampaigns = await Promise.all(
                    campaigns.map(async (campaign) => {
                        try { return campaign?.id ? normalizeCampaignPayload(await getPublicCampaignDetailAPI(campaign.id)) : null; }
                        catch { return normalizeCampaignPayload(campaign); }
                    })
                );

                const configIndex = buildCampaignConfigIndex(detailedCampaigns.filter(Boolean).length ? detailedCampaigns.filter(Boolean) : campaigns);
                const nextPolicy = resolvePreOrderPolicy(enrichedCart.items, configIndex);

                setCart(enrichedCart);
                setPreorderPolicy(nextPolicy);
                setDepositOption(nextPolicy.paymentOption === 'FULL_ONLY' ? 'full' : 'deposit');

                const normalizedAddresses = normalizeAddressListResponse(addressResponse);
                setAddresses(normalizedAddresses);
                const defaultAddress = normalizedAddresses.find((address) => address.isDefault) || normalizedAddresses[0];
                if (defaultAddress) setSelectedAddressId(defaultAddress.id);
            } catch {
                message.error('Không thể tải thông tin thanh toán.');
            } finally {
                setLoading(false);
            }
        };

        loadCheckout();
    }, []);

    const handleAddAddress = async (values) => {
        try {
            const newAddress = normalizeAddress(await createAddressAPI(values));
            setAddresses((prev) => [...prev, newAddress]);
            setSelectedAddressId(newAddress.id);
            setAddrModalOpen(false);
            addrForm.resetFields();
            message.success('Đã thêm địa chỉ.');
        } catch (error) {
            message.error(error?.message || 'Không thể thêm địa chỉ.');
        }
    };

    if (loading) return <div className="checkout-loading"><Spin size="large" /></div>;

    const total = cart?.finalTotal || 0;
    const isPreOrderCart = Boolean(preorderPolicy?.isPreOrderCart);
    const paymentOption = preorderPolicy?.paymentOption;
    const selectedPaymentMode = !isPreOrderCart ? depositOption : paymentOption === 'FULL_ONLY' ? 'full' : paymentOption === 'DEPOSIT_ONLY' ? 'deposit' : depositOption;
    const depositAmount = getPreOrderDepositAmount({ total, paymentMode: selectedPaymentMode, preorderPolicy });
    const remainingAmount = isPreOrderCart ? Number(preorderPolicy?.dueLater || Math.max(total - depositAmount, 0)) : 0;
    const planMeta = getPlanMeta({ paymentMode: selectedPaymentMode, total, depositAmount, remainingAmount, preorderPolicy });

    const handleCheckout = async () => {
        if (!selectedAddressId) return message.warning('Vui lòng chọn địa chỉ giao hàng.');

        setSubmitting(true);
        try {
            const payload = { addressId: selectedAddressId, paymentMethod };
            if (isPreOrderCart) {
                payload.paymentMethod = 'VNPAY';
                if (depositAmount > 0) payload.depositAmount = depositAmount;
            }

            const response = await checkoutAPI(payload);
            await fetchCart();
            if (payload.paymentMethod === 'VNPAY' && response?.paymentUrl) {
                window.location.href = response.paymentUrl;
                return;
            }

            navigate('/customer/orders', { state: { ordered: true } });
            message.success('Đặt hàng thành công.');
        } catch (error) {
            message.error(getCheckoutErrorMessage(error));
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        { title: 'Địa chỉ', icon: <EnvironmentOutlined /> },
        { title: 'Thanh toán', icon: <CreditCardOutlined /> },
        { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
    ];

    return (
        <div className="checkout-page">
            <div className="checkout-inner">
                <h1 className="checkout-title">Hoàn tất đơn hàng</h1>
                <Steps current={step} items={steps} style={{ marginBottom: 36 }} />

                <div className="checkout-layout">
                    <div className="checkout-form-area">
                        {step === 0 && (
                            <div className="step-card">
                                <h3>Địa chỉ giao hàng</h3>
                                {addresses.length === 0 ? (
                                    <p style={{ color: '#94a3b8' }}>Bạn chưa có địa chỉ nào.</p>
                                ) : (
                                    <Radio.Group value={selectedAddressId} onChange={(event) => setSelectedAddressId(event.target.value)} style={{ width: '100%' }}>
                                        <div className="address-list">
                                            {addresses.map((address) => (
                                                <Radio key={address.id} value={address.id} className="address-radio">
                                                    <div className="address-card">
                                                        <strong>{address.receiverName}</strong> - {address.phone}
                                                        <p>{formatAddressText(address)}</p>
                                                        {address.isDefault && <span className="default-badge">Mặc định</span>}
                                                    </div>
                                                </Radio>
                                            ))}
                                        </div>
                                    </Radio.Group>
                                )}
                                <Button onClick={() => setAddrModalOpen(true)} style={{ marginTop: 12 }}>+ Thêm địa chỉ mới</Button>
                                <Button type="primary" className="next-btn" onClick={() => setStep(1)} disabled={!selectedAddressId}>Tiếp tục</Button>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="step-card">
                                <h3>Phương thức thanh toán</h3>
                                {isPreOrderCart ? (
                                    <>
                                        <div className="preorder-payment-note">
                                            <strong>Cấu hình pre-order hiện tại</strong>
                                            <p>{paymentOption === 'FULL_ONLY' ? 'Campaign này yêu cầu thanh toán 100%.' : `Campaign này đang cấu hình đặt cọc ${preorderPolicy?.depositPercent || 0}%.`}</p>
                                        </div>
                                        <Radio.Group value={selectedPaymentMode} onChange={(event) => setDepositOption(event.target.value)} className="payment-group">
                                            {paymentOption !== 'FULL_ONLY' && (
                                                <Radio value="deposit" className="payment-radio">
                                                    <div className="payment-option">
                                                        <span className="pay-icon">💳</span>
                                                        <div>
                                                            <strong>Đặt cọc {preorderPolicy?.depositPercent || 0}%</strong>
                                                            <p>Thanh toán trước {formatVND(depositAmount)}, thanh toán sau {formatVND(remainingAmount)}.</p>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            )}
                                            {paymentOption !== 'DEPOSIT_ONLY' && (
                                                <Radio value="full" className="payment-radio">
                                                    <div className="payment-option">
                                                        <span className="pay-icon">💳</span>
                                                        <div>
                                                            <strong>Thanh toán 100%</strong>
                                                            <p>Hoàn tất toàn bộ {formatVND(total)} ngay bây giờ.</p>
                                                        </div>
                                                    </div>
                                                </Radio>
                                            )}
                                        </Radio.Group>
                                        <div className="preorder-payment-note" style={{ marginTop: 16 }}>
                                            <strong>{planMeta.title}</strong>
                                            <p>{planMeta.desc}</p>
                                        </div>
                                    </>
                                ) : (
                                    <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="payment-group">
                                        <Radio value="COD" className="payment-radio">
                                            <div className="payment-option"><span className="pay-icon">🚚</span><div><strong>Thanh toán khi nhận hàng</strong><p>Thanh toán khi giao tới tay bạn.</p></div></div>
                                        </Radio>
                                        <Radio value="VNPAY" className="payment-radio">
                                            <div className="payment-option"><span className="pay-icon">💳</span><div><strong>Thanh toán qua VNPay</strong><p>Nhanh chóng và an toàn.</p></div></div>
                                        </Radio>
                                    </Radio.Group>
                                )}
                                <div className="step-btns">
                                    <Button onClick={() => setStep(0)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn" onClick={() => setStep(2)}>Xem lại đơn hàng</Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="step-card">
                                <h3>Xác nhận đơn hàng</h3>
                                <div className="confirm-section">
                                    <h4>Giao đến:</h4>
                                    {(() => {
                                        const address = addresses.find((item) => item.id === selectedAddressId);
                                        return address ? <p>{address.receiverName} - {address.phone}<br />{formatAddressText(address)}</p> : null;
                                    })()}
                                </div>
                                <div className="confirm-section">
                                    <h4>Thanh toán:</h4>
                                    <p>{isPreOrderCart ? `VNPay - ${planMeta.title}` : paymentMethod === 'VNPAY' ? 'VNPay' : 'COD - Thanh toán khi nhận hàng'}</p>
                                    {isPreOrderCart && (
                                        <div className="preorder-payment-breakdown">
                                            <span>Lựa chọn: <strong>{planMeta.step}</strong></span>
                                            <span>{planMeta.nowLabel}: <strong>{formatVND(depositAmount)}</strong></span>
                                            <span>{planMeta.laterLabel}: <strong>{planMeta.laterValue}</strong></span>
                                        </div>
                                    )}
                                </div>
                                <div className="confirm-section">
                                    <h4>Sản phẩm:</h4>
                                    {cart?.items?.map((item) => (
                                        <div key={item.clientKey} className="confirm-item">
                                            <span>{item.productName} x{item.quantity}</span>
                                            <span>{formatVND(getCartLineTotal(item))}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="step-btns">
                                    <Button onClick={() => setStep(1)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn order-btn" loading={submitting} onClick={handleCheckout}>
                                        {isPreOrderCart ? planMeta.submitLabel : paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Đặt hàng COD'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="checkout-summary">
                        <h3>Đơn hàng ({cart?.items?.length || 0} sản phẩm)</h3>
                        {cart?.items?.map((item) => (
                            <div key={item.clientKey} className="summary-item">
                                <span className="summary-item-name">{item.productName} x{item.quantity}</span>
                                <span>{formatVND(getCartLineTotal(item))}</span>
                            </div>
                        ))}
                        <div className="summary-divider" />
                        {isPreOrderCart && (
                            <>
                                <div className="summary-item"><span className="summary-item-name">{planMeta.nowLabel}</span><span>{formatVND(depositAmount)}</span></div>
                                <div className="summary-item"><span className="summary-item-name">{planMeta.laterLabel}</span><span>{planMeta.laterValue}</span></div>
                                <div className="summary-item"><span className="summary-item-name">Lựa chọn hiện tại</span><span>{planMeta.step}</span></div>
                                <div className="summary-divider" />
                            </>
                        )}
                        <div className="summary-total">
                            <strong>Tổng cộng</strong>
                            <strong className="total-num">{formatVND(total)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <Modal title="Thêm địa chỉ mới" open={addrModalOpen} onCancel={() => setAddrModalOpen(false)} footer={null} width={600}>
                <Form form={addrForm} layout="vertical" onFinish={handleAddAddress}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Form.Item name="receiverName" label="Họ tên người nhận" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm 10 số và bắt đầu bằng 0' }]}><Input /></Form.Item>
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

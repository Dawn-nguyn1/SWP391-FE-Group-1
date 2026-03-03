import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Steps, Radio, Button, Select, Modal, Form, Input, message, Spin } from 'antd';
import { EnvironmentOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import {
    getCartAPI, getAddressesAPI, createAddressAPI, checkoutAPI, getProvincesAPI, getDistrictsAPI, getWardsAPI
} from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import './checkout.css';

const { Option } = Select;
const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

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
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [locationUnavailable, setLocationUnavailable] = useState(false);

    useEffect(() => {
        const loadCheckoutData = async () => {
            try {
                const [c, addrs] = await Promise.all([getCartAPI(), getAddressesAPI()]);
                setCart(c);
                const addrList = Array.isArray(addrs) ? addrs : [];
                setAddresses(addrList);
                const def = addrList.find(a => a.isDefault) || addrList[0];
                if (def) setSelectedAddressId(def.id);
            } catch {
                message.error('Không thể tải giỏ hàng/địa chỉ');
            }

            try {
                const provs = await getProvincesAPI();
                if (provs?.data) {
                    setProvinces(provs.data);
                    setLocationUnavailable(false);
                } else {
                    setLocationUnavailable(true);
                }
            } catch {
                setLocationUnavailable(true);
                message.warning('Không tải được danh sách tỉnh/thành. Bạn có thể nhập thủ công.');
            } finally {
                setLoading(false);
            }
        };

        loadCheckoutData();
    }, []);

    const handleProvinceChange = async (provinceId) => {
        if (locationUnavailable) return;
        addrForm.setFieldsValue({ districtId: undefined, wardCode: undefined });
        setWards([]);
        try {
            const res = await getDistrictsAPI(provinceId);
            if (res?.data) setDistricts(res.data);
        } catch { message.error('Không thể tải quận huyện'); }
    };

    const handleDistrictChange = async (districtId) => {
        if (locationUnavailable) return;
        addrForm.setFieldsValue({ wardCode: undefined });
        try {
            const res = await getWardsAPI(districtId);
            if (res?.data) setWards(res.data);
        } catch { message.error('Không thể tải phường xã'); }
    };

    const handleAddAddress = async (vals) => {
        try {
            const provinceName = locationUnavailable
                ? vals.province
                : provinces.find(p => p.ProvinceID === vals.provinceId)?.ProvinceName;
            const districtName = locationUnavailable
                ? vals.district
                : districts.find(d => d.DistrictID === vals.districtId)?.DistrictName;
            const wardName = locationUnavailable
                ? vals.ward
                : wards.find(w => w.WardCode === vals.wardCode)?.WardName;

            const dto = {
                receiverName: vals.receiverName,
                phone: vals.phone,
                province: provinceName,
                district: districtName,
                ward: wardName,
                addressLine: vals.addressLine
            };
            if (!locationUnavailable) {
                dto.districtId = vals.districtId;
                dto.wardCode = vals.wardCode;
            }

            const newAddr = await createAddressAPI(dto);
            setAddresses(prev => [...prev, newAddr]);
            setSelectedAddressId(newAddr.id);
            setAddrModalOpen(false);
            addrForm.resetFields();
            setDistricts([]);
            setWards([]);
            message.success('Đã thêm địa chỉ');
        } catch (e) {
            console.error('Add address error:', e);
            message.error(e?.message || 'Không thể thêm địa chỉ');
        }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) { message.warning('Vui lòng chọn địa chỉ giao hàng'); return; }
        if (!cart?.items?.length) { message.warning('Giỏ hàng đang trống'); return; }
        setSubmitting(true);
        try {
            const res = await checkoutAPI({ addressId: selectedAddressId, paymentMethod });
            await fetchCart();
            if (paymentMethod === 'VNPAY' && res?.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                navigate('/customer/orders', { state: { ordered: true } });
                message.success('Đặt hàng thành công! Đơn hàng đang chờ xác nhận.');
            }
        } catch (e) {
            console.error('Checkout error:', e);
            message.error(e?.message || 'Đặt hàng thất bại');
        } finally { setSubmitting(false); }
    };

    if (loading) return <div className="checkout-loading"><Spin size="large" /></div>;
    const total = cart?.finalTotal || 0;
    // items mapping: use productName and unitPrice

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
                                {!cart?.items?.length && (
                                    <div style={{ marginBottom: 12, color: '#d97706' }}>
                                        Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.
                                    </div>
                                )}
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
                                {!cart?.items?.length && (
                                    <Button style={{ marginLeft: 8 }} onClick={() => navigate('/customer/cart')}>
                                        Đi tới giỏ hàng
                                    </Button>
                                )}
                                <Button
                                    type="primary"
                                    className="next-btn"
                                    onClick={() => setStep(1)}
                                    disabled={!selectedAddressId || !cart?.items?.length}
                                >
                                    Tiếp tục
                                </Button>
                            </div>
                        )}

                        {/* Step 1: Payment */}
                        {step === 1 && (
                            <div className="step-card">
                                <h3>Phương thức thanh toán</h3>
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
                                <div className="step-btns">
                                    <Button onClick={() => setStep(0)}>Quay lại</Button>
                                    <Button
                                        type="primary"
                                        className="next-btn"
                                        onClick={() => setStep(2)}
                                        disabled={!cart?.items?.length}
                                    >
                                        Xem lại đơn hàng
                                    </Button>
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
                                    <h4>Thanh toán:</h4>
                                    <p>{paymentMethod === 'VNPAY' ? '💳 VNPay' : '🚚 COD – Thanh toán khi nhận'}</p>
                                </div>
                                <div className="confirm-section">
                                    <h4>Sản phẩm:</h4>
                                    {cart?.items?.map(i => (
                                        <div key={i.id} className="confirm-item">
                                            <span>{i.productName} x{i.quantity}</span>
                                            <span>{formatVND((i.unitPrice || 0) * (i.quantity || 1))}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="step-btns">
                                    <Button onClick={() => setStep(1)}>Quay lại</Button>
                                    <Button type="primary" className="next-btn order-btn" loading={submitting} onClick={handleCheckout} disabled={!cart?.items?.length}>
                                        {paymentMethod === 'VNPAY' ? '💳 Thanh toán VNPay' : '✅ Đặt hàng COD'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="checkout-summary">
                        <h3>Đơn hàng ({cart?.items?.length || 0} sản phẩm)</h3>
                        {cart?.items?.map(i => (
                            <div key={i.id} className="summary-item">
                                <span className="summary-item-name">{i.productName} x{i.quantity}</span>
                                <span>{formatVND((i.unitPrice || 0) * (i.quantity || 1))}</span>
                            </div>
                        ))}
                        <div className="summary-divider" />
                        <div className="summary-total"><strong>Tổng cộng</strong><strong className="total-num">{formatVND(total)}</strong></div>
                    </div>
                </div>
            </div>

            {/* Add Address Modal */}
            <Modal title="Thêm địa chỉ mới" open={addrModalOpen} onCancel={() => setAddrModalOpen(false)} footer={null} width={600}>
                <Form form={addrForm} layout="vertical" onFinish={handleAddAddress}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Form.Item name="receiverName" label="Họ tên người nhận" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                        {locationUnavailable ? (
                            <>
                                <Form.Item name="province" label="Tỉnh / Thành phố" rules={[{ required: true }]}>
                                    <Input placeholder="Nhập tỉnh/thành phố" />
                                </Form.Item>
                                <Form.Item name="district" label="Quận / Huyện" rules={[{ required: true }]}>
                                    <Input placeholder="Nhập quận/huyện" />
                                </Form.Item>
                                <Form.Item name="ward" label="Phường / Xã" rules={[{ required: true }]}>
                                    <Input placeholder="Nhập phường/xã" />
                                </Form.Item>
                            </>
                        ) : (
                            <>
                                <Form.Item name="provinceId" label="Tỉnh / Thành phố" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn tỉnh thành" onChange={handleProvinceChange}>
                                        {provinces.map(p => <Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Option>)}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="districtId" label="Quận / Huyện" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn quận huyện" onChange={handleDistrictChange} disabled={!districts.length}>
                                        {districts.map(d => <Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Option>)}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="wardCode" label="Phường / Xã" rules={[{ required: true }]}>
                                    <Select placeholder="Chọn phường xã" disabled={!wards.length}>
                                        {wards.map(w => <Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Option>)}
                                    </Select>
                                </Form.Item>
                            </>
                        )}
                        <Form.Item name="addressLine" label="Địa chỉ chi tiết" rules={[{ required: true }]}><Input placeholder="Số nhà, tên đường..." /></Form.Item>
                    </div>
                    <Button type="primary" htmlType="submit" block style={{ marginTop: 12 }}>Lưu địa chỉ</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default CheckoutPage;

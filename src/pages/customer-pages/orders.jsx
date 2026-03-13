import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Tag, Popconfirm, message, Empty, Tooltip, Modal, InputNumber, Select, Input } from 'antd';
import { getCustomerOrdersAPI, cancelOrderByCustomerAPI, submitCustomerReturnRequestAPI, getCustomerReturnRequestsAPI } from '../../services/api.service';
import './orders.css';

const STATUS_CONFIG = {
    PENDING_PAYMENT:   { label: 'Chờ thanh toán', color: 'gold' },
    WAITING_CONFIRM:   { label: 'Chờ xác nhận',   color: 'orange' },
    SUPPORT_CONFIRMED: { label: 'Đã xác nhận',    color: 'blue' },
    SHIPPING:          { label: 'Đang giao hàng', color: 'cyan' },
    COMPLETED:         { label: 'Hoàn thành',     color: 'green' },
    CANCELLED:         { label: 'Đã hủy',         color: 'red' },
    RETURNED:          { label: 'Hoàn trả',       color: 'volcano' },
};

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN') : '';
const formatAddress = (address) => {
    if (!address) return '—';
    const parts = [address.addressLine, address.ward, address.district, address.province].filter(Boolean);
    return parts.join(', ');
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnRequests, setReturnRequests] = useState([]);
    const [returnLoading, setReturnLoading] = useState(true);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [returnForm, setReturnForm] = useState({
        orderId: null,
        orderItemId: null,
        quantity: 1,
        reason: 'DEFECTIVE',
        note: '',
        evidenceUrls: ''
    });

    const load = async () => {
        try {
            setLoading(true);
            const res = await getCustomerOrdersAPI();
            setOrders(Array.isArray(res) ? res : res?.content || []);
        } catch { message.error('Không thể tải đơn hàng'); }
        finally { setLoading(false); }
    };

    const loadReturnRequests = async () => {
        try {
            setReturnLoading(true);
            const res = await getCustomerReturnRequestsAPI();
            setReturnRequests(Array.isArray(res) ? res : res?.content || []);
        } catch {
            message.error('Không thể tải yêu cầu đổi trả');
        } finally {
            setReturnLoading(false);
        }
    };

    useEffect(() => { 
        load(); 
        loadReturnRequests(); 
        const timer = setInterval(() => loadReturnRequests(), 15000);
        return () => clearInterval(timer);
    }, []);

    const handleCancel = async (orderId) => {
        try {
            await cancelOrderByCustomerAPI(orderId);
            message.success('Đã hủy đơn hàng');
            load();
        } catch (e) { message.error(e?.response?.data?.message || 'Không thể hủy đơn'); }
    };

    const openReturnModal = (order) => {
        setReturnForm({
            orderId: order.id,
            orderItemId: null,
            quantity: 1,
            reason: 'DEFECTIVE',
            note: '',
            evidenceUrls: ''
        });
        setReturnModalOpen(true);
    };

    const submitReturnRequest = async () => {
        if (!returnForm.orderItemId) {
            message.error('Vui lòng nhập mã Order Item');
            return;
        }
        const activeStatuses = new Set(['SUBMITTED', 'WAITING_RETURN', 'RECEIVED', 'REFUND_REQUESTED']);
        const existing = returnRequests.find(r => r.orderItemId === returnForm.orderItemId && activeStatuses.has(r.status));
        if (existing) {
            message.error('Order item này đã có yêu cầu đổi trả đang xử lý');
            return;
        }
        try {
            await submitCustomerReturnRequestAPI({
                orderItemId: returnForm.orderItemId,
                quantity: returnForm.quantity,
                reason: returnForm.reason,
                note: returnForm.note || null,
                evidenceUrls: returnForm.evidenceUrls || null
            });
            message.success('Đã gửi yêu cầu đổi trả');
            setReturnModalOpen(false);
            loadReturnRequests();
        } catch (e) {
            message.error(e?.response?.data?.message || 'Không thể gửi yêu cầu đổi trả');
        }
    };

    if (loading) return <div className="orders-loading"><Spin size="large" /></div>;

    return (
        <div className="orders-page">
            <div className="orders-inner">
                <h1 className="orders-title">Đơn hàng của tôi</h1>
                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <Empty description={<span>Bạn chưa có đơn hàng nào. <Link to="/customer/products">Mua sắm ngay!</Link></span>} />
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            const statusCfg = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, color: 'default' };
                            const canCancel = order.orderStatus === 'WAITING_CONFIRM';
                            const canReturn = order.orderStatus === 'COMPLETED';
                            const returnForOrder = returnRequests.find(r => r.orderId === order.id);
                            return (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <div className="order-main">
                                            <div className="order-title">
                                                <span className="order-id">{order.orderCode || `Đơn #${order.id}`}</span>
                                                <span className="order-type">{order.orderType || '—'}</span>
                                            </div>
                                            <span className="order-date">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="order-header-right">
                                            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                                            <span className="order-pay-method">{order.remainingPaymentMethod || order.paymentMethod || '—'}</span>
                                        </div>
                                    </div>

                                    <div className="order-info-grid">
                                        <div className="info-block">
                                            <span>Người nhận</span>
                                            <strong>{order.address?.receiverName || '—'}</strong>
                                        </div>
                                        <div className="info-block">
                                            <span>Số điện thoại</span>
                                            <strong>{order.address?.phone || '—'}</strong>
                                        </div>
                                        <div className="info-block full">
                                            <span>Địa chỉ</span>
                                            <strong>{formatAddress(order.address)}</strong>
                                        </div>
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-item">
                                            <span>Tổng tiền</span>
                                            <strong>{formatVND(order.totalAmount || order.total)}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Đặt cọc</span>
                                            <strong>{formatVND(order.deposit)}</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Còn lại</span>
                                            <strong>{formatVND(order.remainingAmount)}</strong>
                                        </div>
                                        {canCancel && (
                                            <Popconfirm
                                                title="Xác nhận hủy đơn hàng?"
                                                description="Hành động này không thể hoàn tác."
                                                onConfirm={() => handleCancel(order.id)}
                                                okText="Hủy đơn"
                                                cancelText="Giữ lại"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <button className="cancel-btn">Hủy đơn</button>
                                            </Popconfirm>
                                        )}
                                        {canReturn && !returnForOrder && (
                                            <button className="return-btn" onClick={() => openReturnModal(order)}>
                                                Yêu cầu đổi trả
                                            </button>
                                        )}
                                        {returnForOrder && (
                                            <span className="return-status">Đã gửi yêu cầu ({returnForOrder.status})</span>
                                        )}
                                        {!canCancel && (
                                            <Tooltip title="Chỉ hủy được khi đơn ở trạng thái Chờ xác nhận">
                                                <span className="cancel-disabled">Không thể hủy</span>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="orders-title" style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Yêu cầu đổi trả của tôi</span>
                    <button className="return-refresh" onClick={loadReturnRequests}>Tải lại</button>
                </div>
                {returnLoading ? (
                    <div className="orders-loading"><Spin size="large" /></div>
                ) : returnRequests.length === 0 ? (
                    <div className="orders-empty">
                        <Empty description={<span>Chưa có yêu cầu đổi trả.</span>} />
                    </div>
                ) : (
                    <div className="return-table">
                        <div className="return-table-header">
                            <span>Mã yêu cầu</span>
                            <span>Order</span>
                            <span>Order Item</span>
                            <span>Số lượng</span>
                            <span>Đã nhận</span>
                            <span>Lý do</span>
                            <span>Trạng thái</span>
                            <span>Ngày tạo</span>
                            <span>Ghi chú</span>
                            <span>Minh chứng</span>
                        </div>
                        {returnRequests.map(req => (
                            <div key={req.id} className="return-table-row">
                                <span className="return-id">RR-{req.id}</span>
                                <span>#{req.orderId}</span>
                                <span>{req.orderItemId}</span>
                                <span>{req.requestedQuantity}</span>
                                <span>{req.acceptedQuantity ?? '—'}</span>
                                <span>{req.reason}</span>
                                <Tag color="orange">{req.status}</Tag>
                                <span>{formatDate(req.createdAt)}</span>
                                <span>{req.note || '—'}</span>
                                <span>
                                    {req.evidenceUrls ? (
                                        <div className="evidence-thumbs">
                                            {req.evidenceUrls.split(',').map((url, idx) => (
                                                <div key={`${req.id}-ev-${idx}`} className="evidence-thumb">
                                                    <img src={url.trim()} alt={`evidence-${idx + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                title={`Yêu cầu đổi trả #${returnForm.orderId ?? ''}`}
                open={returnModalOpen}
                onCancel={() => setReturnModalOpen(false)}
                onOk={submitReturnRequest}
                okText="Gửi yêu cầu"
                cancelText="Hủy"
            >
                <div className="return-form">
                    <p className="return-hint">
                        Lưu ý: BE yêu cầu Order Item ID và chỉ cho đổi trả khi đơn đã hoàn thành.
                    </p>
                    {returnRequests.length > 0 && (
                        <div className="return-hint">
                            Order Item đã có yêu cầu: {returnRequests.map(r => r.orderItemId).filter(Boolean).join(', ') || '—'}
                        </div>
                    )}
                    <div className="return-field">
                        <span>Mã đơn hàng</span>
                        <Input value={returnForm.orderId ?? ''} disabled />
                    </div>
                    <div className="return-field">
                        <span>Mã Order Item</span>
                        <InputNumber
                            min={1}
                            value={returnForm.orderItemId}
                            onChange={(val) => setReturnForm(prev => ({ ...prev, orderItemId: val }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="return-field">
                        <span>Số lượng</span>
                        <InputNumber
                            min={1}
                            value={returnForm.quantity}
                            onChange={(val) => setReturnForm(prev => ({ ...prev, quantity: val }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div className="return-field">
                        <span>Lý do</span>
                        <Select
                            value={returnForm.reason}
                            onChange={(val) => setReturnForm(prev => ({ ...prev, reason: val }))}
                            options={[
                                { label: 'Hàng lỗi', value: 'DEFECTIVE' },
                                { label: 'Giao sai sản phẩm', value: 'WRONG_ITEM' },
                                { label: 'Bị hư hỏng', value: 'DAMAGED' },
                                { label: 'Thiếu phụ kiện', value: 'MISSING_PART' },
                                { label: 'Khác', value: 'OTHER' }
                            ]}
                        />
                    </div>
                    <div className="return-field">
                        <span>Ghi chú</span>
                        <Input.TextArea
                            rows={3}
                            value={returnForm.note}
                            onChange={(e) => setReturnForm(prev => ({ ...prev, note: e.target.value }))}
                        />
                    </div>
                    <div className="return-field">
                        <span>Link minh chứng (url1,url2)</span>
                        <Input
                            value={returnForm.evidenceUrls}
                            onChange={(e) => setReturnForm(prev => ({ ...prev, evidenceUrls: e.target.value }))}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OrdersPage;

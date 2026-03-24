import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, Spin, Tag, message, Pagination, Select } from 'antd';
import { getCustomerPaymentsAPI } from '../../services/api.service';
import { normalizePaymentsResponse } from '../../utils/role-data';
import './orders.css';

const PAYMENT_STATUS_CONFIG = {
    PENDING: { label: 'Đang chờ thanh toán', color: 'gold' },
    SUCCESS: { label: 'Thanh toán thành công', color: 'green' },
    FAILED: { label: 'Thanh toán thất bại', color: 'red' },
    UNPAID: { label: 'Chưa thanh toán', color: 'orange' },
    CANCELLED: { label: 'Đã hủy', color: 'default' },
    REFUNDED: { label: 'Đã hoàn tiền', color: 'volcano' },
};

const PAYMENT_STAGE_CONFIG = {
    FULL: { label: 'Thanh toán toàn bộ', color: 'blue' },
    DEPOSIT: { label: 'Thanh toán cọc', color: 'purple' },
    REMAINING: { label: 'Thanh toán còn lại', color: 'cyan' },
};

const PAYMENT_METHOD_LABELS = {
    VNPAY: 'VNPay',
    COD: 'COD',
    BANKING: 'Chuyển khoản',
};

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN') : '';
const getPaymentTimestamp = (payment) => {
    const rawDate = payment?.paidAt || payment?.createAt;
    const time = rawDate ? new Date(rawDate).getTime() : 0;

    return Number.isNaN(time) ? 0 : time;
};

const getPaymentMethodLabel = (method) => PAYMENT_METHOD_LABELS[method] || method || 'Không rõ';

const getTimelineStepLabel = (payment) => {
    if (payment.stage === 'DEPOSIT') return 'Bước 1/2 của pre-order';
    if (payment.stage === 'REMAINING') return 'Bước 2/2 của pre-order';
    if (payment.stage === 'FULL') return 'Thanh toán một lần';
    return 'Giao dịch thanh toán';
};

const getPaymentNarrative = (payment) => {
    if (payment.stage === 'DEPOSIT') {
        if (payment.status === 'SUCCESS') return 'Khoản cọc pre-order đã được ghi nhận. Đơn sẽ chờ support xác nhận và chuyển sang bước thanh toán còn lại nếu vẫn còn số dư.';
        if (payment.status === 'PENDING') return 'Khoản cọc pre-order đang chờ cổng thanh toán xác nhận.';
        if (payment.status === 'FAILED') return 'Khoản cọc pre-order chưa hoàn tất. Nếu chưa có giao dịch thành công khác, đơn có thể không được giữ chỗ.';
        if (payment.status === 'CANCELLED') return 'Khoản cọc này đã bị hủy và không còn hiệu lực.';
    }

    if (payment.stage === 'REMAINING') {
        if (payment.status === 'SUCCESS') return 'Khoản thanh toán còn lại đã hoàn tất. Đơn pre-order có thể chuyển sang bước xử lý giao vận.';
        if (payment.status === 'PENDING') return 'Khoản thanh toán còn lại đang chờ xác nhận từ cổng thanh toán.';
        if (payment.status === 'FAILED') return 'Khoản thanh toán còn lại chưa thành công. Đơn vẫn chưa hoàn tất đủ tiền.';
        if (payment.status === 'CANCELLED') return 'Yêu cầu thanh toán còn lại này đã bị hủy.';
        if (payment.status === 'UNPAID') return 'Khoản thanh toán còn lại đã được tạo nhưng chưa được hoàn tất.';
    }

    if (payment.stage === 'FULL') {
        if (payment.status === 'SUCCESS') return 'Đơn đã được thanh toán đủ trong một lần.';
        if (payment.status === 'PENDING') return 'Giao dịch thanh toán toàn bộ đang chờ xác nhận.';
        if (payment.status === 'FAILED') return 'Giao dịch thanh toán toàn bộ chưa thành công.';
        if (payment.status === 'UNPAID') return 'Đơn đã tạo thanh toán nhưng chưa hoàn tất.';
    }

    return 'Theo dõi trạng thái giao dịch này để biết khi nào hệ thống ghi nhận thanh toán.';
};

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [dateSort, setDateSort] = useState('desc');
    const pageSize = 6;

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setLoading(true);
                const res = await getCustomerPaymentsAPI();
                setPayments(normalizePaymentsResponse(res));
            } catch {
                message.error('Không thể tải lịch sử thanh toán');
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [dateSort, payments.length]);

    if (loading) return <div className="orders-loading"><Spin size="large" /></div>;

    const sortedPayments = [...payments].sort((a, b) => {
        const timeA = getPaymentTimestamp(a);
        const timeB = getPaymentTimestamp(b);

        return dateSort === 'asc' ? timeA - timeB : timeB - timeA;
    });
    const successfulPayments = payments.filter((payment) => payment.status === 'SUCCESS').length;
    const pendingPayments = payments.filter((payment) => payment.status === 'PENDING').length;
    const total = sortedPayments.length;
    const pageItems = sortedPayments.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="orders-page">
            <div className="orders-inner">
                <div className="orders-toolbar">
                    <h1 className="orders-title">Lịch sử thanh toán</h1>
                    <div className="orders-toolbar-actions">
                        <span className="orders-toolbar-label">Sắp xếp theo ngày</span>
                        <Select
                            value={dateSort}
                            onChange={setDateSort}
                            options={[
                                { value: 'desc', label: 'Mới nhất' },
                                { value: 'asc', label: 'Cũ nhất' },
                            ]}
                            className="orders-sort-select"
                        />
                    </div>
                </div>
                <div className="orders-page-meta">
                    <span>Tổng {payments.length} giao dịch</span>
                    <strong>{successfulPayments} thành công, {pendingPayments} đang chờ</strong>
                </div>
                {payments.length === 0 ? (
                    <div className="orders-empty">
                        <Empty description={<span>Bạn chưa có giao dịch nào. <Link to="/customer/products">Mua sắm ngay!</Link></span>} />
                    </div>
                ) : (
                    <div className="orders-list">
                        {pageItems.map(payment => {
                            const statusCfg = PAYMENT_STATUS_CONFIG[payment.status] || { label: payment.status, color: 'default' };
                            const stageCfg = PAYMENT_STAGE_CONFIG[payment.stage] || { label: payment.stage, color: 'default' };
                            const timelineLabel = getTimelineStepLabel(payment);
                            const narrative = getPaymentNarrative(payment);

                            return (
                                <div key={payment.paymentId} className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <span className="order-id">{payment.orderCode || `GD #${payment.paymentId}`}</span>
                                            <span className="order-date">{formatDate(payment.paidAt || payment.createAt)}</span>
                                        </div>
                                        <div className="order-header-right">
                                            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                                            <span className="order-pay-method">{getPaymentMethodLabel(payment.method)}</span>
                                        </div>
                                    </div>

                                    <div className={`remaining-payment-banner ${payment.status === 'SUCCESS' ? 'done' : payment.status === 'PENDING' ? 'ready' : 'waiting'}`}>
                                        <div>
                                            <strong>{timelineLabel}</strong>
                                            <p>{narrative}</p>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        <div className="order-item">
                                            <span className="oi-name">Mã giao dịch</span>
                                            <span className="oi-price">{payment.transactionCode || `#${payment.paymentId}`}</span>
                                        </div>
                                        <div className="order-item">
                                            <span className="oi-name">Loại thanh toán</span>
                                            <span className="oi-price"><Tag color={stageCfg.color}>{stageCfg.label}</Tag></span>
                                        </div>
                                        <div className="order-item">
                                            <span className="oi-name">Tiến độ</span>
                                            <span className="oi-price">{timelineLabel}</span>
                                        </div>
                                        <div className="order-item">
                                            <span className="oi-name">Khởi tạo</span>
                                            <span className="oi-price">{formatDate(payment.createAt)}</span>
                                        </div>
                                        <div className="order-item">
                                            <span className="oi-name">Hoàn tất</span>
                                            <span className="oi-price">{formatDate(payment.paidAt) || 'Chưa hoàn tất'}</span>
                                        </div>
                                    </div>

                                    <div className="order-footer">
                                        <span className="order-total">Số tiền: <strong>{formatVND(payment.amount)}</strong></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {total > pageSize && (
                    <div className="support-pagination">
                        <Pagination
                            current={page}
                            pageSize={pageSize}
                            total={total}
                            onChange={(next) => setPage(next)}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;

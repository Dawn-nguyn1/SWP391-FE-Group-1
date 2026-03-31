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
    DEPOSIT: { label: 'Thanh toán giữ chỗ', color: 'purple' },
    REMAINING: { label: 'Thanh toán hoàn tất', color: 'cyan' },
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
    if (payment.stage === 'DEPOSIT') return 'Bước giữ chỗ';
    if (payment.stage === 'REMAINING') return 'Bước hoàn tất thanh toán';
    if (payment.stage === 'FULL') return 'Thanh toán một lần';
    return 'Giao dịch thanh toán';
};

const getPaymentNarrative = (payment) => {
    if (payment.stage === 'DEPOSIT') {
        if (payment.status === 'SUCCESS') return 'Khoản giữ chỗ đã được ghi nhận thành công. Đơn hàng của bạn đang tiếp tục được cập nhật.';
        if (payment.status === 'PENDING') return 'Khoản giữ chỗ đang chờ xác nhận từ cổng thanh toán.';
        if (payment.status === 'FAILED') return 'Khoản giữ chỗ chưa hoàn tất. Bạn có thể thử lại để đảm bảo đơn hàng được ghi nhận đúng cách.';
        if (payment.status === 'CANCELLED') return 'Khoản giữ chỗ này đã bị hủy và không còn hiệu lực.';
    }

    if (payment.stage === 'REMAINING') {
        if (payment.status === 'SUCCESS') return 'Khoản thanh toán hoàn tất đã được ghi nhận. Đơn hàng của bạn đang sẵn sàng cho chặng tiếp theo.';
        if (payment.status === 'PENDING') return 'Khoản thanh toán hoàn tất đang chờ xác nhận từ cổng thanh toán.';
        if (payment.status === 'FAILED') return 'Khoản thanh toán hoàn tất chưa thành công. Bạn có thể thử lại khi sẵn sàng.';
        if (payment.status === 'CANCELLED') return 'Yêu cầu thanh toán này đã bị hủy.';
        if (payment.status === 'UNPAID') return 'Khoản thanh toán này đã được tạo nhưng vẫn chưa hoàn tất.';
    }

    if (payment.stage === 'FULL') {
        if (payment.status === 'SUCCESS') return 'Đơn hàng đã được thanh toán đầy đủ trong một lần.';
        if (payment.status === 'PENDING') return 'Giao dịch đang chờ xác nhận.';
        if (payment.status === 'FAILED') return 'Giao dịch chưa thành công.';
        if (payment.status === 'UNPAID') return 'Đơn hàng đã tạo thanh toán nhưng chưa hoàn tất.';
    }

    return 'Theo dõi trạng thái giao dịch này để biết khi nào thanh toán được ghi nhận.';
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
                            style={{ width: 180 }}
                            onChange={setDateSort}
                            options={[
                                { value: 'desc', label: 'Mới nhất trước' },
                                { value: 'asc', label: 'Cũ nhất trước' },
                            ]}
                        />
                    </div>
                </div>

                <div className="orders-summary-cards">
                    <div className="orders-summary-card">
                        <span>Tổng giao dịch</span>
                        <strong>{payments.length}</strong>
                    </div>
                    <div className="orders-summary-card success">
                        <span>Thành công</span>
                        <strong>{successfulPayments}</strong>
                    </div>
                    <div className="orders-summary-card warning">
                        <span>Đang chờ xác nhận</span>
                        <strong>{pendingPayments}</strong>
                    </div>
                </div>

                {pageItems.length === 0 ? (
                    <Empty
                        description={
                            <span>
                                Bạn chưa có giao dịch nào. <Link to="/customer/products">Khám phá sản phẩm ngay</Link>
                            </span>
                        }
                        style={{ marginTop: 48 }}
                    />
                ) : (
                    <div className="orders-grid">
                        {pageItems.map((payment) => {
                            const statusMeta = PAYMENT_STATUS_CONFIG[payment.status] || { label: payment.status || '-', color: 'default' };
                            const stageMeta = PAYMENT_STAGE_CONFIG[payment.stage] || { label: payment.stage || 'Thanh toán', color: 'default' };
                            return (
                                <div key={payment.id || `${payment.orderCode}-${payment.createAt}`} className="order-card payment-card">
                                    <div className="order-card-head">
                                        <div>
                                            <h3>Mã đơn: {payment.orderCode || '-'}</h3>
                                            <p>{formatDate(payment.paidAt || payment.createAt)}</p>
                                        </div>
                                        <div className="order-card-tags">
                                            <Tag color={stageMeta.color}>{stageMeta.label}</Tag>
                                            <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                                        </div>
                                    </div>

                                    <div className="order-card-body">
                                        <div className="order-info-row">
                                            <span>Bước thanh toán</span>
                                            <strong>{getTimelineStepLabel(payment)}</strong>
                                        </div>
                                        <div className="order-info-row">
                                            <span>Phương thức</span>
                                            <strong>{getPaymentMethodLabel(payment.method)}</strong>
                                        </div>
                                        <div className="order-info-row">
                                            <span>Số tiền</span>
                                            <strong>{formatVND(payment.amount)}</strong>
                                        </div>
                                        <p className="payment-narrative">{getPaymentNarrative(payment)}</p>
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
                            onChange={setPage}
                            showSizeChanger={false}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;

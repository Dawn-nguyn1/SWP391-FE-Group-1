import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, Spin, Tag, message } from 'antd';
import { getCustomerPaymentsAPI } from '../../services/api.service';
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

const formatVND = n => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const formatDate = d => d ? new Date(d).toLocaleString('vi-VN') : '';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setLoading(true);
                const res = await getCustomerPaymentsAPI();
                setPayments(Array.isArray(res) ? res : res?.content || []);
            } catch {
                message.error('Không thể tải lịch sử thanh toán');
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, []);

    if (loading) return <div className="orders-loading"><Spin size="large" /></div>;

    return (
        <div className="orders-page">
            <div className="orders-inner">
                <h1 className="orders-title">Lịch sử thanh toán</h1>
                {payments.length === 0 ? (
                    <div className="orders-empty">
                        <Empty description={<span>Bạn chưa có giao dịch nào. <Link to="/customer/products">Mua sắm ngay!</Link></span>} />
                    </div>
                ) : (
                    <div className="orders-list">
                        {payments.map(payment => {
                            const statusCfg = PAYMENT_STATUS_CONFIG[payment.status] || { label: payment.status, color: 'default' };
                            const stageCfg = PAYMENT_STAGE_CONFIG[payment.stage] || { label: payment.stage, color: 'default' };

                            return (
                                <div key={payment.paymentId} className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <span className="order-id">{payment.orderCode || `GD #${payment.paymentId}`}</span>
                                            <span className="order-date">{formatDate(payment.paidAt || payment.createAt)}</span>
                                        </div>
                                        <div className="order-header-right">
                                            <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                                            <span className="order-pay-method">{payment.method || '-'}</span>
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
                                            <span className="oi-name">Khởi tạo</span>
                                            <span className="oi-price">{formatDate(payment.createAt)}</span>
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
            </div>
        </div>
    );
};

export default PaymentsPage;

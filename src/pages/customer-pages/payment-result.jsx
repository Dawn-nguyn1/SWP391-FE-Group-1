import React, { startTransition, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { vnpayReturnAPI } from '../../services/api.service';

const formatVND = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parsed);
};

const getResultCopy = ({ success, status, amount, transactionCode }) => {
    const amountText = formatVND(amount);

    if (success) {
        return {
            title: 'Thanh toán thành công',
            subtitle: [
                amountText ? `Hệ thống đã ghi nhận giao dịch ${amountText}.` : 'Hệ thống đã ghi nhận giao dịch của bạn.',
                transactionCode ? `Mã giao dịch: ${transactionCode}.` : null,
                'Nếu đây là khoản cọc pre-order, đơn sẽ chờ support xác nhận và mở bước thanh toán còn lại nếu vẫn còn số dư.',
                'Nếu đây là khoản thanh toán còn lại, đơn có thể tiếp tục sang bước xử lý giao vận.',
            ].filter(Boolean).join(' '),
        };
    }

    if (status === 'invalid') {
        return {
            title: 'Không xác minh được giao dịch',
            subtitle: 'Callback từ cổng thanh toán không hợp lệ hoặc đã bị thay đổi. Hãy kiểm tra lại lịch sử thanh toán trước khi thử lại.',
        };
    }

    if (status === 'failed') {
        return {
            title: 'Thanh toán thất bại',
            subtitle: 'Cổng thanh toán không xác nhận giao dịch. Đơn sẽ giữ nguyên trạng thái trước đó cho tới khi bạn tạo một giao dịch thành công.',
        };
    }

    return {
        title: 'Không thể hoàn tất thanh toán',
        subtitle: 'Hệ thống chưa đủ dữ liệu để xác nhận giao dịch này. Hãy kiểm tra lại lịch sử thanh toán hoặc thử lại sau.',
    };
};

const PaymentResultPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [success, setSuccess] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [resultStatus, setResultStatus] = React.useState('');
    const [transactionCode, setTransactionCode] = React.useState('');
    const [amount, setAmount] = React.useState('');

    const applyResultState = ({ success: nextSuccess, status, transactionCode: nextTransactionCode, amount: nextAmount, message: nextMessage, loading: nextLoading = false }) => {
        startTransition(() => {
            setSuccess(nextSuccess);
            setResultStatus(status);
            setTransactionCode(nextTransactionCode || '');
            setAmount(nextAmount || '');
            setMessage(nextMessage || '');
            setLoading(nextLoading);
        });
    };

    useEffect(() => {
        let rawSearch = window.location.search || '';
        const firstQ = rawSearch.indexOf('?');
        const secondQ = rawSearch.indexOf('?', firstQ + 1);
        if (secondQ !== -1) {
            rawSearch = rawSearch.slice(0, secondQ) + '&' + rawSearch.slice(secondQ + 1);
        }
        const normalizedSearchParams = new URLSearchParams(rawSearch);
        const params = Object.fromEntries(normalizedSearchParams.entries());
        const hasVnpayParams = Object.keys(params).some((key) => key.startsWith('vnp_'));

        if (!hasVnpayParams && params.status) {
            const isSuccess = String(params.status).toLowerCase() === 'success';
            applyResultState({
                success: isSuccess,
                status: String(params.status).toLowerCase(),
                transactionCode: params.transactionCode,
                amount: params.amount,
                message: params.message,
            });
            return;
        }

        if (!hasVnpayParams) {
            applyResultState({
                success: false,
                status: 'missing',
                message: 'Không tìm thấy thông tin thanh toán',
            });
            return;
        }

        vnpayReturnAPI(params)
            .then(() => {
                applyResultState({
                    success: true,
                    status: 'success',
                    message: 'Thanh toán thành công',
                });
            })
            .catch(() => {
                applyResultState({
                    success: false,
                    status: 'failed',
                    message: 'Có lỗi xảy ra khi xác nhận thanh toán',
                });
            })
            .finally(() => {
                startTransition(() => {
                    setLoading(false);
                });
            });
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;

    const resultCopy = getResultCopy({
        success,
        status: resultStatus,
        amount,
        transactionCode,
    });

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Result
                icon={success
                    ? <CheckCircleFilled style={{ color: '#22c55e', fontSize: 80 }} />
                    : <CloseCircleFilled style={{ color: '#ef4444', fontSize: 80 }} />
                }
                title={resultCopy.title}
                subTitle={message || resultCopy.subtitle}
                extra={[
                    <Button type="primary" key="orders" onClick={() => navigate('/customer/orders')}
                        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: 20, fontWeight: 700 }}>
                        Xem đơn hàng
                    </Button>,
                    <Button key="payments" onClick={() => navigate('/customer/payments')} style={{ borderRadius: 20 }}>
                        Xem lịch sử thanh toán
                    </Button>,
                    <Link key="home" to="/customer">
                        <Button style={{ borderRadius: 20 }}>Về trang chủ</Button>
                    </Link>,
                ]}
            />
        </div>
    );
};

export default PaymentResultPage;

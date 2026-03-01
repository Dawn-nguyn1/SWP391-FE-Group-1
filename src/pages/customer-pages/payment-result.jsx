import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { vnpayReturnAPI } from '../../services/api.service';

const PaymentResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [success, setSuccess] = React.useState(false);
    const [message, setMessage] = React.useState('');

    useEffect(() => {
        // Forward all query params to backend for VNPay verification
        const params = Object.fromEntries(searchParams.entries());
        vnpayReturnAPI(params)
            .then(res => {
                setSuccess(res?.success !== false);
                setMessage(res?.message || (res?.success !== false ? 'Thanh toán thành công!' : 'Thanh toán thất bại'));
            })
            .catch(() => {
                setSuccess(false);
                setMessage('Có lỗi xảy ra khi xác nhận thanh toán');
            })
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <Result
                icon={success
                    ? <CheckCircleFilled style={{ color: '#22c55e', fontSize: 80 }} />
                    : <CloseCircleFilled style={{ color: '#ef4444', fontSize: 80 }} />
                }
                title={success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                subTitle={message}
                extra={[
                    <Button type="primary" key="orders" onClick={() => navigate('/customer/orders')}
                        style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: 20, fontWeight: 700 }}>
                        Xem đơn hàng
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

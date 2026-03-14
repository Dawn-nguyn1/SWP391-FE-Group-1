import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, InputNumber, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getPublicComboDetailAPI } from '../../services/api.service';
import './combo-detail.css';

const ComboDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [combo, setCombo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        let cancelled = false;
        const fetchDetail = async () => {
            try {
                const res = await getPublicComboDetailAPI(id);
                if (cancelled) return;
                const data = res?.data || res;
                setCombo(data);
            } catch {
                if (!cancelled) setCombo(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        setLoading(true);
        fetchDetail();
        return () => { cancelled = true; };
    }, [id]);

    const formatVND = (n) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

    const totalItems = useMemo(() => {
        if (!combo?.items) return 0;
        return combo.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }, [combo]);

    if (loading) {
        return <div className="combo-detail-loading"><Spin size="large" /></div>;
    }

    if (!combo) {
        return (
            <div className="combo-detail-empty">
                <Empty description="Không tìm thấy combo" />
                <Button type="primary" onClick={() => navigate('/customer/combos')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="combo-detail-page">
            <div className="combo-detail-header">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customer/combos')}>
                    Danh sách combo
                </Button>
            </div>

            <div className="combo-detail-hero">
                <div className="combo-detail-image">
                    {combo.imageUrl ? (
                        <img src={combo.imageUrl} alt={combo.name} />
                    ) : (
                        <div className="combo-image-placeholder">COMBO</div>
                    )}
                </div>
                <div className="combo-detail-info">
                    <span className="combo-tag">Combo ưu đãi</span>
                    <h1>{combo.name}</h1>
                    <p className="combo-detail-desc">{combo.description || 'Bộ sản phẩm được chọn lọc tối ưu chi phí.'}</p>
                    <div className="combo-detail-price">
                        <span>Giá combo</span>
                        <strong>{formatVND(combo.comboPrice)}</strong>
                    </div>
                    <div className="combo-detail-meta">
                        <span>{totalItems} sản phẩm</span>
                        <span>{combo.items?.length || 0} loại item</span>
                    </div>
                    <div className="combo-detail-actions">
                        <div className="combo-qty">
                            <span>Số lượng</span>
                            <InputNumber min={1} value={quantity} onChange={(v) => setQuantity(v || 1)} disabled />
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            disabled
                            onClick={() => message.info('Combo hiện chỉ hỗ trợ xem thông tin. Tính năng mua combo sẽ mở lại khi backend hỗ trợ đúng nghiệp vụ.')}
                        >
                            Tạm dừng mua combo
                        </Button>
                    </div>
                    <p className="combo-detail-note">
                        Giá combo đang được hiển thị để tham khảo. Hiện chưa cho phép mua trực tiếp để tránh sai lệch giá khi thanh toán.
                    </p>
                </div>
            </div>

            <div className="combo-detail-items">
                <h2>Danh sách sản phẩm trong combo</h2>
                <div className="combo-item-grid">
                    {combo.items?.map((item) => {
                        const attr = item.attributes?.[0];
                        const image = attr?.images?.[0]?.imageUrl;
                        return (
                            <div key={item.id} className="combo-item-card">
                                <div className="combo-item-image">
                                    {image ? <img src={image} alt={attr?.attributeValue || 'Item'} /> : <span>ITEM</span>}
                                </div>
                                <div className="combo-item-info">
                                    <div className="combo-item-name">
                                        {attr?.attributeValue || `Variant #${item.productVariantId}`}
                                    </div>
                                    <div className="combo-item-attr">
                                        {attr?.attributeName || 'Biến thể'}
                                    </div>
                                    <div className="combo-item-qty">Số lượng: {item.quantity}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ComboDetailPage;

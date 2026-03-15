import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, InputNumber, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { addComboToCartAPI, getPublicComboDetailAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { AuthContext } from '../../context/auth.context';
import './combo-detail.css';

const getComboItemPrimaryAttribute = (item) => item?.attributes?.[0] || null;
const getComboItemImage = (item) =>
    item?.attributes?.flatMap((attribute) => attribute?.images || [])
        ?.find((image) => image?.imageUrl)?.imageUrl || null;
const getComboDisplayImage = (combo) =>
    combo?.imageUrl || combo?.items?.map(getComboItemImage).find(Boolean) || null;
const getComboItemLabel = (item) => {
    const primaryAttribute = getComboItemPrimaryAttribute(item);
    return primaryAttribute?.attributeValue || `Variant #${item?.productVariantId}`;
};
const getComboItemMeta = (item) => {
    const attributes = Array.isArray(item?.attributes) ? item.attributes : [];
    if (attributes.length === 0) return 'Bien the mac dinh';
    return attributes.map((attribute) => `${attribute.attributeName}: ${attribute.attributeValue}`).join(' • ');
};

const ComboDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);
    const [combo, setCombo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

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

    const comboImage = useMemo(() => getComboDisplayImage(combo), [combo]);

    const handleAddComboToCart = async () => {
        if (!user?.id) {
            message.warning('Vui lòng đăng nhập để thêm combo vào giỏ hàng');
            navigate('/login');
            return;
        }

        if (!combo?.id) return;

        setAdding(true);
        try {
            await addComboToCartAPI(combo.id, quantity);
            await fetchCart();
            message.success('Đã thêm combo vào giỏ hàng');
        } catch (e) {
            message.error(e?.message || 'Không thể thêm combo vào giỏ hàng');
        } finally {
            setAdding(false);
        }
    };

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
                    {comboImage ? (
                        <img src={comboImage} alt={combo.name} />
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
                        <span>{combo.active ? 'Dang hoat dong' : 'Tam khoa'}</span>
                    </div>
                    <div className="combo-detail-actions">
                        <div className="combo-qty">
                            <span>Số lượng</span>
                            <InputNumber min={1} value={quantity} onChange={(v) => setQuantity(v || 1)} />
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            loading={adding}
                            onClick={handleAddComboToCart}
                            disabled={!combo.active}
                        >
                            {combo.active ? 'Them combo vao gio' : 'Combo tam khoa'}
                        </Button>
                    </div>
                    <div className="combo-detail-includes">
                        <span>Combo bao gom</span>
                        <div className="combo-detail-chips">
                            {combo.items?.map((item) => (
                                <span key={item.id} className="combo-detail-chip">
                                    {getComboItemLabel(item)} x{item.quantity}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="combo-detail-items">
                <h2>Danh sách sản phẩm trong combo</h2>
                <div className="combo-item-grid">
                    {combo.items?.map((item) => {
                        const image = getComboItemImage(item);
                        return (
                            <div key={item.id} className="combo-item-card">
                                <div className="combo-item-image">
                                    {image ? <img src={image} alt={getComboItemLabel(item)} /> : <span>ITEM</span>}
                                </div>
                                <div className="combo-item-info">
                                    <div className="combo-item-name">
                                        {getComboItemLabel(item)}
                                    </div>
                                    <div className="combo-item-attr">{getComboItemMeta(item)}</div>
                                    <div className="combo-item-qty">Số lượng: {item.quantity}</div>
                                    <div className="combo-item-code">Variant ID: {item.productVariantId}</div>
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

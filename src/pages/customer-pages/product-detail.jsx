import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, InputNumber, Button, Tag } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getPublicProductDetailAPI, addToCartAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { AuthContext } from '../../context/auth.context';
import './product-detail.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { fetchCart } = useContext(CartContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        getPublicProductDetailAPI(id)
            .then(r => { setProduct(r); if (r?.variants?.[0]) { setSelectedVariant(r.variants[0]); setSelectedAttribute(r.variants[0]?.attributes?.[0] || null); } })
            .catch(() => message.error('Không tìm thấy sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        if (!user?.id) { message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng'); navigate('/login'); return; }
        if (!selectedVariant?.id) { message.warning('Vui lòng chọn phiên bản sản phẩm'); return; }
        setAdding(true);
        try {
            await addToCartAPI(selectedVariant.id, quantity);
            await fetchCart();
            message.success('Đã thêm vào giỏ hàng!');
        } catch (e) {
            message.error(e?.response?.data?.message || 'Không thể thêm vào giỏ hàng');
        } finally { setAdding(false); }
    };

    if (loading) return <div className="detail-loading"><Spin size="large" /></div>;
    if (!product) return <div className="detail-empty">Không tìm thấy sản phẩm.</div>;

    const images = selectedAttribute?.images?.length
        ? selectedAttribute.images
        : selectedVariant?.attributes?.[0]?.images?.length
            ? selectedVariant.attributes[0].images
            : product.productImage
                ? [product.productImage]
                : [];

    const currentPrice = selectedAttribute?.price || selectedVariant?.price || product.price;
    const inStock = (selectedAttribute?.stockQuantity ?? selectedVariant?.stockQuantity ?? 0) > 0;
    const saleType = selectedAttribute?.saleType || selectedVariant?.saleType || 'IN_STOCK';
    const availabilityStatus = selectedAttribute?.availabilityStatus || selectedVariant?.availabilityStatus || 'IN_STOCK';
    const allowPreorder = selectedAttribute?.allowPreorder || selectedVariant?.allowPreorder || false;
    const preorderLimit = selectedAttribute?.preorderLimit || selectedVariant?.preorderLimit || 0;
    const currentPreorders = selectedAttribute?.currentPreorders || selectedVariant?.currentPreorders || 0;
    const preorderStartDate = selectedAttribute?.preorderStartDate || selectedVariant?.preorderStartDate;
    const preorderEndDate = selectedAttribute?.preorderEndDate || selectedVariant?.preorderEndDate;
    const preorderFulfillmentDate = selectedAttribute?.preorderFulfillmentDate || selectedVariant?.preorderFulfillmentDate;
    const formatVND = n => n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : 'Liên hệ';

    return (
        <div className="product-detail-page">
            <div className="detail-inner">
                <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeftOutlined /> Quay lại</button>

                <div className="detail-grid">
                    {/* Images */}
                    <div className="detail-images">
                        <div className="main-img-wrap">
                            {images[activeImg] ? (
                                <img src={images[activeImg].imageUrl || images[activeImg]} alt={product.name} className="main-img" />
                            ) : (
                                <div className="main-img-placeholder">👓</div>
                            )}
                            {inStock
                                ? <span className="stock-badge in">✓ Còn hàng</span>
                                : allowPreorder && saleType === 'PRE_ORDER'
                                    ? <span className="stock-badge preorder">📦 Đặt trước</span>
                                    : <span className="stock-badge out">Hết hàng</span>
                            }
                        </div>
                        {images.length > 1 && (
                            <div className="thumb-list">
                                {images.map((img, i) => (
                                    <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                                        <img src={img.imageUrl || img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="detail-info">
                        <p className="detail-brand">{product.brandName}</p>
                        <h1 className="detail-title">{product.name}</h1>
                        <div className="detail-price">{formatVND(currentPrice)}</div>

                        {/* Variant Select */}
                        {product.variants?.length > 0 && (
                            <div className="select-group">
                                <label>Màu sắc / Kiểu dáng</label>
                                <div className="variant-chips">
                                    {product.variants.map(v => (
                                        <button
                                            key={v.id}
                                            className={`chip ${selectedVariant?.id === v.id ? 'active' : ''}`}
                                            onClick={() => { setSelectedVariant(v); setSelectedAttribute(v.attributes?.[0] || null); setActiveImg(0); }}
                                        >
                                            {v.attributes?.length > 0 
                                                ? v.attributes.map(a => a.attributeValue).join(' / ')
                                                : `Variant ${v.id}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attribute Select (size/combo) */}
                        {selectedVariant?.attributes?.length > 0 && (
                            <div className="select-group">
                                <label>Kích cỡ / Phiên bản</label>
                                <div className="variant-chips">
                                    {selectedVariant.attributes.map(a => (
                                        <button
                                            key={a.id}
                                            className={`chip ${selectedAttribute?.id === a.id ? 'active' : ''}`}
                                            onClick={() => setSelectedAttribute(a)}
                                        >
                                            {a.attributeValue || `Option ${a.id}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity */}
                        <div className="select-group">
                            <label>Số lượng</label>
                            <InputNumber min={1} max={selectedAttribute?.stockQuantity || selectedVariant?.stockQuantity || 10} value={quantity} onChange={setQuantity} size="large" style={{ width: 100 }} />
                        </div>

                        {/* Add to Cart */}
                        <Button
                            type="primary"
                            size="large"
                            icon={inStock ? <ShoppingCartOutlined /> : null}
                            disabled={!inStock}
                            loading={adding}
                            onClick={handleAddToCart}
                            className="add-cart-btn"
                        >
                            {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                        </Button>

                        {/* Description */}
                        {product.description && (
                            <div className="detail-desc">
                                <h4>Mô tả sản phẩm</h4>
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Preorder Information */}
                        {allowPreorder && saleType === 'PRE_ORDER' && (
                            <div className="detail-preorder">
                                <h4>📦 Thông tin đặt trước</h4>
                                <div className="preorder-info">
                                    <div className="preorder-item">
                                        <span className="preorder-label">Thời gian đặt trước:</span>
                                        <span className="preorder-value">
                                            {preorderStartDate && preorderEndDate 
                                                ? `${preorderStartDate} - ${preorderEndDate}`
                                                : 'Liên hệ'}
                                        </span>
                                    </div>
                                    <div className="preorder-item">
                                        <span className="preorder-label">Ngày giao hàng dự kiến:</span>
                                        <span className="preorder-value">{preorderFulfillmentDate || 'Liên hệ'}</span>
                                    </div>
                                    <div className="preorder-item">
                                        <span className="preorder-label">giới hạn đặt trước:</span>
                                        <span className="preorder-value">{currentPreorders}/{'2'}</span>
                                    </div>
                                    <div className="preorder-item">
                                        <span className="preorder-label">Trạng thái:</span>
                                        <Tag color="orange">{availabilityStatus}</Tag>
                                    </div>
                                </div>
                                <div className="preorder-note">
                                    <small>⚠️ Sản phẩm này đang trong giai đoạn đặt trước. Sẽ được giao sau ngày {preorderFulfillmentDate || 'liên hệ'}.</small>
                                </div>
                            </div>
                        )}

                        {/* Meta */}
                        <div className="detail-meta">
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Giao hàng toàn quốc qua GHN</div>
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Đổi trả trong 30 ngày</div>
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Thanh toán an toàn qua VNPay / COD</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin, message, InputNumber, Button } from 'antd';
import { ShoppingCartOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getPublicProductDetailAPI, addToCartAPI } from '../../services/api.service';
import { CartContext } from '../../context/cart.context';
import { AuthContext } from '../../context/auth.context';
import './product-detail.css';

const formatVND = (n) => n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n) : 'Liên hệ';
const getMinDeposit = (amount) => Math.ceil((Number(amount) || 0) * 0.3);
const getApiErrorMessage = (error, fallback) => error?.message || error?.response?.data?.message || fallback;

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
            .then((r) => {
                setProduct(r);
                if (r?.variants?.[0]) {
                    setSelectedVariant(r.variants[0]);
                    setSelectedAttribute(r.variants[0]?.attributes?.[0] || null);
                }
            })
            .catch(() => message.error('Không tìm thấy sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    const saleType = String(selectedVariant?.saleType ?? '').toUpperCase();
    const stockQuantity = selectedAttribute?.stockQuantity ?? selectedVariant?.stockQuantity ?? 0;
    const isPreOrder = saleType === 'PRE_ORDER';
    const inStock = stockQuantity > 0;
    const canPurchase = isPreOrder || inStock;
    const currentPrice = selectedAttribute?.price || selectedVariant?.price || product?.price;
    const estimatedDeposit = getMinDeposit(currentPrice);
    const remainingAmount = Math.max((Number(currentPrice) || 0) - estimatedDeposit, 0);
    const maxQuantity = isPreOrder ? 10 : Math.max(stockQuantity || 1, 1);

    const handleAddToCart = async () => {
        if (!user?.id) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login');
            return;
        }
        if (!selectedVariant?.id) {
            message.warning('Vui lòng chọn phiên bản sản phẩm');
            return;
        }

        setAdding(true);
        try {
            await addToCartAPI(selectedVariant.id, quantity);
            await fetchCart();
            message.success(isPreOrder ? 'Đã thêm sản phẩm đặt trước vào giỏ hàng' : 'Đã thêm vào giỏ hàng!');
            if (isPreOrder) {
                navigate('/customer/cart');
            }
        } catch (e) {
            message.error(getApiErrorMessage(e, 'Không thể thêm vào giỏ hàng'));
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="detail-loading"><Spin size="large" /></div>;
    if (!product) return <div className="detail-empty">Không tìm thấy sản phẩm.</div>;

    const images = selectedAttribute?.images?.length
        ? selectedAttribute.images
        : selectedVariant?.images?.length
            ? selectedVariant.images
            : product.productImage
                ? [product.productImage]
                : [];

    const stockBadge = isPreOrder
        ? { label: 'Đặt trước', className: 'preorder' }
        : (inStock ? { label: 'Còn hàng', className: 'in' } : { label: 'Hết hàng', className: 'out' });

    return (
        <div className="product-detail-page">
            <div className="detail-inner">
                <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeftOutlined /> Quay lại</button>

                <div className="detail-grid">
                    <div className="detail-images">
                        <div className="main-img-wrap">
                            {images[activeImg] ? (
                                <img src={images[activeImg].url || images[activeImg]} alt={product.name} className="main-img" />
                            ) : (
                                <div className="main-img-placeholder">👓</div>
                            )}
                            <span className={`stock-badge ${stockBadge.className}`}>{stockBadge.label}</span>
                        </div>
                        {images.length > 1 && (
                            <div className="thumb-list">
                                {images.map((img, i) => (
                                    <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                                        <img src={img.url || img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="detail-info">
                        <p className="detail-brand">{product.brandName}</p>
                        <h1 className="detail-title">{product.name}</h1>
                        <div className="detail-price">{formatVND(currentPrice)}</div>
                        <div className="detail-status-row">
                            <span className={`detail-sale-pill ${isPreOrder ? 'detail-sale-pill-preorder' : 'detail-sale-pill-stock'}`}>
                                {isPreOrder ? 'PRE-ORDER' : 'IN-STOCK'}
                            </span>
                            <span className="detail-status-copy">
                                {isPreOrder ? 'Sản phẩm đang nhận đặt cọc và sẽ giao sau khi hàng về.' : `Còn ${stockQuantity} sản phẩm có thể giao ngay.`}
                            </span>
                        </div>

                        {isPreOrder && (
                            <div className="preorder-card">
                                <div className="preorder-card-row">
                                    <span>Thanh toán hôm nay</span>
                                    <strong>{formatVND(estimatedDeposit)}</strong>
                                </div>
                                <div className="preorder-card-row">
                                    <span>Thanh toán khi hàng về</span>
                                    <strong>{formatVND(remainingAmount)}</strong>
                                </div>
                                <p className="preorder-card-note">
                                    Bạn cần cọc trước 30% giá trị đơn.
                                </p>
                            </div>
                        )}

                        {product.variants?.length > 0 && (
                            <div className="select-group">
                                <label>Màu sắc / Kiểu dáng</label>
                                <div className="variant-chips">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            className={`chip ${selectedVariant?.id === v.id ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                setSelectedAttribute(v.attributes?.[0] || null);
                                                setActiveImg(0);
                                            }}
                                        >
                                            {v.attributes?.length > 0
                                                ? v.attributes.map((a) => a.attributeValue).join(' / ')
                                                : `Variant ${v.id}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedVariant?.attributes?.length > 0 && (
                            <div className="select-group">
                                <label>Kích cỡ / Phiên bản</label>
                                <div className="variant-chips">
                                    {selectedVariant.attributes.map((a) => (
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

                        <div className="select-group">
                            <label>Số lượng</label>
                            <InputNumber min={1} max={maxQuantity} value={quantity} onChange={setQuantity} size="large" style={{ width: 100 }} />
                        </div>

                        <Button
                            type="primary"
                            size="large"
                            icon={canPurchase ? <ShoppingCartOutlined /> : null}
                            disabled={!canPurchase}
                            loading={adding}
                            onClick={handleAddToCart}
                            className={`add-cart-btn ${isPreOrder ? 'add-cart-btn-preorder' : ''}`}
                        >
                            {isPreOrder ? 'Đặt cọc ngay' : (inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng')}
                        </Button>

                        {isPreOrder && (
                            <div className="detail-policy">
                                <h4>Chính sách pre-order</h4>
                                <ul>
                                    <li>Tiền cọc sẽ được thanh toán online qua VNPay tại bước checkout.</li>
                                    <li>Phần còn lại sẽ mở thanh toán khi hệ thống xác nhận hàng đã về.</li>
                                    <li>Không nên trộn sản phẩm pre-order với hàng có sẵn trong cùng một đơn.</li>
                                </ul>
                            </div>
                        )}

                        {product.description && (
                            <div className="detail-desc">
                                <h4>Mô tả sản phẩm</h4>
                                <p>{product.description}</p>
                            </div>
                        )}

                        <div className="detail-meta">
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> {isPreOrder ? 'Thông báo ngay khi hàng về để thanh toán phần còn lại' : 'Giao hàng toàn quốc qua GHN'}</div>
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> Đổi trả trong 30 ngày</div>
                            <div className="meta-item"><CheckCircleOutlined style={{ color: '#22c55e' }} /> {isPreOrder ? 'Thanh toán cọc an toàn qua VNPay' : 'Thanh toán an toàn qua VNPay / COD'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

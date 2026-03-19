import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Slider, Checkbox, Pagination, Spin, Empty } from 'antd';
import { FilterOutlined, ThunderboltOutlined, RocketOutlined, AppstoreOutlined, TagOutlined } from '@ant-design/icons';
import { searchProductsAPI, getBrandsAPI, getPublicProductDetailAPI } from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import './product-list.css';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('vi-VN').format(date);
};

const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const keyword = searchParams.get('keyword') || '';
    const brand = searchParams.get('brand') || '';
    const inStock = searchParams.get('inStock') === 'true';
    const view = searchParams.get('view') || 'all';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = view === 'all' ? 18 : 12;

    const [priceRange, setPriceRange] = useState([0, 10000000]);

    useEffect(() => {
        getBrandsAPI().then((response) => setBrands(Array.isArray(response) ? response : []));
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchProducts = async () => {
            const params = {
                keyword: keyword || undefined,
                brand: brand || undefined,
                inStock: inStock || undefined,
                minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
                page,
                size,
            };

            try {
                const response = await searchProductsAPI(params);
                if (cancelled) return;

                const rawProducts = response?.content || (Array.isArray(response) ? response : []);
                const enriched = await enrichPublicProducts(rawProducts, getPublicProductDetailAPI);
                if (cancelled) return;

                setProducts(enriched);
                setTotal(response?.totalElements || enriched.length);
            } catch {
                if (!cancelled) {
                    setProducts([]);
                    setTotal(0);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        setLoading(true);
        fetchProducts();
        return () => { cancelled = true; };
    }, [keyword, brand, inStock, page, priceRange]);

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== 'all') params.set(key, value);
        else params.delete(key);
        params.delete('page');
        setSearchParams(params);
    };

    const formatPrice = (product) => {
        if (product.priceLabel?.type === 'range') {
            return `${formatVND(product.priceLabel.minPrice)} - ${formatVND(product.priceLabel.maxPrice)}`;
        }
        if (product.priceLabel?.minPrice) return formatVND(product.priceLabel.minPrice);
        return 'Liên hệ';
    };

    const groups = {
        preorder: products.filter((product) => product.productMode === 'PRE_ORDER'),
        mixed: products.filter((product) => product.productMode === 'MIXED'),
        ready: products.filter((product) => product.productMode === 'IN_STOCK'),
    };

    const viewConfig = {
        all: { label: 'Tất cả', icon: <AppstoreOutlined /> },
        ready: { label: 'In-stock', icon: <RocketOutlined /> },
        'pre-order': { label: 'Pre-order', icon: <ThunderboltOutlined /> },
        mixed: { label: 'Mixed', icon: <TagOutlined /> },
    };

    const filteredProducts = (() => {
        if (view === 'pre-order') return groups.preorder;
        if (view === 'ready') return groups.ready;
        if (view === 'mixed') return groups.mixed;
        return products;
    })();

    const listStats = {
        total: products.length,
        preorder: groups.preorder.length,
        mixed: groups.mixed.length,
        ready: groups.ready.length,
    };

    const getModeBadge = (product) => {
        if (product.productMode === 'PRE_ORDER') {
            const fulfillmentDate = product?.variants?.find((variant) => variant?.saleType === 'PRE_ORDER')?.preorderFulfillmentDate;
            return {
                className: 'badge-preorder',
                label: 'Đặt trước',
                sublabel: fulfillmentDate
                    ? `Dự kiến có hàng từ ${formatDate(fulfillmentDate)}`
                    : 'Đi theo luồng cọc và chờ hàng về.',
            };
        }

        if (product.productMode === 'MIXED') {
            return {
                className: 'badge-mixed',
                label: 'Hai hình thức',
                sublabel: 'Có cả biến thể hàng sẵn và biến thể đặt trước trong cùng một mẫu.',
            };
        }

        return {
            className: 'badge-ready',
                label: 'Hàng sẵn',
                sublabel: `Chỉ còn lại ${product.totalStock ?? 0} sản phẩm.`,
        };
    };

    const renderProductCard = (product) => {
        const modeBadge = getModeBadge(product);

        return (
            <Link key={product.id} to={`/customer/products/${product.id}`} className={`product-card mode-${product.productMode?.toLowerCase() || 'unknown'}`}>
                <div className="product-img-wrap">
                    {product.productImage ? (
                        <img src={product.productImage} alt={product.name} className="product-img" />
                    ) : (
                        <div className="product-img-placeholder">👓</div>
                    )}
                    <span className={`mode-badge ${modeBadge.className}`}>{modeBadge.label}</span>
                </div>
                <div className="product-info">
                    <p className="product-brand">{product.brandName || '—'}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-mode-copy">{modeBadge.sublabel}</p>
                    <p className="product-price">{formatPrice(product)}</p>
                </div>
            </Link>
        );
    };

    const renderSection = (sectionKey, title, description, items, emptyIcon, emptyCopy, limit = null) => {
        const sectionItems = limit ? items.slice(0, limit) : items;

        return (
        <section className={`catalog-section catalog-section-${sectionKey}`}>
            <div className="catalog-section-head">
                <div>
                    <span className={`catalog-kicker ${sectionKey}`}>{title}</span>
                    <h2>{title === 'Hai hình thức' ? 'Mẫu có cả biến thể hàng sẵn và đặt trước' : title === 'Đặt trước' ? 'Mẫu chỉ bán theo luồng pre-order' : 'Mẫu đang có hàng sẵn để chốt đơn nhanh'}</h2>
                    <p>{description}</p>
                </div>
                <span className="catalog-section-count">{sectionItems.length} mẫu</span>
            </div>
            {sectionItems.length > 0 ? (
                <div className="products-grid">
                    {sectionItems.map(renderProductCard)}
                </div>
            ) : (
                <div className="catalog-empty-state">
                    <span>{emptyIcon}</span>
                    <p>{emptyCopy}</p>
                </div>
            )}
        </section>
        );
    };

    return (
        <div className="product-list-page">
            <div className="catalog-hero">
                <div className="catalog-hero-inner">
                    <div className="catalog-hero-copy">
                        <span className="catalog-pill">{viewConfig[view]?.icon || <AppstoreOutlined />} Danh mục sản phẩm</span>
                        <h1>Phân biệt rõ Pre-order và In-stock ngay từ lúc duyệt catalog</h1>
                        <p>
                            Mỗi sản phẩm được gắn đúng luồng bán. Khi để chế độ xem tất cả, danh mục sẽ tách riêng hàng đặt trước,
                            hàng sẵn và nhóm sản phẩm có hai hình thức mua.
                        </p>
                    </div>
                    <div className="catalog-stats">
                        <div className="catalog-stat-card">
                            <span>Tổng mẫu đang hiển thị</span>
                            <strong>{filteredProducts.length}</strong>
                        </div>
                        <div className="catalog-stat-card preorder">
                            <span>Pre-order</span>
                            <strong>{listStats.preorder}</strong>
                        </div>
                        <div className="catalog-stat-card ready">
                            <span>In-stock</span>
                            <strong>{listStats.ready}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="list-body">
                <aside className="filter-sidebar">
                    <div className="filter-intro">
                        <strong>LỌC THEO:</strong>
                    </div>

                    <div className="filter-section">
                        <h4><FilterOutlined /> Lọc giá</h4>
                        <Slider
                            range
                            min={0}
                            max={10000000}
                            step={100000}
                            value={priceRange}
                            onChange={setPriceRange}
                            tipFormatter={(value) => formatVND(value)}
                        />
                        <div className="price-range-labels">
                            <span>{formatVND(priceRange[0])}</span>
                            <span>{formatVND(priceRange[1])}</span>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Thương hiệu</h4>
                        <div className="brand-list">
                            {brands.map((item) => (
                                <div
                                    key={item}
                                    className={`brand-item ${brand === item ? 'active' : ''}`}
                                    onClick={() => updateParam('brand', brand === item ? '' : item)}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="filter-section">
                        <h4>Tồn kho</h4>
                        <Checkbox checked={inStock} onChange={(event) => updateParam('inStock', event.target.checked ? 'true' : '')}>
                            Chỉ xem sản phẩm còn hàng sẵn
                        </Checkbox>
                    </div>

                    <div className="filter-section">
                        <h4>Kiểu bán</h4>
                        <div className="view-switch">
                            <button type="button" className={view === 'all' ? 'active all' : ''} onClick={() => updateParam('view', 'all')}>
                                <AppstoreOutlined /> Tất cả
                            </button>
                            <button type="button" className={view === 'ready' ? 'active ready' : ''} onClick={() => updateParam('view', 'ready')}>
                                <RocketOutlined /> In-stock
                            </button>
                            <button type="button" className={view === 'pre-order' ? 'active preorder' : ''} onClick={() => updateParam('view', 'pre-order')}>
                                <ThunderboltOutlined /> Pre-order
                            </button>
                            <button type="button" className={view === 'mixed' ? 'active mixed' : ''} onClick={() => updateParam('view', 'mixed')}>
                                <TagOutlined /> Mixed
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="grid-area">
                    <div className="list-summary">
                        <div className="summary-chip active-view">
                            <span className="summary-label">Chế độ xem</span>
                            <strong>{viewConfig[view]?.label || 'Tất cả'}</strong>
                        </div>
                        <div className="summary-chip">
                            <span className="summary-label">Pre-order</span>
                            <strong>{listStats.preorder}</strong>
                        </div>
                        <div className="summary-chip">
                            <span className="summary-label">In-stock</span>
                            <strong>{listStats.ready}</strong>
                        </div>
                        <span className="result-count">{total} sản phẩm</span>
                    </div>

                    {groups.mixed.length > 0 && view !== 'mixed' && (
                        <div className="mixed-notice">
                            <div>
                                <span className="mixed-notice-label">Sản phẩm có hai hình thức</span>
                                <strong>{groups.mixed.length} mẫu đang mở đồng thời pre-order và in-stock</strong>
                                <p>Danh mục chính vẫn ưu tiên hai nhóm riêng để dễ chọn. Bạn có thể mở nhóm này riêng khi cần.</p>
                            </div>
                            <button type="button" onClick={() => updateParam('view', 'mixed')}>
                                Xem nhóm mixed
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid-loading"><Spin size="large" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <Empty description="Không tìm thấy sản phẩm phù hợp" style={{ marginTop: 60 }} />
                    ) : (
                        <>
                            {view === 'all' ? (
                                <div className="catalog-sections">
                                    {renderSection(
                                        'preorder',
                                        'Đặt trước',
                                        'Nhóm này chỉ gồm các sản phẩm đi theo luồng cọc và chờ hàng về.',
                                        groups.preorder,
                                        '⌛',
                                        'Chưa có mẫu chỉ bán pre-order trong bộ lọc hiện tại.'
                                    )}
                                    {renderSection(
                                        'ready',
                                        'Hàng sẵn',
                                        'Nhóm này tập trung vào các sản phẩm đang có tồn kho thực tế để xử lý đơn nhanh.',
                                        groups.ready,
                                        '🕶️',
                                        'Chưa có mẫu hàng sẵn trong bộ lọc hiện tại.',
                                        6
                                    )}
                                </div>
                            ) : (
                                <div className="products-grid">
                                    {filteredProducts.map(renderProductCard)}
                                </div>
                            )}

                            {total > size && (
                                <div className="pagination-wrap">
                                    <Pagination
                                        current={page + 1}
                                        pageSize={size}
                                        total={total}
                                        onChange={(nextPage) => {
                                            const params = new URLSearchParams(searchParams);
                                            params.set('page', nextPage - 1);
                                            setSearchParams(params);
                                        }}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;

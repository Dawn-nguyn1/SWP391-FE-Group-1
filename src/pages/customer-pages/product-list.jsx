import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Slider, Checkbox, Pagination, Spin, Empty } from 'antd';
import { FilterOutlined, RocketOutlined, AppstoreOutlined, TagOutlined, ThunderboltOutlined } from '@ant-design/icons';
import {
    getBrandsAPI,
    getPublicCampaignsAPI,
    getPublicProductDetailAPI,
    searchProductsAPI,
} from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import './product-list.css';

const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [campaignCount, setCampaignCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const keyword = searchParams.get('keyword') || '';
    const brand = searchParams.get('brand') || '';
    const inStock = searchParams.get('inStock') === 'true';
    const view = searchParams.get('view') || 'all';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const size = 18;

    const [priceRange, setPriceRange] = useState([0, 10000000]);

    useEffect(() => {
        Promise.all([getBrandsAPI(), getPublicCampaignsAPI()])
            .then(([brandResponse, campaignResponse]) => {
                setBrands(Array.isArray(brandResponse) ? brandResponse : []);
                setCampaignCount(Array.isArray(campaignResponse) ? campaignResponse.length : 0);
            });
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

                const catalogProducts = enriched.filter((product) => product.productMode !== 'PRE_ORDER');
                setProducts(catalogProducts);
                setTotal(response?.totalElements || catalogProducts.length);
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
        return () => {
            cancelled = true;
        };
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

    const groups = useMemo(() => ({
        mixed: products.filter((product) => product.productMode === 'MIXED'),
        ready: products.filter((product) => product.productMode === 'IN_STOCK'),
    }), [products]);

    const viewConfig = {
        all: { label: 'Tất cả', icon: <AppstoreOutlined /> },
        ready: { label: 'Có sẵn ngay', icon: <RocketOutlined /> },
        mixed: { label: 'Lựa chọn linh hoạt', icon: <TagOutlined /> },
    };

    const filteredProducts = (() => {
        if (view === 'ready') return groups.ready;
        if (view === 'mixed') return groups.mixed;
        return products;
    })();

    const listStats = {
        total: products.length,
        mixed: groups.mixed.length,
        ready: groups.ready.length,
    };

    const getModeBadge = (product) => {
        if (product.productMode === 'MIXED') {
            return {
                className: 'badge-mixed',
                label: 'Linh hoạt',
                sublabel: 'Mẫu này có lựa chọn mua ngay và cũng xuất hiện trong những đợt mở bán được quan tâm nhiều.',
            };
        }

        return {
            className: 'badge-ready',
            label: 'Có sẵn',
            sublabel: `Sẵn sàng lên đơn với ${product.totalStock ?? 0} sản phẩm còn lại.`,
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
                        <div className="product-img-placeholder">Kính</div>
                    )}
                    <span className={`mode-badge ${modeBadge.className}`}>{modeBadge.label}</span>
                </div>
                <div className="product-info">
                    <p className="product-brand">{product.brandName || 'GENETIX'}</p>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-mode-copy">{modeBadge.sublabel}</p>
                    <p className="product-price">{formatPrice(product)}</p>
                </div>
            </Link>
        );
    };

    return (
        <div className="product-list-page">
            <div className="catalog-hero">
                <div className="catalog-hero-inner">
                    <div className="catalog-hero-copy">
                        <span className="catalog-pill">{viewConfig[view]?.icon || <AppstoreOutlined />} Danh mục sản phẩm</span>
                        <h1>Khám phá những mẫu kính đẹp, dễ chọn và phù hợp với phong cách của bạn</h1>
                        <p>
                            Đây là không gian dành cho những lựa chọn có thể mua ngay hoặc dễ dàng cân nhắc. Bạn có thể lọc theo thương hiệu,
                            mức giá và kiểu mua sắm để nhanh chóng tìm ra chiếc kính phù hợp nhất.
                        </p>
                    </div>
                    <div className="catalog-stats">
                        <div className="catalog-stat-card">
                            <span>Tổng mẫu đang hiển thị</span>
                            <strong>{filteredProducts.length}</strong>
                        </div>
                        <div className="catalog-stat-card preorder">
                            <span>Chiến dịch nổi bật</span>
                            <strong>{campaignCount}</strong>
                        </div>
                        <div className="catalog-stat-card ready">
                            <span>Có sẵn ngay</span>
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
                        <h4><FilterOutlined /> Mức giá</h4>
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
                        <h4>Tình trạng</h4>
                        <Checkbox checked={inStock} onChange={(event) => updateParam('inStock', event.target.checked ? 'true' : '')}>
                            Chỉ xem sản phẩm có thể mua ngay
                        </Checkbox>
                    </div>

                    <div className="filter-section">
                        <h4>Kiểu xem</h4>
                        <div className="view-switch">
                            <button type="button" className={view === 'all' ? 'active all' : ''} onClick={() => updateParam('view', 'all')}>
                                <AppstoreOutlined /> Tất cả
                            </button>
                            <button type="button" className={view === 'ready' ? 'active ready' : ''} onClick={() => updateParam('view', 'ready')}>
                                <RocketOutlined /> Có sẵn ngay
                            </button>
                            <button type="button" className={view === 'mixed' ? 'active mixed' : ''} onClick={() => updateParam('view', 'mixed')}>
                                <TagOutlined /> Linh hoạt
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
                            <span className="summary-label">Chiến dịch</span>
                            <strong>{campaignCount}</strong>
                        </div>
                        <div className="summary-chip">
                            <span className="summary-label">Lựa chọn linh hoạt</span>
                            <strong>{listStats.mixed}</strong>
                        </div>
                        <span className="result-count">{total} sản phẩm</span>
                    </div>

                    <div className="mixed-notice">
                        <div>
                            <span className="mixed-notice-label">Khám phá thêm</span>
                            <strong>{campaignCount} chiến dịch đang chờ bạn ghé xem</strong>
                            <p>Nếu bạn yêu thích các phiên bản giới hạn hoặc muốn giữ chỗ sớm cho mẫu đang hot, hãy ghé khu chiến dịch để khám phá thêm.</p>
                        </div>
                        <Link to="/customer/preorder-campaigns">
                            <button type="button">
                                <ThunderboltOutlined /> Xem chiến dịch
                            </button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid-loading"><Spin size="large" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <Empty description="Chưa tìm thấy sản phẩm phù hợp với lựa chọn của bạn" style={{ marginTop: 60 }} />
                    ) : (
                        <>
                            <div className="products-grid">
                                {filteredProducts.map(renderProductCard)}
                            </div>

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

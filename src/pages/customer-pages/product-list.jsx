import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Slider, Checkbox, Pagination, Spin, Empty } from 'antd';
import { FilterOutlined, ThunderboltOutlined, RocketOutlined, AppstoreOutlined } from '@ant-design/icons';
import { searchProductsAPI, getBrandsAPI, getPublicProductDetailAPI } from '../../services/api.service';
import { enrichPublicProducts } from '../../utils/public-product-view';
import './product-list.css';

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
    const size = 12;

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

    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatPrice = (product) => {
        if (product.priceLabel?.type === 'range') {
            return `${formatVND(product.priceLabel.minPrice)} - ${formatVND(product.priceLabel.maxPrice)}`;
        }
        if (product.priceLabel?.minPrice) return formatVND(product.priceLabel.minPrice);
        return 'Liên hệ';
    };

    const filteredProducts = products.filter((product) => {
        if (view === 'pre-order') return product.hasPreOrder;
        if (view === 'ready') return product.productMode === 'IN_STOCK' || product.productMode === 'MIXED';
        return true;
    });

    const modeStats = {
        preorder: products.filter((product) => product.hasPreOrder).length,
        ready: products.filter((product) => product.productMode === 'IN_STOCK' || product.productMode === 'MIXED').length,
    };

    const getModeBadge = (product) => {
        if (product.productMode === 'PRE_ORDER') {
            return { className: 'badge-preorder', label: 'Pre-order', sublabel: 'Đặt trước toàn bộ' };
        }
        if (product.productMode === 'MIXED') {
            return { className: 'badge-mixed', label: 'Có pre-order', sublabel: 'Có cả hàng sẵn và đặt trước' };
        }
        return { className: 'badge-ready', label: 'Giao ngay', sublabel: 'Có hàng sẵn để xử lý đơn' };
    };

    return (
        <div className="product-list-page">
            <div className="list-body">
                <aside className="filter-sidebar">
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
                            Chỉ xem sản phẩm còn hàng
                        </Checkbox>
                    </div>

                    <div className="filter-section">
                        <h4>Kiểu bán</h4>
                        <div className="view-switch">
                            <button type="button" className={view === 'all' ? 'active' : ''} onClick={() => updateParam('view', 'all')}>
                                <AppstoreOutlined /> Tất cả
                            </button>
                            <button type="button" className={view === 'ready' ? 'active' : ''} onClick={() => updateParam('view', 'ready')}>
                                <RocketOutlined /> Giao ngay
                            </button>
                            <button type="button" className={view === 'pre-order' ? 'active' : ''} onClick={() => updateParam('view', 'pre-order')}>
                                <ThunderboltOutlined /> Pre-order
                            </button>
                        </div>
                    </div>
                </aside>

                <div className="grid-area">
                    <div className="list-summary">
                        <div className="summary-chip">
                            <span className="summary-label">Đang xem</span>
                            <strong>{filteredProducts.length}</strong>
                        </div>
                        <div className="summary-chip">
                            <span className="summary-label">Pre-order</span>
                            <strong>{modeStats.preorder}</strong>
                        </div>
                        <div className="summary-chip">
                            <span className="summary-label">Giao ngay</span>
                            <strong>{modeStats.ready}</strong>
                        </div>
                        <span className="result-count">{total} sản phẩm từ BE</span>
                    </div>

                    {loading ? (
                        <div className="grid-loading"><Spin size="large" /></div>
                    ) : filteredProducts.length === 0 ? (
                        <Empty description="Không tìm thấy sản phẩm phù hợp" style={{ marginTop: 60 }} />
                    ) : (
                        <>
                            <div className="products-grid">
                                {filteredProducts.map((product) => {
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
                                                <span className={`stock-badge ${product.hasStock === false ? 'out' : 'in'}`}>
                                                    {product.hasStock === false ? 'Hết hàng' : `Kho: ${product.totalStock ?? 0}`}
                                                </span>
                                            </div>
                                            <div className="product-info">
                                                <p className="product-brand">{product.brandName || '—'}</p>
                                                <h3 className="product-name">{product.name}</h3>
                                                <p className="product-mode-copy">{modeBadge.sublabel}</p>
                                                <p className="product-price">{formatPrice(product)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
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

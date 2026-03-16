import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Slider, Checkbox, Pagination, Spin, Empty } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { searchProductsAPI, getBrandsAPI } from '../../services/api.service';
import { getProductAvailability } from '../../utils/product-sale';
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
    const page = parseInt(searchParams.get('page') || '0');
    const size = 12;

    const [priceRange, setPriceRange] = useState([0, 10000000]);
    useEffect(() => { getBrandsAPI().then(r => setBrands(Array.isArray(r) ? r : [])); }, []);

    useEffect(() => {
        let cancelled = false;
        const fetchProducts = async () => {
            const params = {
                keyword: keyword || undefined,
                brand: brand || undefined,
                inStock: inStock || undefined,
                minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
                maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
                page, size,
            };
            try {
                const res = await searchProductsAPI(params);
                if (cancelled) return;
                if (res?.content) { setProducts(res.content); setTotal(res.totalElements || 0); }
                else if (Array.isArray(res)) { setProducts(res); setTotal(res.length); }
            } catch { if (!cancelled) setProducts([]); }
            finally { if (!cancelled) setLoading(false); }
        };
        setLoading(true);
        fetchProducts();
        return () => { cancelled = true; };
    }, [keyword, brand, inStock, page, priceRange, searchParams]);

    const updateParam = (key, value) => {
        const p = new URLSearchParams(searchParams);
        if (value) p.set(key, value); else p.delete(key);
        p.delete('page');
        setSearchParams(p);
    };

    const formatVND = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    return (
        <div className="product-list-page">
            {/* Top bar (only count) */}
            <div className="list-topbar">
                <div className="topbar-inner" style={{ justifyContent: 'flex-end' }}>
                    <span className="result-count">{total} sản phẩm</span>
                </div>
            </div>

            <div className="list-body">
                {/* Sidebar filter */}
                <aside className="filter-sidebar">
                    <div className="filter-section">
                        <h4><FilterOutlined /> Lọc giá</h4>
                        <Slider
                            range min={0} max={10000000} step={100000}
                            value={priceRange}
                            onChange={setPriceRange}
                            tipFormatter={v => formatVND(v)}
                        />
                        <div className="price-range-labels">
                            <span>{formatVND(priceRange[0])}</span>
                            <span>{formatVND(priceRange[1])}</span>
                        </div>
                    </div>
                    <div className="filter-section">
                        <h4>Thương hiệu</h4>
                        <div className="brand-list">
                            {brands.map(b => (
                                <div
                                    key={b}
                                    className={`brand-item ${brand === b ? 'active' : ''}`}
                                    onClick={() => updateParam('brand', brand === b ? '' : b)}
                                >
                                    {b}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="filter-section">
                        <h4>Tình trạng</h4>
                        <Checkbox checked={inStock} onChange={e => updateParam('inStock', e.target.checked ? 'true' : '')}>
                            Còn hàng
                        </Checkbox>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="grid-area">
                    {loading ? (
                        <div className="grid-loading"><Spin size="large" /></div>
                    ) : products.length === 0 ? (
                        <Empty description="Không tìm thấy sản phẩm phù hợp" style={{ marginTop: 60 }} />
                    ) : (
                        <>
                            <div className="products-grid">
                                {products.map(p => {
                                    const availability = getProductAvailability(p);

                                    return (
                                        <Link key={p.id} to={`/customer/products/${p.id}`} className="product-card">
                                            <div className="product-img-wrap">
                                                {p.productImage ? (
                                                    <img src={p.productImage} alt={p.name} className="product-img" />
                                                ) : (
                                                    <div className="product-img-placeholder">👓</div>
                                                )}
                                                <span className={`badge-${availability.className}`}>{availability.label}</span>
                                            </div>
                                            <div className="product-info">
                                                <p className="product-brand">{p.brandName || '—'}</p>
                                                <h3 className="product-name">{p.name}</h3>
                                                <p className="product-price">
                                                    {p.minPrice ? formatVND(p.minPrice) : 'Liên hệ'}
                                                </p>
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
                                        onChange={p => { const sp = new URLSearchParams(searchParams); sp.set('page', p - 1); setSearchParams(sp); }}
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

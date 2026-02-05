import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './styles/collections.css';

// Mock product data
const allProducts = [
    {
        id: 1,
        name: 'Aviator Classic RB3025',
        brand: 'Ray-Ban',
        price: 4500000,
        originalPrice: 5200000,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
        category: 'sunglasses',
        rating: 4.8,
        reviewCount: 124,
        badges: ['bestseller'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 2,
        name: 'GG1134O Square Frame',
        brand: 'Gucci',
        price: 8900000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
        category: 'optical',
        rating: 4.9,
        reviewCount: 89,
        badges: ['new'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 3,
        name: 'PR 17WS Cat Eye',
        brand: 'Prada',
        price: 7200000,
        originalPrice: 8500000,
        image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
        category: 'sunglasses',
        rating: 4.7,
        reviewCount: 56,
        badges: ['sale'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 4,
        name: 'Holbrook XL Prizm',
        brand: 'Oakley',
        price: 5800000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        category: 'sunglasses',
        rating: 4.6,
        reviewCount: 203,
        badges: ['preorder'],
        inStock: false,
        isPreorder: true
    },
    {
        id: 5,
        name: 'TF5505 Rectangle',
        brand: 'Tom Ford',
        price: 9500000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400',
        category: 'optical',
        rating: 4.9,
        reviewCount: 67,
        badges: ['new'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 6,
        name: 'Wayfarer Classic',
        brand: 'Ray-Ban',
        price: 3800000,
        originalPrice: 4200000,
        image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400',
        category: 'sunglasses',
        rating: 4.7,
        reviewCount: 312,
        badges: ['bestseller', 'sale'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 7,
        name: 'DG5025 Oversized',
        brand: 'Dolce & Gabbana',
        price: 7800000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400',
        category: 'sunglasses',
        rating: 4.5,
        reviewCount: 45,
        badges: [],
        inStock: true,
        isPreorder: false
    },
    {
        id: 8,
        name: 'GG0061S Round',
        brand: 'Gucci',
        price: 12500000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=400',
        category: 'sunglasses',
        rating: 5.0,
        reviewCount: 28,
        badges: ['new'],
        inStock: false,
        isPreorder: true
    },
    {
        id: 9,
        name: 'Frogskins Lite',
        brand: 'Oakley',
        price: 4200000,
        originalPrice: 4800000,
        image: 'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=400',
        category: 'sunglasses',
        rating: 4.4,
        reviewCount: 156,
        badges: ['sale'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 10,
        name: 'PR 01OS Minimal',
        brand: 'Prada',
        price: 6900000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
        category: 'optical',
        rating: 4.8,
        reviewCount: 78,
        badges: [],
        inStock: true,
        isPreorder: false
    },
    {
        id: 11,
        name: 'Clubmaster Metal',
        brand: 'Ray-Ban',
        price: 5100000,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
        category: 'optical',
        rating: 4.6,
        reviewCount: 189,
        badges: ['low-stock'],
        inStock: true,
        isPreorder: false
    },
    {
        id: 12,
        name: 'TF5528 Navigator',
        brand: 'Tom Ford',
        price: 11200000,
        originalPrice: 12500000,
        image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400',
        category: 'optical',
        rating: 4.9,
        reviewCount: 34,
        badges: ['sale'],
        inStock: true,
        isPreorder: false
    }
];

const brands = ['Ray-Ban', 'Gucci', 'Prada', 'Oakley', 'Tom Ford', 'Dolce & Gabbana'];
const categories = [
    { id: 'sunglasses', label: 'Kính mát' },
    { id: 'optical', label: 'Kính cận' },
    { id: 'frames', label: 'Gọng kính' }
];

const CollectionsPage = () => {
    // Filter states
    const [showFilters, setShowFilters] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 15000000]);
    const [showPreorderOnly, setShowPreorderOnly] = useState(false);
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid-4');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Quick view modal
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Render stars
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        let stars = '★'.repeat(fullStars);
        if (hasHalf) stars += '☆';
        return stars.padEnd(5, '☆');
    };

    // Filter products
    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );
        }

        // Brand filter
        if (selectedBrands.length > 0) {
            result = result.filter(p => selectedBrands.includes(p.brand));
        }

        // Category filter
        if (selectedCategories.length > 0) {
            result = result.filter(p => selectedCategories.includes(p.category));
        }

        // Price filter
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Pre-order filter
        if (showPreorderOnly) {
            result = result.filter(p => p.isPreorder);
        }

        // In stock filter
        if (showInStockOnly) {
            result = result.filter(p => p.inStock);
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            case 'popular':
                result.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            default: // newest - keep original order
                break;
        }

        return result;
    }, [searchQuery, selectedBrands, selectedCategories, priceRange, showPreorderOnly, showInStockOnly, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Handlers
    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
        setCurrentPage(1);
    };

    const toggleCategory = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedBrands([]);
        setSelectedCategories([]);
        setPriceRange([0, 15000000]);
        setShowPreorderOnly(false);
        setShowInStockOnly(false);
        setCurrentPage(1);
    };

    const activeFilterCount = selectedBrands.length + selectedCategories.length +
        (showPreorderOnly ? 1 : 0) + (showInStockOnly ? 1 : 0);

    return (
        <div className="collections-page">
            {/* Hero Header */}
            <section className="collections-hero">
                <div className="collections-container">
                    <nav className="breadcrumb">
                        <Link to="/homepage">Trang chủ</Link>
                        <span className="breadcrumb-separator">›</span>
                        <span>Bộ sưu tập</span>
                    </nav>
                    <h1 className="collections-title">BỘ SƯU TẬP KÍNH</h1>
                    <p className="collections-subtitle">
                        Khám phá bộ sưu tập kính thời trang cao cấp từ các thương hiệu hàng đầu thế giới
                    </p>
                    <p className="results-count">
                        Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
                    </p>
                </div>
            </section>

            {/* Filter & Sort Bar */}
            <section className="filter-sort-bar">
                <div className="collections-container">
                    <div className="filter-bar-content">
                        <div className="filter-left">
                            <button
                                className="filter-toggle-btn"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                🎚️ Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </button>

                            <div className="filter-search">
                                <span className="filter-search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>

                            <div className="filter-chips">
                                {selectedBrands.map(brand => (
                                    <span key={brand} className="filter-chip active">
                                        {brand}
                                        <span className="remove" onClick={() => toggleBrand(brand)}>×</span>
                                    </span>
                                ))}
                                {selectedCategories.map(cat => (
                                    <span key={cat} className="filter-chip active">
                                        {categories.find(c => c.id === cat)?.label}
                                        <span className="remove" onClick={() => toggleCategory(cat)}>×</span>
                                    </span>
                                ))}
                                {activeFilterCount > 0 && (
                                    <button
                                        className="filter-chip"
                                        onClick={clearAllFilters}
                                        style={{ color: '#EF4444' }}
                                    >
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="filter-right">
                            <div className="view-toggle">
                                <button
                                    className={`view-btn ${viewMode === 'grid-4' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid-4')}
                                    title="4 cột"
                                >
                                    ▦
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'grid-3' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid-3')}
                                    title="3 cột"
                                >
                                    ▤
                                </button>
                            </div>

                            <div className="sort-select">
                                <label>Sắp xếp:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">Mới nhất</option>
                                    <option value="price-low">Giá: Thấp → Cao</option>
                                    <option value="price-high">Giá: Cao → Thấp</option>
                                    <option value="popular">Bán chạy nhất</option>
                                    <option value="rating">Đánh giá cao nhất</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="collections-container">
                <div className={`collections-main ${!showFilters ? 'no-sidebar' : ''}`}>

                    {/* Sidebar Filters */}
                    {showFilters && (
                        <aside className="filters-sidebar">
                            {/* Brands */}
                            <div className="filter-section">
                                <div className="filter-section-header">
                                    <h3 className="filter-section-title">Thương hiệu</h3>
                                    {selectedBrands.length > 0 && (
                                        <button className="filter-clear" onClick={() => setSelectedBrands([])}>
                                            Xóa
                                        </button>
                                    )}
                                </div>
                                <div className="filter-options">
                                    {brands.map(brand => (
                                        <label key={brand} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => toggleBrand(brand)}
                                            />
                                            <span>{brand}</span>
                                            <span className="filter-option-count">
                                                ({allProducts.filter(p => p.brand === brand).length})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="filter-section">
                                <div className="filter-section-header">
                                    <h3 className="filter-section-title">Loại kính</h3>
                                    {selectedCategories.length > 0 && (
                                        <button className="filter-clear" onClick={() => setSelectedCategories([])}>
                                            Xóa
                                        </button>
                                    )}
                                </div>
                                <div className="filter-options">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="filter-option">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(cat.id)}
                                                onChange={() => toggleCategory(cat.id)}
                                            />
                                            <span>{cat.label}</span>
                                            <span className="filter-option-count">
                                                ({allProducts.filter(p => p.category === cat.id).length})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="filter-section">
                                <div className="filter-section-header">
                                    <h3 className="filter-section-title">Khoảng giá</h3>
                                </div>
                                <div className="price-range">
                                    <div className="price-inputs">
                                        <div className="price-input">
                                            <input
                                                type="text"
                                                value={formatPrice(priceRange[0]).replace('₫', '').trim()}
                                                readOnly
                                            />
                                        </div>
                                        <span>—</span>
                                        <div className="price-input">
                                            <input
                                                type="text"
                                                value={formatPrice(priceRange[1]).replace('₫', '').trim()}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Availability */}
                            <div className="filter-section">
                                <div className="filter-section-header">
                                    <h3 className="filter-section-title">Tình trạng</h3>
                                </div>
                                <div className="filter-options">
                                    <div className="toggle-option">
                                        <span>Chỉ còn hàng</span>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={showInStockOnly}
                                                onChange={(e) => {
                                                    setShowInStockOnly(e.target.checked);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                    <div className="toggle-option">
                                        <span>Pre-order</span>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={showPreorderOnly}
                                                onChange={(e) => {
                                                    setShowPreorderOnly(e.target.checked);
                                                    setCurrentPage(1);
                                                }}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Products Grid */}
                    <div className="products-content">
                        {paginatedProducts.length > 0 ? (
                            <>
                                <div className={`products-grid ${viewMode === 'grid-3' ? 'grid-3' : ''}`}>
                                    {paginatedProducts.map(product => (
                                        <div key={product.id} className="product-card">
                                            <div className="product-image-wrapper">
                                                <img src={product.image} alt={product.name} />

                                                {/* Badges */}
                                                <div className="product-badges">
                                                    {product.badges.includes('bestseller') && (
                                                        <span className="badge badge-bestseller">🔥 Bestseller</span>
                                                    )}
                                                    {product.badges.includes('new') && (
                                                        <span className="badge badge-new">✨ New</span>
                                                    )}
                                                    {product.badges.includes('sale') && (
                                                        <span className="badge badge-sale">
                                                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                                        </span>
                                                    )}
                                                    {product.badges.includes('preorder') && (
                                                        <span className="badge badge-preorder">📦 Pre-order</span>
                                                    )}
                                                    {product.badges.includes('low-stock') && (
                                                        <span className="badge badge-low-stock">⚡ Sắp hết</span>
                                                    )}
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="product-quick-actions">
                                                    <button className="quick-action-btn" title="Yêu thích">
                                                        ❤️
                                                    </button>
                                                    <button
                                                        className="quick-action-btn"
                                                        title="Xem nhanh"
                                                        onClick={() => setQuickViewProduct(product)}
                                                    >
                                                        👁️
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="product-info">
                                                <span className="product-brand">{product.brand}</span>
                                                <h3 className="product-name">{product.name}</h3>

                                                <div className="product-rating">
                                                    <span className="rating-stars">{renderStars(product.rating)}</span>
                                                    <span className="rating-count">({product.reviewCount})</span>
                                                </div>

                                                <div className="product-price-row">
                                                    <span className="current-price">{formatPrice(product.price)}</span>
                                                    {product.originalPrice && (
                                                        <>
                                                            <span className="original-price">{formatPrice(product.originalPrice)}</span>
                                                            <span className="discount-percent">
                                                                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {product.isPreorder && (
                                                    <button className="preorder-cta">
                                                        ĐẶT CỌC 30%
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="pagination-section">
                                    <p className="load-more-info">
                                        Hiển thị {Math.min(currentPage * productsPerPage, filteredProducts.length)} / {filteredProducts.length} sản phẩm
                                    </p>

                                    <div className="pagination-numbers">
                                        <button
                                            className="page-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                        >
                                            ←
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        <button
                                            className="page-btn"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >
                                            →
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3 className="empty-title">Không tìm thấy sản phẩm</h3>
                                <p className="empty-text">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                <button className="empty-btn" onClick={clearAllFilters}>
                                    Xóa bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Quick View Modal */}
            <div
                className={`modal-overlay ${quickViewProduct ? 'active' : ''}`}
                onClick={() => setQuickViewProduct(null)}
            >
                {quickViewProduct && (
                    <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setQuickViewProduct(null)}
                        >
                            ✕
                        </button>

                        <div className="modal-image">
                            <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                        </div>

                        <div className="modal-content">
                            <span className="modal-brand">{quickViewProduct.brand}</span>
                            <h2 className="modal-title">{quickViewProduct.name}</h2>

                            <div className="modal-rating">
                                <span className="rating-stars">{renderStars(quickViewProduct.rating)}</span>
                                <span className="rating-count">({quickViewProduct.reviewCount} đánh giá)</span>
                            </div>

                            <div className="modal-price">
                                {formatPrice(quickViewProduct.price)}
                                {quickViewProduct.originalPrice && (
                                    <span className="original-price" style={{ marginLeft: '12px' }}>
                                        {formatPrice(quickViewProduct.originalPrice)}
                                    </span>
                                )}
                            </div>

                            <p className="modal-description">
                                Sản phẩm chính hãng 100% từ {quickViewProduct.brand}.
                                Được bảo hành theo tiêu chuẩn quốc tế.
                                {quickViewProduct.isPreorder
                                    ? ' Đặt cọc 30% để giữ chỗ, thanh toán 70% khi nhận hàng.'
                                    : ' Giao hàng toàn quốc trong 2-5 ngày làm việc.'
                                }
                            </p>

                            <div className="modal-actions">
                                {quickViewProduct.isPreorder ? (
                                    <button className="modal-btn modal-btn-primary">
                                        ĐẶT CỌC 30%
                                    </button>
                                ) : (
                                    <button className="modal-btn modal-btn-primary">
                                        THÊM VÀO GIỎ
                                    </button>
                                )}
                                <Link
                                    to={`/product/${quickViewProduct.id}`}
                                    className="modal-btn modal-btn-secondary"
                                    onClick={() => setQuickViewProduct(null)}
                                >
                                    XEM CHI TIẾT →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionsPage;

import React, { useEffect, useState } from 'react';
import ProductTable from './product.table';
import ProductForm from './product.form';
import { searchManagerProductsAPI, getBrandsAPI } from '../../../services/api.service';
import { Button, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import './product.css';

const { Option } = Select;

const ProductPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(0); // 0-based for API
    const [pageSize, setPageSize] = useState(10);
    
    // Filter states
    const [keyword, setKeyword] = useState('');
    const [brand, setBrand] = useState('');
    const [brands, setBrands] = useState([]);

    // Modal state for Create
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Load brands for filter
    const loadBrands = async () => {
        try {
            const res = await getBrandsAPI();
            if (res && Array.isArray(res)) {
                setBrands(res);
            }
        } catch (error) {
            console.error("Failed to load brands", error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await searchManagerProductsAPI(
                current, 
                pageSize, 
                keyword, 
                brand
            );
            console.log(">>> Search API response:", res);
            if (res && res.content) {
                setDataSource(res.content);
                setTotal(res.totalElements || 0);
            } else {
                setDataSource([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Failed to load products", error);
            setDataSource([]);
            setTotal(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadBrands();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [current, pageSize, keyword, brand]);

    return (
        <div className="product-page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ color: '#ffffff' }}>Product Management</h1>
                    <p className="page-subtitle" style={{ color: '#ffffff' }}>Manage products, variants, and stock</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateOpen(true)}
                >
                    Create Product
                </Button>
            </div>

            {/* Filter Section */}
            <div className="product-filter-section">
                <div className="filter-item">
                    <span className="filter-label">Product Name</span>
                    <Input
                        placeholder="Search by product name..."
                        value={keyword}
                        onChange={(e) => {
                            setKeyword(e.target.value);
                            setCurrent(0); // Reset to first page when searching
                        }}
                        prefix={<SearchOutlined style={{ color: '#0891b2' }} />}
                        allowClear
                    />
                </div>
                
                <div className="filter-item">
                    <span className="filter-label">Brand</span>
                    <Select
                        value={brand}
                        onChange={(value) => {
                            setBrand(value);
                            setCurrent(0); // Reset to first page when filtering
                        }}
                        style={{ width: '100%' }}
                        allowClear
                        placeholder="All brands"
                    >
                        {brands.map(brandItem => (
                            <Option key={brandItem} value={brandItem}>
                                {brandItem}
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            <ProductTable
                dataSource={dataSource}
                loading={loading}
                current={current}
                pageSize={pageSize}
                total={total}
                setCurrent={setCurrent}
                setPageSize={setPageSize}
                loadProducts={loadProducts}
            />

            <ProductForm
                isCreateOpen={isCreateOpen}
                setIsCreateOpen={setIsCreateOpen}
                loadProducts={loadProducts}
            />
        </div>
    );
};

export default ProductPage;

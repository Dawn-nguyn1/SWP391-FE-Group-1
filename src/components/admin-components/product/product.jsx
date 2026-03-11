import React, { useEffect, useState } from 'react';
import ProductTable from './product.table';
import ProductForm from './product.form';
import { fetchProductsAPI } from '../../../services/api.service';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './product.css';

const ProductPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal state for Create
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetchProductsAPI();
            console.log(">>> Checking API response:", res);
            if (res && Array.isArray(res)) {
                // Only show ACTIVE products
                const activeProducts = res.filter(product => product.status === 'ACTIVE');
                setDataSource(activeProducts);
                setTotal(activeProducts.length);
            }
        } catch (_error) {
            console.error("Failed to load products", _error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, [current, pageSize]);

    return (
        <div className="product-page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Product Management</h1>
                    <p className="page-subtitle">Manage products, variants, and stock</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateOpen(true)}
                >
                    Create Product
                </Button>
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

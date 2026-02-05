import React, { useEffect, useState } from 'react';
import ProductTable from './product.table';
import ProductForm from './product.form';
import { fetchProductsAPI } from '../../services/api.service';
import { Button, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './product.css';

const ProductPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [current, pageSize]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await fetchProductsAPI(current, pageSize);
            if (res && res.content) {
                setDataSource(res.content);
                setTotal(res.totalElements);
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: "Failed to load products"
            });
        }
        setLoading(false);
    }

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
                    onClick={() => setIsModalOpen(true)}
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
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                loadProducts={loadProducts}
            />
        </div>
    );
};

export default ProductPage;

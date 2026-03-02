import React, { useEffect, useState } from 'react';
import ProductTable from './product.table';
import ProductForm from './product.form';
import { fetchProductsAPI, deleteProductAPI } from '../../../services/api.service';
import { Button, notification, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './product.css';

const ProductPage = () => {
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // State for Edit
    const [dataUpdate, setDataUpdate] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            notification.error({
                message: "Error",
                description: "Failed to load products"
            });
        }
        setLoading(false);
    };

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        loadProducts();
    }, [current, pageSize]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleEditProduct = (product) => {
        console.log("Editing product:", product);
        setDataUpdate(product);
        setIsModalOpen(true);
    }

    const handleDeleteProduct = async (id) => {
        console.log(">>> Attempting to delete product with ID:", id);
        try {
            const res = await deleteProductAPI(id);
            console.log(">>> Delete API response:", res);
            
            // HTTP 204 No Content means success (no body in response)
            notification.success({
                message: "Success",
                description: "Product deleted successfully"
            });
            await loadProducts();
            
        } catch (error) {
            console.error(">>> Delete product error:", error);
            console.error(">>> Error response:", error.response);
            notification.error({
                message: "Error",
                description: error.response?.data?.message || error?.message || "Failed to delete product"
            });
        }
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
                    onClick={() => {
                        setDataUpdate(null);
                        setIsModalOpen(true);
                    }}
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
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
            />

            <ProductForm
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                loadProducts={loadProducts}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
            />
        </div>
    );
};

export default ProductPage;

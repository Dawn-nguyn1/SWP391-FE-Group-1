import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, notification } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ProductDetail from './product.detail';
import UpdateProductModal from './update.product.modal';
import { deleteProductAPI } from '../../../services/api.service';

const ProductTable = ({
    dataSource,
    loading,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
    loadProducts
}) => {

    // State for Detail Modal
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    // State for Update Modal
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    const handleViewDetail = (record) => {
        setSelectedProductId(record.id);
        setIsDetailOpen(true);
        console.log("View product detail:", record);
    };

    const handleEditProduct = (record) => {
        setDataUpdate(record);
        setIsUpdateOpen(true);
        console.log("Editing product:", record);
    };

    const handleDeleteProduct = async (id) => {
        console.log(">>> Attempting to delete product with ID:", id);
        try {
            const res = await deleteProductAPI(id);
            console.log(">>> Delete API response:", res);
            
            notification.success({
                message: "Success",
                description: "Product deleted successfully"
            });
            await loadProducts();
            
        } catch (error) {
            console.error(">>> Delete product error:", error);
            notification.error({
                message: "Error",
                description: error.response?.data?.message || error?.message || "Failed to delete product"
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
        },
        {
            title: 'Image',
            dataIndex: 'productImage',
            key: 'productImage',
            align: 'center',
            render: (url) => <img src={url} alt="product" style={{ width: 50, height: 50, objectFit: 'cover' }} />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status) => (
                <span style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: status === 'ACTIVE' ? '#f0fdf4' : '#fef2f2',
                    color: status === 'ACTIVE' ? '#16a34a' : '#dc2626'
                }}>
                    {status || 'N/A'}
                </span>
            )
        },
        {
            title: 'Brand',
            dataIndex: 'brandName',
            key: 'brandName',
            align: 'center',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            align: 'center',
            render: (text) => {
                if (!text) return "N/A";
                // Truncate if too long
                return text.length > 50 ? `${text.substring(0, 50)}...` : text;
            }
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 180,
            render: (_, record) => (
                <div className="action-buttons">
                    <button
                        className="action-btn-icon view-btn"
                        onClick={() => handleViewDetail(record)}
                        title="View"
                    >
                        <EyeOutlined />
                    </button>
                    <button
                        className="action-btn-icon edit-btn"
                        onClick={() => handleEditProduct(record)}
                        title="Edit"
                    >
                        <EditOutlined />
                    </button>
                    <Popconfirm
                        title="Delete the product"
                        description="Are you sure to delete this product?"
                        onConfirm={() => handleDeleteProduct(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <button
                            className="action-btn-icon delete-btn"
                            title="Delete"
                        >
                            <DeleteOutlined />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const onChange = (pagination, _filters, _sorter, _extra) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current);
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    };

    return (
        <>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey={"id"}
                loading={loading}
                pagination={{
                    current: current,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20']
                }}
                onChange={onChange}
            />
            <ProductDetail
                isDetailOpen={isDetailOpen}
                setIsDetailOpen={setIsDetailOpen}
                productId={selectedProductId}
            />
            <UpdateProductModal
                isUpdateOpen={isUpdateOpen}
                setIsUpdateOpen={setIsUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadProducts={loadProducts}
            />
        </>
    );
};

export default ProductTable;
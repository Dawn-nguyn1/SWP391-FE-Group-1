
import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ProductDetail from './product.detail';

const ProductTable = ({
    dataSource,
    loading,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
    handleEditProduct,
    handleDeleteProduct
}) => {

    const confirmDelete = (id) => {
        console.log(">>> confirmDelete called with ID:", id);
        if (handleDeleteProduct) {
            handleDeleteProduct(id);
        } else {
            console.error(">>> handleDeleteProduct is not defined!");
        }
    };

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
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
                        onClick={() => {
                            setSelectedProductId(record.id);
                            setIsDetailOpen(true);
                            console.log("Dữ liệu record khi nhấn:", record);
                        }}
                        title="View"
                    >
                        <EyeOutlined />
                    </button>
                    <button
                        className="action-btn-icon edit-btn"
                        onClick={() => {
                            if (handleEditProduct) {
                                handleEditProduct(record);
                            }
                        }}
                        title="Edit"
                    >
                        <EditOutlined />
                    </button>
                    <Popconfirm
                        title="Delete the product"
                        description="Are you sure to delete this product?"
                        onConfirm={() => confirmDelete(record.id)}
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
        </>
    );
};

export default ProductTable;
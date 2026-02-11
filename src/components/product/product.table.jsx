
import React from 'react';
import { Table, Button, Space, Popconfirm, message, notification } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const ProductTable = ({
    dataSource,
    loading,
    current,
    pageSize,
    total,
    setCurrent,
    setPageSize,
    loadProducts,
    handleEditProduct,
    handleDeleteProduct
}) => {

    const confirmDelete = (id) => {
        handleDeleteProduct(id);
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
                            console.log("trang xem chi tiết product");
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

    const onChange = (pagination, filters, sorter, extra) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current);
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize);
            setCurrent(1);
        }
    };

    return (
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
    );
};

export default ProductTable;
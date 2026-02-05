
import React from 'react';
import { Table, Button, Space, Popconfirm, message, notification } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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
        },
        {
            title: 'Image',
            dataIndex: 'productImage',
            key: 'productImage',
            render: (url) => <img src={url} alt="product" style={{ width: 50, height: 50, objectFit: 'cover' }} />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Brand',
            dataIndex: 'brandName',
            key: 'brandName',
        },
        {
            title: 'Price',
            dataIndex: 'price', // Assuming price comes from somewhere or is representative variant price
            key: 'price',
            render: (_, record) => {
                // Logic to show price range if multiple variants or just first variant price
                if (record.variants && record.variants.length > 0) {
                    return `${record.variants[0].price} `;
                }
                return "N/A";
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        ghost
                        onClick={() => {
                            if (handleEditProduct) {
                                handleEditProduct(record);
                            }
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete the product"
                        description="Are you sure to delete this product?"
                        onConfirm={() => confirmDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
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
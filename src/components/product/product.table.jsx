import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

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

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
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
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Brand',
            dataIndex: 'brandName',
            key: 'brandName',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status}
                </Tag>
            )
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
                            // TODO: Handle Edit
                            console.log("Edit", record);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        ghost
                    >
                        Delete
                    </Button>
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

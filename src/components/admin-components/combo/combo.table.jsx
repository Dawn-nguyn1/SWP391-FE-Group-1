import React, { useState } from 'react';
import { Table, message, Modal, Descriptions, Tag, Popconfirm, notification } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import UpdateComboModal from './update.combo.modal';
import { deleteComboAPI } from '../../../services/api.service';
import './combo.css';

const ComboTable = (props) => {
    const {
        dataCombos,
        loadCombos,
        current,
        pageSize,
        total,
        setCurrent,
        setPageSize,
        loading
    } = props;

    const [dataDetail, setDataDetail] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(null);

    const columns = [
        {
            title: 'STT',
            width: 70,
            render: (_, record, index) => {
                return (
                    <span className="stt-number">
                        {(index + 1) + (current) * pageSize}
                    </span>
                );
            }
        },
        {
            title: 'Image',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            render: (imageUrl) => (
                <img 
                    src={imageUrl} 
                    alt="Combo" 
                    style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px'
                    }} 
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Price',
            dataIndex: 'comboPrice',
            key: 'comboPrice',
            render: (price) => `$${price?.toFixed(2) || '0.00'}`,
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Tag color={active ? 'green' : 'red'}>
                    {active ? 'Active' : 'Inactive'}
                </Tag>
            ),
        },
        {
            title: 'Variants Count',
            key: 'variantsCount',
            align: 'center',
            render: (_, record) => record.items?.length || 0,
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <div className="action-buttons">
                    <button
                        className="action-btn-icon view-btn"
                        onClick={() => {
                            setDataDetail(record);
                            setIsDetailOpen(true);
                        }}
                        title="View"
                    >
                        <EyeOutlined />
                    </button>
                    <button
                        className="action-btn-icon edit-btn"
                        onClick={() => {
                            setIsUpdateOpen(true);
                            setDataUpdate(record);
                        }}
                        title="Edit"
                    >
                        <EditOutlined />
                    </button>
                    <Popconfirm
                        title="Delete Combo"
                        description="Are you sure you want to delete this combo?"
                        onConfirm={() => handleDeleteCombo(record.id)}
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

    const handleDeleteCombo = async (id) => {
        try {
            await deleteComboAPI(id);
            // API returns 204 No Content for successful deletion
            notification.success({
                message: "Delete Combo",
                description: "Combo deleted successfully"
            });
            await loadCombos();
        } catch (error) {
            console.error("Delete combo error:", error);
            notification.error({
                message: "Error delete combo",
                description: error?.message || "Failed to delete combo"
            });
        }
    };

    const onChange = (pagination, filters, sorter, extra) => {
        if (pagination && pagination.current) {
            if (pagination.current !== +current + 1) {
                setCurrent(+pagination.current - 1);
            }
        }

        if (pagination && pagination.pageSize) {
            if (pagination.pageSize !== +pageSize) {
                setPageSize(+pagination.pageSize);
                setCurrent(0);
            }
        }
    };

    return (
    <div className="combo-table-wrapper" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
        <Table
            className="combo-table"
            columns={columns}
            dataSource={dataCombos}
            rowKey="id"
            loading={loading}
            pagination={{
                current: current + 1,
                pageSize: pageSize,
                showSizeChanger: true,
                total: total,
                showTotal: (total, range) => (
                    <span style={{ fontWeight: 500, color: '#64748b' }}>
                        Showing <b>{range[0]}-{range[1]}</b> of {total} combos
                    </span>
                )
            }}
            onChange={onChange}
        />

            {/* View Details Modal */}
            <Modal
                title="Combo Details"
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={null}
                width={800}
            >
                {dataDetail && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="ID">{dataDetail.id}</Descriptions.Item>
                        <Descriptions.Item label="Name">{dataDetail.name}</Descriptions.Item>
                        <Descriptions.Item label="Description" span={2}>{dataDetail.description}</Descriptions.Item>
                        <Descriptions.Item label="Image" span={2}>
                            {dataDetail.imageUrl ? (
                                <img 
                                    src={dataDetail.imageUrl} 
                                    alt={dataDetail.name}
                                    style={{ 
                                        width: '150px', 
                                        height: '150px', 
                                        objectFit: 'cover',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '4px'
                                    }} 
                                />
                            ) : (
                                <span style={{ color: '#999' }}>No image available</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Price">${dataDetail.comboPrice?.toFixed(2) || '0.00'}</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={dataDetail.active ? 'green' : 'red'}>
                                {dataDetail.active ? 'Active' : 'Inactive'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Variants" span={2}>
                            {dataDetail.items?.map((item, index) => (
                                <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                                    <div style={{ marginBottom: '8px' }}>
                                        <Tag color="blue">Variant ID: {item.productVariantId}</Tag>
                                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>Quantity: {item.quantity}</span>
                                    </div>
                                    
                                    {/* Display attributes with images */}
                                    {item.attributes && item.attributes.length > 0 && (
                                        <div style={{ marginTop: '12px' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>Attributes:</div>
                                            {item.attributes.map((attr, attrIndex) => (
                                                <div key={attrIndex} style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                                                    <div style={{ marginBottom: '6px' }}>
                                                        <Tag color="purple">{attr.attributeName}</Tag>
                                                        <span style={{ marginLeft: '8px' }}>{attr.attributeValue}</span>
                                                    </div>
                                                    
                                                    {/* Display images for this attribute */}
                                                    {attr.images && attr.images.length > 0 && (
                                                        <div style={{ marginTop: '8px' }}>
                                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Images:</div>
                                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                                {attr.images.map((img, imgIndex) => (
                                                                    <div key={imgIndex} style={{ textAlign: 'center' }}>
                                                                        <img 
                                                                            src={img.imageUrl} 
                                                                            alt={`${attr.attributeName} ${attr.attributeValue}`}
                                                                            style={{ 
                                                                                width: '60px', 
                                                                                height: '60px', 
                                                                                objectFit: 'cover',
                                                                                border: '1px solid #e0e0e0',
                                                                                borderRadius: '4px'
                                                                            }} 
                                                                        />
                                                                        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                                                            Order: {img.sortOrder}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            {/* Update Combo Modal */}
            <UpdateComboModal
                isUpdateOpen={isUpdateOpen}
                setIsUpdateOpen={setIsUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadCombos={loadCombos}
            />
        </div>
    );
};

export default ComboTable;

import React, { useState, useEffect } from 'react'
import { Table, Button, Space, message, Modal, Descriptions, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import ComboForm from './combo.form'
import UpdateComboModal from './update.combo.modal'
import { fetchCombosAPI, deleteComboAPI } from '../../../services/api.service'

const ComboPage = () => {
    const [isModalComboOpen, setIsModalComboOpen] = useState(false);
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentCombo, setCurrentCombo] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCombo, setSelectedCombo] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [comboToDelete, setComboToDelete] = useState(null);

    useEffect(() => {
        loadCombos();
    }, []);

    const loadCombos = async () => {
        setLoading(true);
        try {
            const res = await fetchCombosAPI(0, 100);
            if (res && res.content) {
                setCombos(res.content);
            }
        } catch (error) {
            message.error("Failed to load combos");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCombo = () => {
        setCurrentCombo(null);
        setIsModalComboOpen(true);
    };

    const handleEditCombo = (combo) => {
        setCurrentCombo(combo);
        setIsModalComboOpen(true);
    };

    const handleViewDetails = (combo) => {
        setSelectedCombo(combo);
        setIsDetailsModalOpen(true);
    };

    const handleDeleteCombo = (combo) => {
        setComboToDelete(combo);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!comboToDelete) return;
        
        try {
            await deleteComboAPI(comboToDelete.id);
            message.success(`Combo "${comboToDelete.name}" deleted successfully`);
            loadCombos();
            setDeleteModalVisible(false);
            setComboToDelete(null);
        } catch (error) {
            message.error("Failed to delete combo");
        }
    };

    const cancelDelete = () => {
        setDeleteModalVisible(false);
        setComboToDelete(null);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
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
                <span style={{ color: active ? 'green' : 'red' }}>
                    {active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: 'Variants Count',
            key: 'variantsCount',
            render: (_, record) => record.items?.length || 0,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button size="small" onClick={() => handleViewDetails(record)}>
                        View Details
                    </Button>
                    <Button size="small" onClick={() => handleEditCombo(record)}>
                        Edit
                    </Button>
                    <Button 
                        size="small" 
                        danger 
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCombo(record)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Combo Management</h2>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleCreateCombo}
                    >
                        Create Combo
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={combos}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />

                <ComboForm
                    isModalComboOpen={isModalComboOpen}
                    setIsModalComboOpen={setIsModalComboOpen}
                    currentCombo={currentCombo}
                    loadCombos={loadCombos}
                />

                {/* View Details Modal */}
                <Modal
                    title="Combo Details"
                    open={isDetailsModalOpen}
                    onCancel={() => setIsDetailsModalOpen(false)}
                    footer={null}
                    width={800}
                >
                    {selectedCombo && (
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="ID">{selectedCombo.id}</Descriptions.Item>
                            <Descriptions.Item label="Name">{selectedCombo.name}</Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>{selectedCombo.description}</Descriptions.Item>
                            <Descriptions.Item label="Price">${selectedCombo.comboPrice?.toFixed(2) || '0.00'}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={selectedCombo.active ? 'green' : 'red'}>
                                    {selectedCombo.active ? 'Active' : 'Inactive'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Variants" span={2}>
                                {selectedCombo.items?.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '8px' }}>
                                        <Tag color="blue">Variant ID: {item.productVariantId}</Tag>
                                        <span>Quantity: {item.quantity}</span>
                                    </div>
                                ))}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Modal>

                {/* Update Combo Modal */}
                <UpdateComboModal
                    currentCombo={currentCombo}
                    setCurrentCombo={setCurrentCombo}
                    loadCombos={loadCombos}
                />

                {/* Delete Confirmation Modal */}
                <Modal
                    title="Delete Combo"
                    open={deleteModalVisible}
                    onOk={confirmDelete}
                    onCancel={cancelDelete}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    confirmLoading={loading}
                >
                    <p>Are you sure you want to delete this combo?</p>
                    {comboToDelete && (
                        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                            <p><strong>Name:</strong> {comboToDelete.name}</p>
                            <p><strong>Description:</strong> {comboToDelete.description}</p>
                            <p><strong>Price:</strong> ${comboToDelete.comboPrice?.toFixed(2) || '0.00'}</p>
                            <p><strong>Items:</strong> {comboToDelete.items?.length || 0} variants</p>
                        </div>
                    )}
                    <p style={{ color: 'red', marginTop: '16px' }}>
                        <strong>Warning:</strong> This action cannot be undone!
                    </p>
                </Modal>
            </div>
        </>
    )
}

export default ComboPage
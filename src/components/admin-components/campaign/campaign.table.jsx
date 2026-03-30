import React, { useState } from 'react';
import { Table, Switch, Popconfirm, notification } from 'antd';
import { DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { deletePreorderCampaignAPI, activatePreorderCampaignAPI, deactivatePreorderCampaignAPI } from '../../../services/api.service';
import CampaignDetail from './campaign.detail';
import UpdateCampaignModal from './update.campaign.modal';
import dayjs from 'dayjs';
import './campaign.css';

const CampaignTable = (props) => {
    const {
        dataCampaigns,
        loadCampaigns,
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
    const [switchLoadingIds, setSwitchLoadingIds] = useState([]);

    // ✅ Gọi API functions từ api.service.js
    const handleToggleStatus = async (record) => {
        const { id, isActive } = record;
        
        setSwitchLoadingIds((prev) => [...prev, id]);

        try {
            if (isActive) {
                await deactivatePreorderCampaignAPI(id);
            } else {
                await activatePreorderCampaignAPI(id);
            }

            await loadCampaigns();
        } catch (error) {
            console.error('Toggle status error:', error);
            notification.error({
                message: 'Error updating status',
                description: error?.message || 'Failed to update campaign status.',
            });
        } finally {
            setSwitchLoadingIds((prev) => prev.filter((loadingId) => loadingId !== id));
        }
    };

    const columns = [
        {
            title: 'STT',
            width: 70,
            render: (_, record, index) => (
                <span className="stt-number">
                    {index + 1 + current * pageSize}
                </span>
            ),
        },
        {
            title: 'Campaign Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => (
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{name}</span>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Fulfillment Date',
            dataIndex: 'fulfillmentDate',
            key: 'fulfillmentDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Preorder Limit',
            dataIndex: 'preorderLimit',
            key: 'preorderLimit',
            align: 'center',
            render: (limit) => (
                <span style={{ fontWeight: 600, color: '#0891b2' }}>
                    {limit?.toLocaleString() || 0}
                </span>
            ),
        },
        {
            title: 'Current Preorders',
            dataIndex: 'currentPreorders',
            key: 'currentPreorders',
            align: 'center',
            render: (current, record) => {
                const percentage =
                    record.preorderLimit > 0
                        ? ((current / record.preorderLimit) * 100).toFixed(1)
                        : 0;
                return (
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#7c3aed' }}>
                            {current?.toLocaleString() || 0}
                        </span>
                        <br />
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {percentage}%
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            align: 'center',
            // ✅ Switch thay cho Tag
            render: (isActive, record) => (
                <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    checked={isActive}
                    loading={switchLoadingIds.includes(record.id)}
                    onChange={() => handleToggleStatus(record)}
                />
            ),
        },
        {
            title: 'Variants',
            key: 'variantsCount',
            align: 'center',
            render: (_, record) => (
                <span style={{ fontWeight: 600, color: '#059669' }}>
                    {record.variantIds?.length || 0}
                </span>
            ),
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
                        title="Delete Campaign"
                        description="Are you sure you want to delete this campaign?"
                        onConfirm={() => handleDeleteCampaign(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <button className="action-btn-icon delete-btn" title="Delete">
                            <DeleteOutlined />
                        </button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const handleDeleteCampaign = async (id) => {
        try {
            await deletePreorderCampaignAPI(id);
            notification.success({
                message: 'Delete Campaign',
                description: 'Campaign deleted successfully',
            });
            await loadCampaigns();
        } catch (error) {
            console.error('Delete campaign error:', error);
            notification.error({
                message: 'Error delete campaign',
                description: error?.message || 'Failed to delete campaign',
            });
        }
    };

    const onChange = (pagination) => {
        if (pagination?.current && pagination.current !== +current + 1) {
            setCurrent(+pagination.current - 1);
        }
        if (pagination?.pageSize && pagination.pageSize !== +pageSize) {
            setPageSize(+pagination.pageSize);
            setCurrent(0);
        }
    };

    return (
        <div
            className="campaign-table-wrapper"
            style={{
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}
        >
            <Table
                className="campaign-table"
                columns={columns}
                dataSource={dataCampaigns}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: current + 1,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    total: total,
                    showTotal: (total, range) => (
                        <span style={{ fontWeight: 500, color: '#64748b' }}>
                            Showing <b>{range[0]}-{range[1]}</b> of {total} campaigns
                        </span>
                    ),
                }}
                onChange={onChange}
            />

            <CampaignDetail
                isVisible={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                campaignId={dataDetail?.id}
            />

            <UpdateCampaignModal
                isUpdateOpen={isUpdateOpen}
                setIsUpdateOpen={setIsUpdateOpen}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                loadCampaigns={loadCampaigns}
            />
        </div>
    );
};

export default CampaignTable;
import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Button, message, Card, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { fetchPreorderCampaignByIdAPI } from '../../../services/api.service';
import dayjs from 'dayjs';

const CampaignDetail = ({ isVisible, onClose, campaignId }) => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isVisible && campaignId) {
            loadCampaignDetail();
        }
    }, [isVisible, campaignId]);

    const loadCampaignDetail = async () => {
        setLoading(true);
        try {
            const res = await fetchPreorderCampaignByIdAPI(campaignId);
            console.log("Campaign detail response:", res);
            
            // Handle different response structures
            let campaignData = res;
            if (res && res.data && !res.id) {
                campaignData = res.data;
            }
            if (res && res.result && !res.id) {
                campaignData = res.result;
            }
            
            setCampaign(campaignData);
        } catch (error) {
            console.error("Error loading campaign detail:", error);
            message.error("Failed to load campaign details");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCampaign(null);
        onClose();
    };

    return (
        <Modal
            title="Campaign Details"
            open={isVisible}
            onCancel={handleClose}
            footer={null}
            width={800}
            loading={loading}
        >
            {campaign && (
                <div>
                    <Card title="Campaign Information" style={{ marginBottom: 16 }}>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Campaign ID">{campaign.id}</Descriptions.Item>
                            <Descriptions.Item label="Campaign Name">{campaign.name}</Descriptions.Item>
                            <Descriptions.Item label="Start Date">
                                {dayjs(campaign.startDate).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="End Date">
                                {dayjs(campaign.endDate).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Fulfillment Date">
                                {dayjs(campaign.fulfillmentDate).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Preorder Limit">
                                {campaign.preorderLimit?.toLocaleString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Current Preorders">
                                <Space>
                                    <span>{campaign.currentPreorders?.toLocaleString() || 0}</span>
                                    {campaign.preorderLimit > 0 && (
                                        <Tag color={campaign.currentPreorders >= campaign.preorderLimit ? 'red' : 'green'}>
                                            {((campaign.currentPreorders / campaign.preorderLimit) * 100).toFixed(1)}%
                                        </Tag>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={campaign.isActive ? 'green' : 'red'}>
                                    {campaign.isActive ? 'Active' : 'Inactive'}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Created Date">
                                {campaign.createdAt ? dayjs(campaign.createdAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Updated Date">
                                {campaign.updatedAt ? dayjs(campaign.updatedAt).format('DD/MM/YYYY HH:mm') : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="Product Variants" style={{ marginBottom: 16 }}>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Total Variants:</strong> {campaign.variantIds?.length || 0}
                        </div>
                        
                        {campaign.variantConfigs && campaign.variantConfigs.length > 0 && (
                            <div>
                                {campaign.variantConfigs.map((config, index) => (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            marginBottom: '12px', 
                                            padding: '12px', 
                                            background: '#f8fafc', 
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                                            Variant #{index + 1}
                                        </div>
                                        <div>
                                            <strong>Variant ID:</strong> {config.variantId}
                                        </div>
                                        <div>
                                            <strong>Deposit Percent:</strong> {config.depositPercent}%
                                        </div>
                                        <div>
                                            <strong>Payment Option:</strong> 
                                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                                {config.preorderPaymentOption}
                                            </Tag>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Progress Overview">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Progress:</span>
                            <span>
                                {campaign.preorderLimit > 0 
                                    ? `${((campaign.currentPreorders / campaign.preorderLimit) * 100).toFixed(1)}%`
                                    : '0%'
                                }
                            </span>
                        </div>
                        <div style={{ 
                            width: '100%', 
                            height: '8px', 
                            background: '#e2e8f0', 
                            borderRadius: '4px',
                            overflow: 'hidden' 
                        }}>
                            <div 
                                style={{ 
                                    width: `${Math.min((campaign.currentPreorders / campaign.preorderLimit) * 100, 100)}%`,
                                    height: '100%',
                                    background: campaign.currentPreorders >= campaign.preorderLimit 
                                        ? '#ef4444' 
                                        : campaign.currentPreorders > 0 
                                            ? '#f59e0b' 
                                            : '#10b981',
                                    transition: 'width 0.3s ease'
                                }}
                            />
                        </div>
                        <div style={{ 
                            fontSize: '12px', 
                            color: '#64748b', 
                            marginTop: '4px',
                            textAlign: 'center'
                        }}>
                            {campaign.currentPreorders} / {campaign.preorderLimit} preorders
                        </div>
                    </Card>
                </div>
            )}
        </Modal>
    );
};

export default CampaignDetail;
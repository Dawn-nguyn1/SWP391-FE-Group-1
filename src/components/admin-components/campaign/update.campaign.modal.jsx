import { Button, Input, Modal, Select, Form, DatePicker, InputNumber, Switch, message, Card, Divider, Tag, Space } from "antd";
import { EditOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { updatePreorderCampaignAPI, fetchVariantsAPI, fetchPreorderCampaignByIdAPI } from '../../../services/api.service';

const UpdateCampaignModal = (props) => {
    const [form] = Form.useForm();
    const { 
        isUpdateOpen, 
        setIsUpdateOpen,
        dataUpdate, 
        setDataUpdate, 
        loadCampaigns 
    } = props;
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([]);
    const [campaignDetail, setCampaignDetail] = useState(null);

    useEffect(() => {
        if (dataUpdate) {
            loadVariants();
            loadCampaignDetail(dataUpdate.id);
        }
    }, [dataUpdate]);

    const loadCampaignDetail = async (campaignId) => {
        try {
            const res = await fetchPreorderCampaignByIdAPI(campaignId);
            console.log("Full campaign detail for update:", res);
            
            // Handle different response structures
            let campaignData = res;
            if (res && res.data && !res.id) {
                campaignData = res.data;
            }
            if (res && res.result && !res.id) {
                campaignData = res.result;
            }

            setCampaignDetail(campaignData);

            // Populate form with current campaign data
            form.setFieldsValue({
                name: campaignData.name,
                startDate: dayjs(campaignData.startDate),
                endDate: dayjs(campaignData.endDate),
                fulfillmentDate: dayjs(campaignData.fulfillmentDate),
                preorderLimit: campaignData.preorderLimit,
                isActive: campaignData.isActive,
                variantConfigs: campaignData.variantConfigs?.map(config => config.variantId) || []
            });
        } catch (error) {
            console.error("Error loading campaign detail for update:", error);
            // Fallback to basic data from table
            form.setFieldsValue({
                name: dataUpdate.name,
                startDate: dayjs(dataUpdate.startDate),
                endDate: dayjs(dataUpdate.endDate),
                fulfillmentDate: dayjs(dataUpdate.fulfillmentDate),
                preorderLimit: dataUpdate.preorderLimit,
                isActive: dataUpdate.isActive,
                variantConfigs: dataUpdate.variantConfigs?.map(config => config.variantId) || []
            });
        }
    };

    const loadVariants = async () => {
        try {
            const res = await fetchVariantsAPI();
            console.log("All variants from API (update):", res);
            if (res) {
                // Chỉ lấy các variant có saleType là PRE_ORDER
                const preorderVariants = res.filter(variant => variant.saleType === 'PRE_ORDER');
                console.log("Preorder variants filtered (update):", preorderVariants);
                setVariants(preorderVariants);
            }
        } catch (error) {
            console.error("Error loading preorder variants (update):", error);
            message.error("Failed to load preorder variants");
        }
    };

    const resetAndCloseModal = () => {
        form.resetFields();
        setIsUpdateOpen(false);
        setDataUpdate(null);
        setCampaignDetail(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Update campaign form values:', values);
            
            // Convert dates to YYYY-MM-DD format
            const campaignData = {
                name: values.name,
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD'),
                fulfillmentDate: values.fulfillmentDate.format('YYYY-MM-DD'),
                preorderLimit: values.preorderLimit,
                isActive: values.isActive || false,
                variantConfigs: values.variantConfigs ? values.variantConfigs.map(variantId => ({
                    variantId: variantId,
                    depositPercent: 30, // Default deposit percent
                    preorderPaymentOption: "DEPOSIT_ONLY"
                })) : []
            };

            // Update campaign
            await updatePreorderCampaignAPI(dataUpdate.id, campaignData);
            message.success("Campaign updated successfully!");
            
            loadCampaigns(); // Reload campaign table
            resetAndCloseModal();
        } catch (error) {
            console.error("Error updating campaign:", error);
            message.error("Failed to update campaign");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = errorInfo => {
        console.log('Update failed:', errorInfo);
    };

    return (
        <Modal
            title="Update Preorder Campaign"
            open={isUpdateOpen}
            onCancel={resetAndCloseModal}
            footer={null}
            width={700}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

                :root {
                    --cyan: #0891b2;
                    --violet: #7c3aed;
                    --white: #ffffff;
                    --ink: #1e1b4b;
                    --border: rgba(124,58,237,0.15);
                }

                .ant-modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                }

                .ant-modal-header {
                    background: linear-gradient(135deg, var(--cyan), var(--violet));
                    border: none;
                    padding: 20px 24px;
                }

                .ant-modal-title {
                    color: white;
                    font-family: 'Sora', sans-serif;
                    font-weight: 700;
                    font-size: 18px;
                }

                .ant-modal-body {
                    padding: 24px;
                }

                .ant-form-item-label > label {
                    font-family: 'Sora', sans-serif;
                    font-weight: 600;
                    color: var(--ink);
                }

                .ant-input, .ant-select-selector, .ant-picker {
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    transition: all 0.3s ease;
                }

                .ant-input:hover, .ant-select-selector:hover, .ant-picker:hover {
                    border-color: var(--violet);
                }

                .ant-input:focus, .ant-select-focused .ant-select-selector, .ant-picker:focus {
                    border-color: var(--violet);
                    box-shadow: 0 0 0 2px rgba(124,58,237,0.1);
                }

                .update-campaign-info-card {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                    border: 1px solid #0891b2;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .update-campaign-info-card .ant-card-head {
                    background: transparent;
                    border-bottom: 1px solid #0891b2;
                }

                .update-campaign-info-card .ant-card-head-title {
                    color: #0891b2;
                    font-weight: 600;
                    font-family: 'Sora', sans-serif;
                }

                .update-campaign-info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid rgba(8,145,178,0.1);
                }

                .update-campaign-info-item:last-child {
                    border-bottom: none;
                }

                .update-campaign-info-label {
                    font-weight: 600;
                    color: #1e293b;
                }

                .update-campaign-info-value {
                    color: #64748b;
                }

                .update-campaign-progress {
                    width: 100%;
                    height: 8px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 4px;
                }

                .update-campaign-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0891b2, #7c3aed);
                    transition: width 0.3s ease;
                }
            `}</style>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    name="name"
                    label="Campaign Name"
                    rules={[{ required: true, message: 'Please enter campaign name' }]}
                >
                    <Input placeholder="Enter campaign name" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[{ required: true, message: 'Please select end date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    name="fulfillmentDate"
                    label="Fulfillment Date"
                    rules={[{ required: true, message: 'Please select fulfillment date' }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="preorderLimit"
                        label="Preorder Limit"
                        rules={[{ required: true, message: 'Please enter preorder limit' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            min={1}
                            style={{ width: '100%' }}
                            placeholder="Enter preorder limit"
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Status"
                        valuePropName="checked"
                        style={{ flex: 1 }}
                    >
                        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="variantConfigs"
                    label="Product Variants"
                    rules={[{ required: true, message: 'Please select at least one product variant' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select product variants"
                        style={{ width: '100%' }}
                    >
                        {variants.map(variant => (
                            <Select.Option key={variant.id} value={variant.id}>
                                {variant.sku} - {variant.productName}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                    <Button onClick={resetAndCloseModal}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{
                            background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                            height: '40px',
                            padding: '0 20px',
                        }}
                    >
                        Update Campaign
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateCampaignModal;
import { Button, Input, Modal, Select, Form, DatePicker, InputNumber, Switch, message, Card, Divider, Tag, Space } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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
    const [selectedVariants, setSelectedVariants] = useState([]);

    useEffect(() => {
        if (dataUpdate) {
            loadVariants();
            loadCampaignDetail(dataUpdate.id);
        }
    }, [dataUpdate]);

    // Update selectedVariants when campaignDetail changes
    useEffect(() => {
        if (campaignDetail && campaignDetail.variantConfigs) {
            const formattedVariants = campaignDetail.variantConfigs.map(config => ({
                variantId: config.variantId,
                depositPercent: config.depositPercent || 30,
                preorderPaymentOption: config.preorderPaymentOption || "DEPOSIT_ONLY"
            }));
            setSelectedVariants(formattedVariants);
        }
    }, [campaignDetail]);

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
                isActive: campaignData.isActive
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
                isActive: dataUpdate.isActive
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
        setSelectedVariants([]);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Update campaign form values:', values);
            
            // Validate selected variants
            if (selectedVariants.length === 0) {
                message.error('Please add at least one product variant');
                setLoading(false);
                return;
            }

            // Check for duplicate variants
            const variantIds = selectedVariants.map(v => v.variantId).filter(Boolean);
            const uniqueVariantIds = [...new Set(variantIds)];
            if (variantIds.length !== uniqueVariantIds.length) {
                message.error('Duplicate product variants are not allowed');
                setLoading(false);
                return;
            }

            // Validate each variant
            for (const variant of selectedVariants) {
                if (!variant.variantId) {
                    message.error('Please select a product variant for all items');
                    setLoading(false);
                    return;
                }

                if (variant.preorderPaymentOption !== 'FULL_ONLY') {
                    if (variant.depositPercent === null || variant.depositPercent === undefined || variant.depositPercent === '') {
                        message.error('Deposit percent is required for this payment option');
                        setLoading(false);
                        return;
                    }
                    if (variant.depositPercent < 0 || variant.depositPercent > 100) {
                        message.error('Deposit percent must be between 0 and 100');
                        setLoading(false);
                        return;
                    }
                }
            }

            // Validate dates
            if (values.startDate && values.endDate) {
                if (values.startDate.isAfter(values.endDate)) {
                    message.error('Start date must be before or equal to end date');
                    setLoading(false);
                    return;
                }
            }

            if (values.endDate && values.fulfillmentDate) {
                if (values.fulfillmentDate.isBefore(values.endDate)) {
                    message.error('Fulfillment date must be after or equal to end date');
                    setLoading(false);
                    return;
                }
            }

            // Validate preorder limit
            if (values.preorderLimit !== null && values.preorderLimit !== undefined && values.preorderLimit < 0) {
                message.error('Preorder limit must be greater than or equal to 0');
                setLoading(false);
                return;
            }

            // Build variant configs with deposit percent and payment options
            const variantConfigs = selectedVariants.map(variant => ({
                variantId: variant.variantId,
                depositPercent: variant.preorderPaymentOption === 'FULL_ONLY' ? null : (variant.depositPercent || 30),
                preorderPaymentOption: variant.preorderPaymentOption || "DEPOSIT_ONLY"
            }));

            // Convert dates to YYYY-MM-DD format
            const campaignData = {
                name: values.name,
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD'),
                fulfillmentDate: values.fulfillmentDate.format('YYYY-MM-DD'),
                preorderLimit: values.preorderLimit,
                isActive: values.isActive || false,
                variantConfigs: variantConfigs
            };

            console.log('Campaign data to update:', campaignData);

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

    const addVariant = () => {
        setSelectedVariants([...selectedVariants, {
            variantId: null,
            depositPercent: 30,
            preorderPaymentOption: "DEPOSIT_ONLY"
        }]);
    };

    const removeVariant = (index) => {
        const newVariants = selectedVariants.filter((_, i) => i !== index);
        setSelectedVariants(newVariants);
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...selectedVariants];
        newVariants[index][field] = value;
        setSelectedVariants(newVariants);
    };

    return (
        <Modal
            title="Update Preorder Campaign"
            open={isUpdateOpen}
            onCancel={resetAndCloseModal}
            footer={null}
            width={800}
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

                .variant-card {
                    margin-bottom: 16px;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 16px;
                }

                .variant-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .variant-title {
                    font-weight: 600;
                    color: var(--ink);
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
                        <DatePicker 
                            style={{ width: '100%' }} 
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[{ required: true, message: 'Please select end date' }]}
                        style={{ flex: 1 }}
                    >
                        <DatePicker 
                            style={{ width: '100%' }} 
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="fulfillmentDate"
                    label="Fulfillment Date"
                    rules={[{ required: true, message: 'Please select fulfillment date' }]}
                >
                    <DatePicker 
                        style={{ width: '100%' }} 
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
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

                <Form.Item label="Product Variants">
                    {selectedVariants.map((variant, index) => (
                        <Card key={index} className="variant-card" size="small">
                            <div className="variant-header">
                                <div className="variant-title">Variant {index + 1}</div>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeVariant(index)}
                                />
                            </div>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Form.Item
                                    label="Select Variant"
                                    required
                                    validateStatus={!variant.variantId ? 'error' : ''}
                                    help={!variant.variantId ? 'Please select a variant' : ''}
                                >
                                    <Select
                                        placeholder="Select product variant"
                                        value={variant.variantId}
                                        onChange={(value) => updateVariant(index, 'variantId', value)}
                                        style={{ width: '100%' }}
                                    >
                                        {variants.map(v => (
                                            <Select.Option key={v.id} value={v.id}>
                                                {v.sku} - {v.productName}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item label="Deposit Percent (%)">
                                    <InputNumber
                                        min={0}
                                        max={100}
                                        placeholder="Enter deposit percent"
                                        value={variant.preorderPaymentOption === 'FULL_ONLY' ? 100 : (variant.depositPercent || 30)}
                                        onChange={(value) => updateVariant(index, 'depositPercent', value)}
                                        style={{ width: '100%' }}
                                        disabled={variant.preorderPaymentOption === 'FULL_ONLY'}
                                    />
                                </Form.Item>
                                <Form.Item label="Payment Option">
                                    <Select
                                        placeholder="Select payment option"
                                        value={variant.preorderPaymentOption}
                                        onChange={(value) => updateVariant(index, 'preorderPaymentOption', value)}
                                        style={{ width: '100%' }}
                                    >
                                        <Select.Option value="DEPOSIT_ONLY">Deposit Only</Select.Option>
                                        <Select.Option value="FULL_ONLY">Full Payment Only</Select.Option>
                                        <Select.Option value="FLEXIBLE">Flexible</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Space>
                        </Card>
                    ))}
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addVariant}
                        style={{ width: '100%' }}
                    >
                        Add Variant
                    </Button>
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
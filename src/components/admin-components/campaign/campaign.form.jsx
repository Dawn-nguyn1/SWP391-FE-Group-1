import { Button, Input, Modal, Select, Form, DatePicker, InputNumber, Switch, message, Card, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { createPreorderCampaignAPI, fetchVariantsAPI } from '../../../services/api.service';

const CampaignForm = (props) => {
    const { loadCampaigns } = props;
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([]);
    const [selectedVariants, setSelectedVariants] = useState([]);

    useEffect(() => {
        if (isModalOpen) {
            loadVariants();
            form.resetFields();
            setSelectedVariants([]);
        }
    }, [isModalOpen, form]);

    const loadVariants = async () => {
        try {
            const res = await fetchVariantsAPI();
            console.log("All variants from API:", res);
            if (res) {
                // Chỉ lấy các variant có saleType là PRE_ORDER
                const preorderVariants = res.filter(variant => variant.saleType === 'PRE_ORDER');
                console.log("Preorder variants filtered:", preorderVariants);
                setVariants(preorderVariants);
            }
        } catch (error) {
            console.error("Error loading preorder variants:", error);
            message.error("Failed to load preorder variants");
        }
    };

    const resetAndCloseModal = () => {
        form.resetFields();
        setSelectedVariants([]);
        setIsModalOpen(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Create campaign form values:', values);
            
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

            console.log('Campaign data to send:', campaignData);

            // Create campaign
            await createPreorderCampaignAPI(campaignData);
            message.success("Campaign created successfully!");
            
            loadCampaigns();
            resetAndCloseModal();
        } catch (error) {
            console.error("Error creating campaign:", error);
            message.error("Failed to create campaign");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    const handleCreateCampaign = () => {
        form.resetFields();
        setSelectedVariants([]);
        setIsModalOpen(true);
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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');

                :root {
                    --cyan: #0891b2;
                    --violet: #7c3aed;
                    --white: #ffffff;
                    --ink: #1e1b4b;
                    --border: rgba(124,58,237,0.15);
                }

                .cf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    background: var(--white);
                    border-radius: 14px;
                    border: 1px solid var(--border);
                    box-shadow: 0 2px 12px rgba(8,145,178,0.06);
                    margin: 10px 0;
                }

                .cf-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--ink);
                    letter-spacing: -0.3px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .cf-title::before {
                    content: '';
                    width: 4px;
                    height: 24px;
                    background: linear-gradient(135deg, var(--cyan), var(--violet));
                    border-radius: 2px;
                }

                .cf-create-btn {
                    background: linear-gradient(135deg, var(--cyan), var(--violet));
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    height: 38px;
                    padding: 0 16px;
                    font-family: 'Sora', sans-serif;
                    transition: all 0.3s ease;
                }

                .cf-create-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(124,58,237,0.25);
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

            <div className="cf-header">
                <div className="cf-title">Create New Campaign</div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreateCampaign}
                    className="cf-create-btn"
                >
                    Add Campaign
                </Button>
            </div>

            <Modal
                title="Create Preorder Campaign"
                open={isModalOpen}
                onCancel={resetAndCloseModal}
                footer={null}
                width={800}
            >
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

                    <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date' }]}
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
                    >
                        <DatePicker 
                            style={{ width: '100%' }} 
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

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

                    <Form.Item
                        name="preorderLimit"
                        label="Preorder Limit"
                        rules={[{ required: true, message: 'Please enter preorder limit' }]}
                    >
                        <InputNumber
                            min={1}
                            placeholder="Enter preorder limit"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Active Status"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>

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
                                            placeholder="Search and select product variant"
                                            value={variant.variantId}
                                            onChange={(value) => updateVariant(index, 'variantId', value)}
                                            style={{ width: '100%' }}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={variants.map(v => ({
                                                value: v.id,
                                                label: `${v.sku} - ${v.productName}`
                                            }))}
                                        />
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

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
                            Submit
                        </Button>
                        <Button onClick={resetAndCloseModal}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default CampaignForm;
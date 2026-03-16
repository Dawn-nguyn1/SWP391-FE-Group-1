import { Button, Input, Modal, Select, Form, message } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { createComboAPI, fetchVariantsAPI } from '../../../services/api.service';

const ComboForm = (props) => {
    const { loadCombos } = props;
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if (isModalOpen) {
            loadVariants();
            form.resetFields();
        }
    }, [isModalOpen, form]);

    const loadVariants = async () => {
        try {
            const res = await fetchVariantsAPI();
            if (res) {
                setVariants(res);
            }
        } catch (error) {
            message.error("Failed to load variants");
        }
    };

    const resetAndCloseModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Combo form values:', values);
            
            // Create combo
            await createComboAPI(values.name, values.description, values.imageUrl, values.items || []);
            message.success("Combo created successfully!");
            
            loadCombos();
            resetAndCloseModal();
        } catch (error) {
            console.error("Error creating combo:", error);
            message.error("Failed to create combo");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    const handleCreateCombo = () => {
        form.resetFields();
        setIsModalOpen(true);
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
                    width: 4px; height: 20px;
                    border-radius: 99px;
                    background: linear-gradient(180deg, var(--cyan), var(--violet));
                    display: inline-block;
                }

                .cf-create-btn.ant-btn {
                    background: linear-gradient(135deg, var(--cyan) 0%, var(--violet) 100%) !important;
                    border: none !important;
                    border-radius: 10px !important;
                    height: 38px !important;
                    padding: 0 20px !important;
                    font-family: 'Sora', sans-serif !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                    color: #fff !important;
                    box-shadow: 0 4px 14px rgba(124,58,237,0.3) !important;
                    transition: all 0.25s ease !important;
                }

                .cf-create-btn.ant-btn:hover {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 6px 20px rgba(124,58,237,0.4) !important;
                    opacity: 0.9 !important;
                }
            `}</style>

            <div className="cf-header">
                <span className="cf-title">Table Combos</span>
                <Button 
                    className="cf-create-btn" 
                    onClick={handleCreateCombo} 
                    type="primary"
                    icon={<PlusOutlined />}
                >
                    + Create Combo
                </Button>
            </div>

            <Modal
                title="Create Combo"
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText="Create"
                confirmLoading={loading}
                width={800}
            >
                <Form
                    form={form}
                    name="comboForm"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Combo Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input combo name!' }]}
                    >
                        <Input placeholder="Enter combo name" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please input description!' }]}
                    >
                        <Input.TextArea 
                            placeholder="Enter combo description" 
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Image URL"
                        name="imageUrl"
                        rules={[
                            { required: true, message: 'Image URL không được để trống!' },
                            { max: 255, message: 'Image URL không được vượt quá 255 ký tự!' },
                            { type: 'url', message: 'Định dạng URL không hợp lệ!' }
                        ]}
                    >
                        <Input 
                            placeholder="Enter image URL (e.g., https://example.com/image.jpg)" 
                        />
                    </Form.Item>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'variantId']}
                                            rules={[{ required: true, message: 'Select product variant!' }]}
                                            style={{ flex: 1 }}
                                        >
                                            <Select
                                                placeholder="Select product variant"
                                                showSearch
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                {variants.map(variant => (
                                                    <Select.Option key={variant.id} value={variant.id}>
                                                        {variant.product?.name || 'Unknown Product'} - {variant.sku}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'quantity']}
                                            rules={[{ required: true, message: 'Enter quantity!' }]}
                                        >
                                            <Input 
                                                type="number" 
                                                min={1}
                                                placeholder="Qty"
                                                style={{ width: '80px' }}
                                            />
                                        </Form.Item>
                                        <Button 
                                            type="link" 
                                            onClick={() => remove(name)}
                                            danger
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button 
                                        type="dashed" 
                                        onClick={() => add()} 
                                        block 
                                        icon={<PlusOutlined />}
                                    >
                                        Add Product Variant
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form>
            </Modal>
        </>
    )
}

export default ComboForm;
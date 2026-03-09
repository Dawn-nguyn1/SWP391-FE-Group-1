import { Button, Input, Modal, Select, Form, message } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { createComboAPI, fetchVariantsAPI } from '../../../services/api.service';

const ComboForm = (props) => {
    const [form] = Form.useForm();
    const { isModalComboOpen, setIsModalComboOpen, loadCombos } = props;
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if (isModalComboOpen) {
            loadVariants();
            form.resetFields();
        }
    }, [isModalComboOpen, form]);

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
        setIsModalComboOpen(false);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Combo form values:', values);
            
            // Create combo
            await createComboAPI(values.name, values.description, values.items || []);
            message.success("Combo created successfully!");
            
            loadCombos(); // Reload combo table
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

    return (
        <div className="user-form" style={{ margin: "10px 0" }}>
            <Modal
                title="Create Combo"
                open={isModalComboOpen}
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
        </div>
    )
}

export default ComboForm;
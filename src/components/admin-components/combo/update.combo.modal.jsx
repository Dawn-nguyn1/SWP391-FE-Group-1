import { Button, Input, Modal, Select, Form, message } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { updateComboAPI, fetchVariantsAPI } from '../../../services/api.service';

const UpdateComboModal = (props) => {
    const [form] = Form.useForm();
    const { 
        isUpdateOpen, 
        setIsUpdateOpen,
        dataUpdate, 
        setDataUpdate, 
        loadCombos 
    } = props;
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if (dataUpdate) {
            loadVariants();
            // Populate form with current combo data
            form.setFieldsValue({
                name: dataUpdate.name,
                description: dataUpdate.description,
                imageUrl: dataUpdate.imageUrl || '',
                items: dataUpdate.items?.map(item => ({
                    variantId: item.productVariantId,
                    quantity: item.quantity
                })) || []
            });
        }
    }, [dataUpdate, form]);

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
        setIsUpdateOpen(false);
        setDataUpdate(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('Update combo form values:', values);
            
            // Update combo
            await updateComboAPI(dataUpdate.id, values.name, values.description, values.imageUrl, values.items || []);
            message.success("Combo updated successfully!");
            
            loadCombos(); // Reload combo table
            resetAndCloseModal();
        } catch (error) {
            console.error("Error updating combo:", error);
            message.error("Failed to update combo");
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    return (
        <Modal
            title="Update Combo"
            open={isUpdateOpen}
            onOk={() => form.submit()}
            onCancel={() => resetAndCloseModal()}
            maskClosable={false}
            okText="Update"
            confirmLoading={loading}
            width={800}
        >
            <Form
                form={form}
                name="updateComboForm"
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
                    rules={[{ required: false, message: 'Please input image URL!' }]}
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
    )
}

export default UpdateComboModal;
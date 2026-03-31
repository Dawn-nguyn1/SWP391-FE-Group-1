import { Button, Input, Modal, Select, Form, message, Card, Divider, Tag, Space } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { updateComboAPI, fetchVariantsAPI, fetchComboByIdAPI } from '../../../services/api.service';

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
    const [comboDetail, setComboDetail] = useState(null);

    useEffect(() => {
        if (dataUpdate) {
            loadVariants();
            loadComboDetail(dataUpdate.id);
        }
    }, [dataUpdate]);

    const loadComboDetail = async (comboId) => {
        try {
            const res = await fetchComboByIdAPI(comboId);
            console.log("Full combo detail:", res);
            
            // Handle different response structures
            let comboData = res;
            if (res && res.data && !res.id) {
                comboData = res.data;
            }
            if (res && res.result && !res.id) {
                comboData = res.result;
            }

            setComboDetail(comboData);

            // Populate form with current combo data
            form.setFieldsValue({
                name: comboData.name,
                description: comboData.description,
                imageUrl: comboData.imageUrl || '',
                items: comboData.items?.map(item => ({
                    variantId: item.productVariantId,
                    quantity: item.quantity
                })) || []
            });
        } catch (error) {
            console.error("Error loading combo detail:", error);
            // Fallback to basic data from table
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
    };

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
        setComboDetail(null);
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
                                                    {variant.product?.name || variant.productName || 'Unknown Product'} - {variant.sku}
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

                {/* Display existing attributes and images */}
                {comboDetail?.items?.some(item => item.attributes && item.attributes.length > 0) && (
                    <Divider>Current Attributes & Images</Divider>
                )}
                {comboDetail?.items?.map((item, index) => (
                    item.attributes && item.attributes.length > 0 && (
                        <Card key={index} size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                                Variant ID: {item.productVariantId} | Quantity: {item.quantity}
                            </div>
                            {item.attributes.map((attr, attrIndex) => (
                                <div key={attrIndex} style={{ marginBottom: 12 }}>
                                    <Tag color="purple">{attr.attributeName}</Tag>
                                    <span style={{ marginLeft: 8 }}>{attr.attributeValue}</span>
                                    
                                    {attr.images && attr.images.length > 0 && (
                                        <div style={{ marginTop: 8 }}>
                                            <div style={{ fontSize: '12px', color: '#999', marginBottom: 4 }}>Images:</div>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                {attr.images.map((img, imgIndex) => (
                                                    <div key={imgIndex} style={{ textAlign: 'center' }}>
                                                        <img 
                                                            src={img.imageUrl} 
                                                            alt={`${attr.attributeName} ${attr.attributeValue}`}
                                                            style={{ 
                                                                width: '50px', 
                                                                height: '50px', 
                                                                objectFit: 'cover',
                                                                border: '1px solid #e0e0e0',
                                                                borderRadius: '4px'
                                                            }} 
                                                        />
                                                        <div style={{ fontSize: '10px', color: '#666', marginTop: 2 }}>
                                                            Order: {img.sortOrder}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </Card>
                    )
                ))}
            </Form>
        </Modal>
    )
}

export default UpdateComboModal;
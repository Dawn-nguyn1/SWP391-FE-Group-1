import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Steps, message, Card, Space, Divider, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { createProductAPI, createVariantAPI, createAttributeAPI } from '../../services/api.service';

const { Step } = Steps;

const ProductForm = ({ isModalOpen, setIsModalOpen, loadProducts }) => {
    const [form] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Store product ID after step 1
    const [createdProductId, setCreatedProductId] = useState(null);

    // Reset form when closing
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setCurrentStep(0);
        setCreatedProductId(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // STEP 1: CREATE PRODUCT (If not created yet)
            let productId = createdProductId;
            if (!productId) {
                const resProduct = await createProductAPI(
                    values.name,
                    values.description,
                    values.brandName,
                    values.productImage
                );

                if (resProduct && resProduct.id) {
                    productId = resProduct.id;
                    setCreatedProductId(productId);
                } else {
                    throw new Error("Failed to create product");
                }
            }

            // IF JUST STEP 1, MOVE TO STEP 2
            // logic here: actually we want to submit EVERYTHING at the end, 
            // but the UI flow might be better as a Wizard or just a big form. 
            // Given the requirement "single JSON payload structure" from user 
            // but "sequential API" from docs, let's process the variants now.

            if (values.variants && values.variants.length > 0) {
                for (const variant of values.variants) {
                    // STEP 2: CREATE VARIANT
                    const resVariant = await createVariantAPI(
                        productId,
                        variant.sku,
                        variant.price,
                        variant.stockQuantity
                    );

                    if (resVariant && resVariant.id) {
                        const variantId = resVariant.id;

                        // STEP 3: CREATE ATTRIBUTES FOR THIS VARIANT
                        if (variant.attributes && variant.attributes.length > 0) {
                            for (const attr of variant.attributes) {
                                await createAttributeAPI(
                                    variantId,
                                    attr.attributeName,
                                    attr.attributeValue
                                );
                            }
                        }
                    }
                }
            }

            message.success("Product created successfully!");
            handleCancel();
            await loadProducts();

        } catch (error) {
            console.error(error);
            message.error("Failed to create product process");
        }
        setLoading(false);
    };

    return (
        <Modal
            title="Create New Product"
            open={isModalOpen}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            width={800}
            confirmLoading={loading}
            okText="Create Product"
        >
            <Form
                form={form}
                layout="vertical"
                name="product_form"
                onFinish={onFinish}
                initialValues={{ variants: [{}] }}
            >
                {/* PRODUCT INFO */}
                <Divider orientation="left">Product Info</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Product Name"
                            rules={[{ required: true, message: 'Please input product name!' }]}
                        >
                            <Input placeholder="e.g. Rayban Aviator" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="brandName"
                            label="Brand"
                            rules={[{ required: true, message: 'Please input brand!' }]}
                        >
                            <Input placeholder="e.g. Rayban" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="productImage"
                    label="Image URL"
                    rules={[{ required: true, message: 'Please input image URL!' }]}
                >
                    <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={2} />
                </Form.Item>

                {/* VARIANTS */}
                <Divider orientation="left">Variants</Divider>
                <Form.List name="variants">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Card
                                    key={key}
                                    size="small"
                                    title={`Variant #${name + 1}`}
                                    extra={<MinusCircleOutlined onClick={() => remove(name)} />}
                                    style={{ marginBottom: 16, background: '#fafafa' }}
                                >
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'sku']}
                                                label="SKU"
                                                rules={[{ required: true, message: 'Missing SKU' }]}
                                            >
                                                <Input placeholder="SKU-001" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                label="Price"
                                                rules={[{ required: true, message: 'Missing price' }]}
                                            >
                                                <InputNumber style={{ width: '100%' }} formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'stockQuantity']}
                                                label="Stock"
                                                rules={[{ required: true, message: 'Missing stock' }]}
                                            >
                                                <InputNumber style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* ATTRIBUTES PER VARIANT */}
                                    <Form.List name={[name, 'attributes']}>
                                        {(attrFields, { add: addAttr, remove: removeAttr }) => (
                                            <>
                                                {attrFields.map(({ key: attrKey, name: attrName, ...attrRestField }) => (
                                                    <Space key={attrKey} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                        <Form.Item
                                                            {...attrRestField}
                                                            name={[attrName, 'attributeName']}
                                                            rules={[{ required: true, message: 'Missing Name' }]}
                                                        >
                                                            <Input placeholder="Attr Name (e.g Color)" />
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...attrRestField}
                                                            name={[attrName, 'attributeValue']}
                                                            rules={[{ required: true, message: 'Missing Value' }]}
                                                        >
                                                            <Input placeholder="Value (e.g Black)" />
                                                        </Form.Item>
                                                        <MinusCircleOutlined onClick={() => removeAttr(attrName)} />
                                                    </Space>
                                                ))}
                                                <Form.Item>
                                                    <Button type="dashed" onClick={() => addAttr()} block icon={<PlusOutlined />}>
                                                        Add Attribute (Color, Size...)
                                                    </Button>
                                                </Form.Item>
                                            </>
                                        )}
                                    </Form.List>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add New Variant
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default ProductForm;

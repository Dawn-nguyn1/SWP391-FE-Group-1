import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Steps, message, Card, Space, Divider, Row, Col, notification } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
    createProductAPI, createVariantAPI, createAttributeAPI,
    fetchProductByIdAPI,
    updateProductAPI, updateVariantAPI, updateAttributeAPI,
    deleteVariantAPI, deleteAttributeAPI
} from '../../services/api.service';

const ProductForm = (props) => {
    const { isModalOpen, setIsModalOpen, loadProducts, dataUpdate, setDataUpdate } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [createdProductId, setCreatedProductId] = useState(null);

    useEffect(() => {
        if (isModalOpen) {
            if (dataUpdate) {
                // Load details for edit
                loadProductDetail(dataUpdate.id);
            } else {
                // Create mode: reset
                form.resetFields();
                setCreatedProductId(null);
            }
        }
    }, [isModalOpen, dataUpdate]);

    const loadProductDetail = async (id) => {
        try {
            const res = await fetchProductByIdAPI(id);
            if (res && res.id) {
                // Transform data to match form structure
                // API returns variants: [ {id, sku, ..., variantAttributeRequestDTOList: [] } ]
                // Form expects: variants: [ {sku, ..., attributes: [] } ]

                const formattedVariants = res.variants?.map(v => ({
                    id: v.id, // Keep ID for update
                    sku: v.sku,
                    price: v.price,
                    stockQuantity: v.stockQuantity,
                    attributes: v.variantAttributeRequestDTOList?.map(a => ({
                        id: a.id, // Keep ID for update
                        attributeName: a.attributeName,
                        attributeValue: a.attributeValue
                    }))
                }));

                form.setFieldsValue({
                    name: res.name,
                    brandName: res.brandName,
                    productImage: res.productImage,
                    description: res.description,
                    variants: formattedVariants
                });
            }
        } catch (error) {
            notification.error({ message: "Error loading detail" });
        }
    }

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setCreatedProductId(null);
        if (setDataUpdate) setDataUpdate(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (dataUpdate) {
                // === UPDATE MODE === (Simplified: Update Product + Existing Variants)
                await updateProductAPI(dataUpdate.id, values.name, values.description, values.brandName, values.productImage);

                if (values.variants && values.variants.length > 0) {
                    for (const variant of values.variants) {
                        if (variant.id) {
                            // Update existing variant
                            await updateVariantAPI(variant.id, variant.sku, variant.price, variant.stockQuantity);

                            // Update attributes
                            if (variant.attributes) {
                                for (const attr of variant.attributes) {
                                    if (attr.id) {
                                        await updateAttributeAPI(attr.id, attr.attributeName, attr.attributeValue);
                                    } else {
                                        // New attribute on existing variant
                                        await createAttributeAPI(variant.id, attr.attributeName, attr.attributeValue);
                                    }
                                }
                            }
                        } else {
                            // New variant on existing product
                            const resVar = await createVariantAPI(dataUpdate.id, variant.sku, variant.price, variant.stockQuantity);
                            if (resVar && resVar.id) {
                                if (variant.attributes) {
                                    for (const attr of variant.attributes) {
                                        await createAttributeAPI(resVar.id, attr.attributeName, attr.attributeValue);
                                    }
                                }
                            }
                        }
                    }
                }
                message.success("Product updated successfully!");

            } else {
                // === CREATE MODE ===
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

                if (values.variants && values.variants.length > 0) {
                    for (const variant of values.variants) {
                        const resVariant = await createVariantAPI(
                            productId,
                            variant.sku,
                            variant.price,
                            variant.stockQuantity
                        );

                        if (resVariant && resVariant.id) {
                            const variantId = resVariant.id;
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
            }

            handleCancel();
            await loadProducts();

        } catch (error) {
            console.error(error);
            message.error("Failed to save product");
        }
        setLoading(false);
    };

    return (
        <Modal
            title={dataUpdate ? "Update Product" : "Create New Product"}
            open={isModalOpen}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            width={800}
            confirmLoading={loading}
            okText={dataUpdate ? "Update" : "Create"}
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

                                    extra={
                                        <MinusCircleOutlined
                                            onClick={() => {
                                                const variant = form.getFieldValue(['variants', name]);
                                                if (variant && variant.id) {
                                                    Modal.confirm({
                                                        title: 'Delete Variant',
                                                        content: 'Are you sure you want to delete this variant? This cannot be undone.',
                                                        onOk: async () => {
                                                            try {
                                                                await deleteVariantAPI(variant.id);
                                                                message.success('Variant deleted');
                                                                remove(name);
                                                            } catch (e) {
                                                                message.error('Failed to delete variant');
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    remove(name);
                                                }
                                            }}
                                        />
                                    }
                                    style={{ marginBottom: 16, background: '#fafafa' }}
                                >
                                    {/* HIDDEN ID FIELD FOR UPDATE */}
                                    <Form.Item name={[name, 'id']} hidden><Input /></Form.Item>

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
                                                        <Form.Item name={[attrName, 'id']} hidden><Input /></Form.Item>

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
                                                        <MinusCircleOutlined
                                                            onClick={() => {
                                                                const attribute = form.getFieldValue(['variants', name, 'attributes', attrName]);
                                                                if (attribute && attribute.id) {
                                                                    // Delete API
                                                                    Modal.confirm({
                                                                        title: 'Delete Attribute',
                                                                        content: 'Are you sure?',
                                                                        onOk: async () => {
                                                                            try {
                                                                                await deleteAttributeAPI(attribute.id);
                                                                                message.success('Attribute deleted');
                                                                                removeAttr(attrName);
                                                                            } catch (e) {
                                                                                message.error('Failed to delete attribute');
                                                                            }
                                                                        }
                                                                    });
                                                                } else {
                                                                    removeAttr(attrName);
                                                                }
                                                            }}
                                                        />
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

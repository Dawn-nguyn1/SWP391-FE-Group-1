import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Steps, message, Card, Space, Divider, Row, Col, notification, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
    createProductAPI, createVariantAPI, createAttributeAPI,
    addImagesToAttributeAPI
} from '../../../services/api.service';

const ProductForm = (props) => {
    const { isCreateOpen, setIsCreateOpen, loadProducts } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [createdProductId, setCreatedProductId] = useState(null);

    useEffect(() => {
        if (isCreateOpen) {
            // Create mode: reset form
            form.resetFields();
            setCreatedProductId(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCreateOpen]);

    const handleCancel = () => {
        setIsCreateOpen(false);
        form.resetFields();
        setCreatedProductId(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // === CREATE MODE ===
            let productId = createdProductId;
            if (!productId) {
                const resProduct = await createProductAPI(
                    values.name,
                    values.description,
                    values.brandName,
                    values.productImage
                );
                console.log("Product creation data:", {
                    name: values.name,
                    description: values.description,
                    brandName: values.brandName,
                    productImage: values.productImage
                });

                if (resProduct && resProduct.id) {
                    productId = resProduct.id;
                    setCreatedProductId(productId);
                } else {
                    throw new Error("Failed to create product");
                }
            }

            if (values.variants && values.variants.length > 0) {
                for (const variant of values.variants) {
                    // Ensure saleType is provided, fallback to IN_STOCK only if undefined/null
                    const saleType = variant.saleType || 'IN_STOCK';
                    
                    const resVariant = await createVariantAPI(
                        productId,
                        variant.sku,
                        variant.price,
                        variant.stockQuantity,
                        saleType
                    );

                    if (resVariant && resVariant.id) {
                        const variantId = resVariant.id;
                        if (variant.attributes) {
                            for (const attr of variant.attributes) {
                                // Tránh gọi API với attribute rỗng → backend trả 400 (BAD_REQUEST)
                                const attributeName = (attr?.attributeName ?? "").toString().trim();
                                const attributeValue = (attr?.attributeValue ?? "").toString().trim();
                                if (!attributeName || !attributeValue) continue;

                                // Create attribute with images
                                const resAttr = await createAttributeAPI(
                                    variantId,
                                    attributeName,
                                    attributeValue,
                                    attr.images || []
                                );

                                console.log("=== ATTRIBUTE CREATION DEBUG ===");
                                console.log("createAttributeAPI response:", resAttr);
                                console.log("Type of resAttr:", typeof resAttr);
                                console.log("resAttr keys:", Object.keys(resAttr || {}));
                                console.log("resAttr.id:", resAttr?.id);
                                console.log("attr.images:", attr.images);
                                console.log("================================");

                                // Get attribute ID directly from response
                                const attributeId = resAttr?.id;

                                // If have images and got attribute ID, upload remaining images
                                if (attributeId && Array.isArray(attr.images) && attr.images.length > 0) {
                                    const imagesToUpload = attr.images
                                        .map((img, index) => ({
                                            imageUrl: (img?.imageUrl ?? "").toString().trim(),
                                            sortOrder: Number.isFinite(Number(img?.sortOrder))
                                                ? Number(img.sortOrder)
                                                : index
                                        }))
                                        .filter(i => !!i.imageUrl);

                                    if (imagesToUpload.length > 0) {
                                        await addImagesToAttributeAPI(attributeId, imagesToUpload);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            message.success("Product created successfully!");

            handleCancel();
            await loadProducts();

        } catch (error) {
            console.error("Error saving product:", error);
            const backendMessage = error?.message;
            const backendPath = error?.path;
            message.error(
                "Failed to save product: " +
                (backendMessage || "Unknown error") +
                (backendPath ? ` (API: ${backendPath})` : "")
            );
        }
        setLoading(false);
    };

    return (
        <Modal
            title="Create New Product"
            open={isCreateOpen}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            width={800}
            confirmLoading={loading}
            okText="Create"
        >
            <Form
                form={form}
                layout="vertical"
                name="product_form"
                onFinish={onFinish}
                initialValues={{ variants: [{}] }}
            >
                {/* PRODUCT INFO */}
                <Divider titlePlacement="left">Product Info</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Product Name"
                            rules={[
                                { required: true, message: 'Please input product name!' },
                                { max: 255, message: 'Product name cannot exceed 255 characters!' }
                            ]}
                        >
                            <Input placeholder="e.g. Rayban Aviator" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="brandName"
                            label="Brand"
                            rules={[
                                { required: true, message: 'Please input brand!' },
                                { max: 255, message: 'Brand name cannot exceed 255 characters!' }
                            ]}
                        >
                            <Input placeholder="e.g. Rayban" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="productImage"
                    label="Image URL"
                    rules={[
                        { required: true, message: 'Please input image URL!' },
                        { max: 255, message: 'Image URL cannot exceed 255 characters!' }
                    ]}
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
                <Divider titlePlacement="left">Variants</Divider>
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
                                                            } catch (_e) {
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
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'sku']}
                                                label="SKU"
                                                rules={[
                                                    { required: true, message: 'Missing SKU' },
                                                    { max: 255, message: 'SKU cannot exceed 255 characters!' }
                                                ]}
                                            >
                                                <Input placeholder="SKU-001" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'price']}
                                                label="Price"
                                                rules={[{ required: true, message: 'Missing price' }]}
                                            >
                                                <InputNumber style={{ width: '100%' }} formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'stockQuantity']}
                                                label="Stock"
                                                rules={[{ required: true, message: 'Missing stock' }]}
                                            >
                                                <InputNumber style={{ width: '100%' }} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'saleType']}
                                                label="Sale Type"
                                                rules={[{ required: true, message: 'Missing sale type' }]}
                                            >
                                                <Select style={{ width: '100%' }}>
                                                    <Select.Option value="IN_STOCK">In Stock</Select.Option>
                                                    <Select.Option value="PRE_ORDER">Pre Order</Select.Option>
                                                </Select>
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
                                                            rules={[{ required: true, message: 'Please select attribute type!' }]}
                                                        >
                                                            <Select placeholder="Select attribute type" style={{ width: '100%' }}>
                                                                <Select.Option value="Size">Size</Select.Option>
                                                                <Select.Option value="Color">Color</Select.Option>
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...attrRestField}
                                                            name={[attrName, 'attributeValue']}
                                                            rules={[
                                                                { required: true, message: 'Missing value!' },
                                                                { max: 255, message: 'Attribute value cannot exceed 255 characters!' }
                                                            ]}
                                                        >
                                                            <Input placeholder="Enter value (e.g XL or 40 or Red)" />
                                                        </Form.Item>

                                                        {/* IMAGES FOR ATTRIBUTE */}
                                                        <Form.List name={[attrName, 'images']}>
                                                            {(imgFields, { add: addImg, remove: removeImg }) => (
                                                                <div style={{ width: '100%' }}>
                                                                    {imgFields.map(({ key: imgKey, name: imgName, ...imgRestField }) => (
                                                                        <div key={imgKey} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                                            <Form.Item
                                                                                {...imgRestField}
                                                                                name={[imgName, 'imageUrl']}
                                                                                rules={[
                                                                                    { required: true, message: 'Missing image URL' },
                                                                                    { max: 255, message: 'Image URL cannot exceed 255 characters!' }
                                                                                ]}
                                                                                style={{ flex: 1 }}
                                                                            >
                                                                                <Input placeholder="Image URL" />
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                {...imgRestField}
                                                                                name={[imgName, 'sortOrder']}
                                                                                initialValue={imgName + 1}
                                                                                style={{ width: 80 }}
                                                                            >
                                                                                <InputNumber placeholder="Order" min={1} />
                                                                            </Form.Item>
                                                                            <MinusCircleOutlined
                                                                                onClick={() => removeImg(imgName)}
                                                                                style={{ marginTop: 8 }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={() => addImg({ sortOrder: imgFields.length + 1 })}
                                                                        block
                                                                        icon={<PlusOutlined />}
                                                                        size="small"
                                                                    >
                                                                        Add Image
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </Form.List>
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
                                                                            } catch (_e) {
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
                                <Button type="dashed" onClick={() => add({ saleType: 'IN_STOCK' })} block icon={<PlusOutlined />}>
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

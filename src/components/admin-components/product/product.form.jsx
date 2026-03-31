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
                        saleType,
                        variant.allowPreorder || false,
                        variant.preorderLimit || 0,
                        variant.preorderFulfillmentDate || null,
                        variant.preorderStartDate || null,
                        variant.preorderEndDate || null
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
                initialValues={{
                    variants: [{
                        saleType: 'IN_STOCK',
                        attributes: [
                            { attributeName: 'Size', attributeValue: '', images: [] },
                            { attributeName: 'Color', attributeValue: '', images: [] }
                        ]
                    }]
                }}
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
                                                    { max: 255, message: 'SKU cannot exceed 255 characters!' },
                                                    {
                                                        pattern: /^SKU-\d+$/,
                                                        message: 'SKU phải có định dạng SKU-number (ví dụ: SKU-001, SKU-123)'
                                                    },
                                                    {
                                                        validator: async (_, value) => {
                                                            if (!value) return Promise.resolve();

                                                            // Check for duplicate SKUs within the form
                                                            const allVariants = form.getFieldValue('variants') || [];
                                                            const currentVariantIndex = name;
                                                            const duplicateCount = allVariants.filter((variant, index) =>
                                                                index !== currentVariantIndex && variant.sku === value
                                                            ).length;

                                                            if (duplicateCount > 0) {
                                                                return Promise.reject('SKU này đã tồn tại trong danh sách!');
                                                            }

                                                            return Promise.resolve();
                                                        }
                                                    }
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
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) =>
                                                    prevValues.variants?.[name]?.saleType !== currentValues.variants?.[name]?.saleType
                                                }
                                            >
                                                {({ getFieldValue }) => {
                                                    const currentSaleType = getFieldValue(['variants', name, 'saleType']);
                                                    const stockLabel = 'Stock';

                                                    return (
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'stockQuantity']}
                                                            label={stockLabel}
                                                            rules={[
                                                                { required: true, message: 'Missing stock' },
                                                                {
                                                                    validator(_, value) {
                                                                        if (value === undefined || value === null) {
                                                                            return Promise.reject('Stock is required');
                                                                        }
                                                                        if (currentSaleType === 'PRE_ORDER') {
                                                                            if (value < 0) {
                                                                                return Promise.reject('Stock must be >= 0 for PRE_ORDER');
                                                                            }
                                                                        } else {
                                                                            if (value <= 0) {
                                                                                return Promise.reject('Stock must be > 0 for IN_STOCK');
                                                                            }
                                                                        }
                                                                        return Promise.resolve();
                                                                    }
                                                                }
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                style={{ width: '100%' }}
                                                                min={0}
                                                                placeholder="Enter stock"
                                                            />
                                                        </Form.Item>
                                                    );
                                                }}
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

                                    {/* PREORDER FIELDS - Conditional */}
                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prevValues, currentValues) => {
                                            return prevValues.variants?.[name]?.saleType !== currentValues.variants?.[name]?.saleType;
                                        }}
                                    >
                                        {({ getFieldValue }) => {
                                            const currentSaleType = getFieldValue(['variants', name, 'saleType']);
                                            if (currentSaleType === 'PRE_ORDER') {
                                                return (
                                                    <>
                                                        <Row gutter={16}>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'allowPreorder']}
                                                                    label="Allow Preorder"
                                                                    initialValue={true}
                                                                >
                                                                    <Select style={{ width: '100%' }}>
                                                                        <Select.Option value={true}>Yes</Select.Option>
                                                                        <Select.Option value={false}>No</Select.Option>
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'preorderLimit']}
                                                                    label="Preorder Limit (Tùy chọn)"
                                                                    dependencies={[[name, 'allowPreorder']]}
                                                                    rules={[
                                                                        {
                                                                            type: 'number',
                                                                            min: 0,
                                                                            message: 'Preorder limit phải >= 0',
                                                                        },
                                                                    ]}
                                                                >
                                                                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Không giới hạn" />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'preorderFulfillmentDate']}
                                                                    label="Fulfillment Date"
                                                                    dependencies={[[name, 'allowPreorder'], [name, 'preorderEndDate']]}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            validator(_, value) {
                                                                                if (getFieldValue([name, 'allowPreorder']) && !value) {
                                                                                    return Promise.reject('Fulfillment date is required when preorder is allowed!');
                                                                                }
                                                                                const endDate = getFieldValue([name, 'preorderEndDate']);
                                                                                if (endDate && value && new Date(value) < new Date(endDate)) {
                                                                                    return Promise.reject('Fulfillment date must be on or after end date!');
                                                                                }
                                                                                return Promise.resolve();
                                                                            },
                                                                        }),
                                                                    ]}
                                                                >
                                                                    <Input
                                                                        type="date"
                                                                        style={{ width: '100%' }}
                                                                        min={new Date().toISOString().split('T')[0]}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                        <Row gutter={16}>
                                                            <Col span={12}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'preorderStartDate']}
                                                                    label="Preorder Start Date"
                                                                    dependencies={[[name, 'allowPreorder']]}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            validator(_, value) {
                                                                                if (getFieldValue([name, 'allowPreorder']) && !value) {
                                                                                    return Promise.reject('Preorder start date is required when preorder is allowed!');
                                                                                }
                                                                                return Promise.resolve();
                                                                            },
                                                                        }),
                                                                    ]}
                                                                >
                                                                    <Input
                                                                        type="date"
                                                                        style={{ width: '100%' }}
                                                                        min={new Date().toISOString().split('T')[0]}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={12}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'preorderEndDate']}
                                                                    label="Preorder End Date"
                                                                    dependencies={[[name, 'allowPreorder'], [name, 'preorderStartDate']]}
                                                                    rules={[
                                                                        ({ getFieldValue }) => ({
                                                                            validator(_, value) {
                                                                                if (getFieldValue([name, 'allowPreorder']) && !value) {
                                                                                    return Promise.reject('Preorder end date is required when preorder is allowed!');
                                                                                }
                                                                                const startDate = getFieldValue([name, 'preorderStartDate']);
                                                                                if (startDate && value && new Date(value) < new Date(startDate)) {
                                                                                    return Promise.reject('End date must be on or after start date!');
                                                                                }
                                                                                return Promise.resolve();
                                                                            },
                                                                        }),
                                                                    ]}
                                                                >
                                                                    <Input
                                                                        type="date"
                                                                        style={{ width: '100%' }}
                                                                        min={new Date().toISOString().split('T')[0]}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    </>
                                                );
                                            }
                                            return null;
                                        }}
                                    </Form.Item>

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
                                                            <Form.Item
                                                                noStyle
                                                                shouldUpdate={(prevValues, currentValues) => 
                                                                    prevValues.variants?.[name]?.attributes?.[attrName]?.attributeName !== 
                                                                    currentValues.variants?.[name]?.attributes?.[attrName]?.attributeName
                                                                }
                                                            >
                                                                {({ getFieldValue }) => {
                                                                    const currentValue = getFieldValue(['variants', name, 'attributes', attrName, 'attributeName']);
                                                                    return (
                                                                        <Input 
                                                                            value={currentValue || ''}
                                                                            style={{ width: '100%' }}
                                                                            disabled
                                                                        />
                                                                    );
                                                                }}
                                                            </Form.Item>
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
                                                                                    { max: 255, message: 'Image URL cannot exceed 255 characters!' }
                                                                                ]}
                                                                                style={{ flex: 1 }}
                                                                            >
                                                                                <Input placeholder="Image URL (tùy chọn)" />
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
                                                    </Space>
                                                ))}
                                            </>
                                        )}
                                    </Form.List>
                                </Card>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add({ 
                                    saleType: 'IN_STOCK',
                                    attributes: [
                                        { attributeName: 'Size', attributeValue: '', images: [] },
                                        { attributeName: 'Color', attributeValue: '', images: [] }
                                    ]
                                })} block icon={<PlusOutlined />}>
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

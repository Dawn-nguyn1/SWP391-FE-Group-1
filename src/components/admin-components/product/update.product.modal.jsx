import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, message, Card, Space, Divider, Row, Col, notification, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
    fetchManagerProductByIdAPI,
    updateProductAPI, updateVariantAPI, updateAttributeAPI,
    deleteVariantAPI, deleteAttributeAPI,
    createVariantAPI, createAttributeAPI,
    addImagesToAttributeAPI, updateAttributeImageAPI, deleteAttributeImageAPI,
    markPreorderStockArrivedAPI
} from '../../../services/api.service';

const formatVariantForForm = (variant = {}) => ({
    id: variant.id,
    sku: variant.sku,
    price: variant.price,
    stockQuantity: variant.stockQuantity,
    originalStockQuantity: variant.stockQuantity,
    arrivedQuantity: 0,
    saleType: variant.saleType || 'IN_STOCK',
    allowPreorder: variant.allowPreorder || false,
    preorderLimit: variant.preorderLimit,
    preorderFulfillmentDate: variant.preorderFulfillmentDate || null,
    preorderStartDate: variant.preorderStartDate || null,
    preorderEndDate: variant.preorderEndDate || null,
    currentPreorders: variant.currentPreorders || 0,
    availabilityStatus: variant.availabilityStatus || 'IN_STOCK',
    attributes: variant.attributes?.map((attribute) => ({
        id: attribute.id,
        attributeName: attribute.attributeName,
        attributeValue: attribute.attributeValue,
        images: attribute.images?.map((img) => ({
            id: img.id || null,
            imageUrl: img.imageUrl || img,
            sortOrder: img.sortOrder
        })) || []
    })) || []
});

const UpdateProductModal = (props) => {
    const { isUpdateOpen, setIsUpdateOpen, dataUpdate, setDataUpdate, loadProducts } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState(null);

    useEffect(() => {
        if (isUpdateOpen && dataUpdate) {
            console.log("Loading product detail for edit:", dataUpdate.id);
            loadProductDetail(dataUpdate.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUpdateOpen, dataUpdate]);

    const loadProductDetail = async (id) => {
        console.log("Loading product detail for ID:", id);
        try {
            const res = await fetchManagerProductByIdAPI(id);
            console.log("Product detail response:", res);

            // Handle different response structures
            let productData = res;

            if (res && res.data && !res.id) {
                productData = res.data;
            }

            if (res && res.result && !res.id) {
                productData = res.result;
            }

            console.log("Processed product data:", productData);

            if (productData && productData.id) {
                setProductData(productData);

                const formattedVariants = productData.variants?.map(formatVariantForForm);

                console.log("Formatted variants:", formattedVariants);

                form.setFieldsValue({
                    name: productData.name,
                    brandName: productData.brandName,
                    productImage: productData.productImage,
                    description: productData.description,
                    variants: formattedVariants
                });
            } else {
                console.error("Invalid response structure:", res);
                notification.error({
                    message: "Invalid product data received",
                    description: "Please check the API response structure"
                });
            }
        } catch (error) {
            console.error("Error loading product detail:", error);
            notification.error({
                message: "Error loading product detail",
                description: error.message || "Unknown error occurred"
            });
        }
    };

    const handleCancel = () => {
        setIsUpdateOpen(false);
        form.resetFields();
        if (setDataUpdate) setDataUpdate(null);
        setProductData(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log("Updating product with values:", values);

            // Update basic product info
            await updateProductAPI(dataUpdate.id, values.name, values.description, values.brandName, values.productImage);
            console.log("Product info updated successfully");

            // Handle variants if they exist
            if (values.variants && values.variants.length > 0) {
                for (const variant of values.variants) {
                    if (variant.id) {
                        // Update existing variant
                        console.log("Updating variant:", variant.id);
                        await updateVariantAPI(
                            variant.id,
                            variant.sku,
                            variant.price,
                            variant.stockQuantity,
                            variant.saleType,
                            variant.allowPreorder || false
                        );

                        if (variant.saleType === 'PRE_ORDER' && Number(variant.arrivedQuantity) > 0) {
                            await markPreorderStockArrivedAPI(variant.id, Number(variant.arrivedQuantity));
                        }

                        // Update attributes
                        if (variant.attributes) {
                            for (const attr of variant.attributes) {
                                if (attr.id) {
                                    await updateAttributeAPI(attr.id, attr.attributeName, attr.attributeValue);

                                    // Handle images for existing attribute
                                    if (attr.images && attr.images.length > 0) {
                                        const originalAttr = productData?.variants?.find(v => v.id === variant.id)?.attributes?.find(a => a.id === attr.id);
                                        const existingImages = originalAttr?.images || [];

                                        // Process each image in form
                                        for (const img of attr.images) {
                                            if (img.imageUrl) {
                                                if (img.id) {
                                                    // Update existing image
                                                    await updateAttributeImageAPI(img.id, img.imageUrl, img.sortOrder);
                                                } else {
                                                    // Add new image
                                                    await addImagesToAttributeAPI(attr.id, [{
                                                        imageUrl: img.imageUrl,
                                                        sortOrder: img.sortOrder || 0
                                                    }]);
                                                }
                                            }
                                        }

                                        // Delete images that were removed
                                        for (const existingImg of existingImages) {
                                            const stillExists = attr.images.find(img => img.id === existingImg.id);
                                            if (!stillExists) {
                                                await deleteAttributeImageAPI(existingImg.id);
                                            }
                                        }
                                    }
                                } else {
                                    // New attribute on existing variant
                                    const attributeName = (attr?.attributeName ?? "").toString().trim();
                                    const attributeValue = (attr?.attributeValue ?? "").toString().trim();
                                    if (!attributeName || !attributeValue) continue;

                                    const resAttr = await createAttributeAPI(
                                        variant.id,
                                        attributeName,
                                        attributeValue,
                                        attr.images || []
                                    );

                                    const attributeId = resAttr?.id;
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
                    } else if (variant.sku) {
                        // New variant on existing product
                        console.log("Creating new variant for product:", dataUpdate.id);
                        const resVar = await createVariantAPI(
                            dataUpdate.id,
                            variant.sku,
                            variant.price,
                            variant.stockQuantity,
                            variant.saleType || 'IN_STOCK',
                            variant.allowPreorder || false
                        );
                        if (resVar && resVar.id) {
                            if (variant.attributes) {
                                for (const attr of variant.attributes) {
                                    const attributeName = (attr?.attributeName ?? "").toString().trim();
                                    const attributeValue = (attr?.attributeValue ?? "").toString().trim();
                                    if (!attributeName || !attributeValue) continue;

                                    const resAttr = await createAttributeAPI(
                                        resVar.id,
                                        attributeName,
                                        attributeValue,
                                        attr.images || []
                                    );

                                    const attributeId = resAttr?.id;
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
            }
            message.success("Product updated successfully!");

            handleCancel();
            await loadProducts();

        } catch (error) {
            console.error("Error updating product:", error);
            message.error("Failed to update product: " + (error?.message || "Unknown error"));
        }
        setLoading(false);
    };

    return (
        <Modal
            title="Update Product"
            open={isUpdateOpen}
            onOk={() => form.submit()}
            onCancel={handleCancel}
            width={800}
            confirmLoading={loading}
            okText="Update"
        >
            <Form
                form={form}
                layout="vertical"
                name="update_product_form"
                onFinish={onFinish}
            >
                {/* PRODUCT INFO */}
                <Divider titlePlacement="left">Product Info</Divider>
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
                                    <Form.Item name={[name, 'id']} hidden><Input /></Form.Item>

                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'sku']}
                                                label="SKU"
                                                rules={[{ required: true, message: 'Missing SKU' }]}
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
                                                                >
                                                                    <Select style={{ width: '100%' }}>
                                                                        <Select.Option value={true}>Yes</Select.Option>
                                                                        <Select.Option value={false}>No</Select.Option>
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={8}>
                                                                {/* Preorder Limit removed - BE handles default null */}
                                                            </Col>
                                                            <Col span={8}>
                                                                {/* Fulfillment Date removed - BE handles default null */}
                                                            </Col>
                                                        </Row>
                                                        <Row gutter={16}>
                                                            <Col span={12}>
                                                                {/* Preorder Start Date removed - BE handles default null */}
                                                            </Col>
                                                            <Col span={12}>
                                                                {/* Preorder End Date removed - BE handles default null */}
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
                                                            rules={[{ required: true, message: 'Missing value!' }]}
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
                                                                                rules={[{ required: true, message: 'Missing image URL' }]}
                                                                                style={{ flex: 1 }}
                                                                            >
                                                                                <Input placeholder="Image URL" />
                                                                            </Form.Item>
                                                                            <Form.Item
                                                                                {...imgRestField}
                                                                                name={[imgName, 'sortOrder']}
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
                            <Button type="dashed" onClick={() => add({
                                attributes: [
                                    { attributeName: 'Size', attributeValue: '', images: [] },
                                    { attributeName: 'Color', attributeValue: '', images: [] }
                                ]
                            })} block icon={<PlusOutlined />}>
                                Add Variant
                            </Button>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default UpdateProductModal;

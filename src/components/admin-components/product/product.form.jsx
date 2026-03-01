import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, Steps, message, Card, Space, Divider, Row, Col, notification, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
    createProductAPI, createVariantAPI, createAttributeAPI,
    fetchProductByIdAPI,
    updateProductAPI, updateVariantAPI, updateAttributeAPI,
    deleteVariantAPI, deleteAttributeAPI,
    addImagesToAttributeAPI
} from '../../../services/api.service';

const ProductForm = (props) => {
    const { isModalOpen, setIsModalOpen, loadProducts, dataUpdate, setDataUpdate } = props;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [createdProductId, setCreatedProductId] = useState(null);

    useEffect(() => {
        if (isModalOpen) {
            if (dataUpdate) {
                // Load full product detail from API
                console.log("Loading product detail for edit:", dataUpdate.id);
                loadProductDetail(dataUpdate.id);
            } else {
                // Create mode: reset
                form.resetFields();
                setCreatedProductId(null);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, dataUpdate]);

    const loadProductDetail = async (id) => {
        console.log("Loading product detail for ID:", id);
        try {
            const res = await fetchProductByIdAPI(id);
            console.log("Product detail response:", res);
            
            // Handle different response structures
            let productData = res;
            
            // If response is nested in data property
            if (res && res.data && !res.id) {
                productData = res.data;
            }
            
            // If response is nested in result property  
            if (res && res.result && !res.id) {
                productData = res.result;
            }
            
            console.log("Processed product data:", productData);
            
            if (productData && productData.id) {
                // Transform data to match form structure
                const formattedVariants = productData.variants?.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    price: v.price,
                    stockQuantity: v.stockQuantity,
                    saleType: v.saleType || 'IN_STOCK',
                    attributes: v.attributes?.map(a => ({
                        id: a.id,
                        attributeName: a.attributeName,
                        attributeValue: a.attributeValue,
                        images: a.images?.map(img => ({
                            id: img.id || null,
                            imageUrl: img.imageUrl || img,
                            sortOrder: img.sortOrder || 1
                        })) || []
                    })) || []
                })) || [];

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
                // Fallback to basic data from table if API fails
                if (dataUpdate) {
                    console.log("Falling back to table data");
                    form.setFieldsValue({
                        name: dataUpdate.name,
                        brandName: dataUpdate.brandName,
                        productImage: dataUpdate.productImage,
                        description: dataUpdate.description,
                        variants: []
                    });
                    notification.warning({ 
                        message: "Limited data loaded",
                        description: "Could not load variants and attributes. Using basic product info."
                    });
                } else {
                    notification.error({ 
                        message: "Invalid product data received",
                        description: "Please check the API response structure"
                    });
                }
            }
        } catch (error) {
            console.error("Error loading product detail:", error);
            // Fallback to basic data from table if API fails
            if (dataUpdate) {
                console.log("API failed, falling back to table data");
                form.setFieldsValue({
                    name: dataUpdate.name,
                    brandName: dataUpdate.brandName,
                    productImage: dataUpdate.productImage,
                    description: dataUpdate.description,
                    variants: []
                });
                notification.warning({ 
                    message: "Using limited data",
                    description: "Server error occurred. Editing basic product info only."
                });
            } else {
                notification.error({ 
                    message: "Error loading product detail",
                    description: error.message || "Unknown error occurred"
                });
            }
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
                // === UPDATE MODE ===
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
                            await updateVariantAPI(variant.id, variant.sku, variant.price, variant.stockQuantity, variant.saleType);

                            // Update attributes
                            if (variant.attributes) {
                                for (const attr of variant.attributes) {
                                    if (attr.id) {
                                        await updateAttributeAPI(attr.id, attr.attributeName, attr.attributeValue);
                                        
                                        // Upload images for existing attribute
                                        if (attr.images && attr.images.length > 0) {
                                            const imagesToUpload = attr.images.filter(img => img.imageUrl && !img.id);
                                            if (imagesToUpload.length > 0) {
                                                await addImagesToAttributeAPI(attr.id, imagesToUpload);
                                            }
                                        }
                                    } else {
                                        // New attribute on existing variant
                                        const resAttr = await createAttributeAPI(variant.id, attr.attributeName, attr.attributeValue);
                                        
                                        // Upload images for new attribute
                                        if (resAttr && resAttr.id && attr.images && attr.images.length > 0) {
                                            await addImagesToAttributeAPI(resAttr.id, attr.images);
                                        }
                                    }
                                }
                            }
                        } else if (variant.sku) {
                            // New variant on existing product (only if SKU is provided)
                            console.log("Creating new variant for product:", dataUpdate.id);
                            const resVar = await createVariantAPI(dataUpdate.id, variant.sku, variant.price, variant.stockQuantity, variant.saleType || 'IN_STOCK');
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
                            variant.stockQuantity,
                            variant.saleType || 'IN_STOCK'
                        );

                        if (resVariant && resVariant.id) {
                            const variantId = resVariant.id;
                            if (variant.attributes) {
                                for (const attr of variant.attributes) {
                                    const resAttr = await createAttributeAPI(
                                        variantId,
                                        attr.attributeName,
                                        attr.attributeValue
                                    );
                                    
                                    // Upload images for new attribute
                                    if (resAttr && resAttr.id && attr.images && attr.images.length > 0) {
                                        await addImagesToAttributeAPI(resAttr.id, attr.images);
                                    }
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
            console.error("Error saving product:", error);
            message.error("Failed to save product: " + (error.message || "Unknown error"));
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
                                                initialValue="IN_STOCK"
                                            >
                                                <Select style={{ width: '100%' }}>
                                                    <Select.Option value="IN_STOCK">In Stock</Select.Option>
                                                    <Select.Option value="OUT_OF_STOCK">Out of Stock</Select.Option>
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

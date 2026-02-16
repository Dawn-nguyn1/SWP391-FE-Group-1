import { Input, Modal, Descriptions, Image, Card, Tag, Divider } from 'antd'
import React, { useEffect, useState } from 'react'
import { fetchManagerProductByIdAPI } from '../../../services/api.service'

const ProductDetail = (props) => {
    const { isDetailOpen, setIsDetailOpen, productId } = props;
    const [productDetail, setProductDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isDetailOpen && productId) {
            loadProductDetail();
        }
    }, [isDetailOpen, productId]);

    const loadProductDetail = async () => {
        setLoading(true);
        try {
            const res = await fetchManagerProductByIdAPI(productId);
            if (res) {
                setProductDetail(res);
            }
        } catch (error) {
            console.error("Error loading product detail:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsDetailOpen(false);
        setProductDetail(null);
    };

    return (
        <Modal
            title="Product Detail"
            open={isDetailOpen}
            onOk={handleClose}
            onCancel={handleClose}
            maskClosable={false}
            okText="Close"
            width={800}
            loading={loading}
        >
            {productDetail && (
                <div>
                    {/* Product Info */}
                    <Card title="Product Information" size="small" style={{ marginBottom: 16 }}>
                        <Descriptions column={2} bordered>
                            <Descriptions.Item label="ID">{productDetail.id}</Descriptions.Item>
                            <Descriptions.Item label="Name">{productDetail.name}</Descriptions.Item>
                            <Descriptions.Item label="Brand">{productDetail.brandName}</Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>
                                {productDetail.description || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Product Image" span={2}>
                                {productDetail.productImage && (
                                    <Image
                                        width={100}
                                        height={100}
                                        src={productDetail.productImage}
                                        style={{ objectFit: 'cover' }}
                                    />
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Variants */}
                    <Card title="Variants" size="small">
                        {productDetail.variants && productDetail.variants.length > 0 ? (
                            productDetail.variants.map((variant, index) => (
                                <div key={variant.id} style={{ marginBottom: index < productDetail.variants.length - 1 ? 16 : 0 }}>
                                    <Divider orientation="left">Variant #{index + 1}</Divider>
                                    <Descriptions column={2} size="small" bordered>
                                        <Descriptions.Item label="Variant ID">{variant.id}</Descriptions.Item>
                                        <Descriptions.Item label="SKU">{variant.sku}</Descriptions.Item>
                                        <Descriptions.Item label="Price">${variant.price}</Descriptions.Item>
                                        <Descriptions.Item label="Stock">{variant.stockQuantity}</Descriptions.Item>
                                        <Descriptions.Item label="Sale Type">
                                            <Tag color={variant.saleType === 'IN_STOCK' ? 'green' : 'orange'}>
                                                {variant.saleType}
                                            </Tag>
                                        </Descriptions.Item>
                                    </Descriptions>

                                    {/* Attributes */}
                                    {variant.attributes && variant.attributes.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <strong>Attributes:</strong>
                                            <div style={{ marginTop: 8 }}>
                                                {variant.attributes.map((attr, attrIndex) => (
                                                    <div key={attr.id} style={{ marginBottom: 8 }}>
                                                        <Tag color="blue">{attr.attributeName}: {attr.attributeValue}</Tag>
                                                        {attr.images && attr.images.length > 0 && (
                                                            <div style={{ marginTop: 4 }}>
                                                                {attr.images.map((img, imgIndex) => (
                                                                    <Image
                                                                        key={imgIndex}
                                                                        width={50}
                                                                        height={50}
                                                                        src={img}
                                                                        style={{ objectFit: 'cover', marginRight: 4 }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div>No variants available</div>
                        )}
                    </Card>
                </div>
            )}
        </Modal>
    )
}

export default ProductDetail;
const normalizeSaleType = (value) => String(value ?? '').trim().toUpperCase();

export const getProductSaleType = (product) => {
    const directSaleType = normalizeSaleType(product?.saleType ?? product?.minSaleType ?? product?.defaultSaleType);
    if (directSaleType) return directSaleType;

    if (Array.isArray(product?.variants)) {
        const variantSaleType = product.variants
            .map((variant) => normalizeSaleType(variant?.saleType))
            .find(Boolean);
        if (variantSaleType) return variantSaleType;
    }

    return 'IN_STOCK';
};

export const isPreOrderProduct = (product) => getProductSaleType(product) === 'PRE_ORDER';

export const getProductAvailability = (product) => {
    if (isPreOrderProduct(product)) {
        return {
            label: 'Đặt trước',
            className: 'preorder',
            toneClassName: 'preorder',
        };
    }

    if (product?.hasStock === false) {
        return {
            label: 'Hết hàng',
            className: 'out',
            toneClassName: 'sold-out',
        };
    }

    return {
        label: 'Còn hàng',
        className: 'in',
        toneClassName: 'in-stock',
    };
};

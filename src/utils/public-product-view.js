const detailCache = new Map();

const SALE_TYPE = {
    IN_STOCK: 'IN_STOCK',
    PRE_ORDER: 'PRE_ORDER',
};

const firstNumber = (...values) => {
    for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
};

const computeVariantSummary = (variants = []) => {
    const saleTypes = variants.map((variant) => variant?.saleType).filter(Boolean);
    const stockValues = variants.map((variant) => firstNumber(variant?.stockQuantity));
    const totalStock = stockValues.reduce((sum, stock) => sum + stock, 0);
    const hasPreOrder = saleTypes.includes(SALE_TYPE.PRE_ORDER);
    const hasInStock = saleTypes.includes(SALE_TYPE.IN_STOCK) || stockValues.some((stock) => stock > 0);

    let mode = 'UNKNOWN';
    if (hasPreOrder && hasInStock) mode = 'MIXED';
    else if (hasPreOrder) mode = 'PRE_ORDER';
    else if (hasInStock) mode = 'IN_STOCK';

    return {
        mode,
        hasPreOrder,
        hasInStock,
        totalStock,
        preOrderCount: saleTypes.filter((type) => type === SALE_TYPE.PRE_ORDER).length,
    };
};

export const decoratePublicProduct = (product, detail) => {
    const variants = Array.isArray(detail?.variants) ? detail.variants : Array.isArray(product?.variants) ? product.variants : [];
    const summary = computeVariantSummary(variants);
    const minPrice = firstNumber(product?.minPrice);
    const maxPrice = firstNumber(product?.maxPrice);

    return {
        ...product,
        detail,
        variants,
        productMode: summary.mode,
        hasPreOrder: summary.hasPreOrder,
        hasReadyStock: summary.hasInStock,
        totalStock: firstNumber(product?.totalStock, summary.totalStock),
        hasStock: typeof product?.hasStock === 'boolean' ? product.hasStock : summary.totalStock > 0,
        priceLabel:
            minPrice > 0 && maxPrice > minPrice
                ? { type: 'range', minPrice, maxPrice }
                : { type: 'single', minPrice: minPrice || maxPrice },
    };
};

export const enrichPublicProducts = async (products, getDetail) => {
    const items = Array.isArray(products) ? products : [];

    const enriched = await Promise.all(
        items.map(async (product) => {
            if (!product?.id) return decoratePublicProduct(product, null);

            let detail = detailCache.get(product.id);
            if (!detail) {
                try {
                    detail = await getDetail(product.id);
                    detailCache.set(product.id, detail);
                } catch {
                    detail = null;
                }
            }

            return decoratePublicProduct(product, detail);
        })
    );

    return enriched;
};

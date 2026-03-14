import {
    addToCartAPI,
    clearCartAPI,
    getPublicCombosAPI,
    getPublicComboDetailAPI,
    getPublicProductDetailAPI,
} from '../services/api.service';

const normalize = (value) => String(value ?? '').trim().toLowerCase();

let comboCatalogCache = null;

const getComboCatalog = async () => {
    if (comboCatalogCache) return comboCatalogCache;

    try {
        const response = await getPublicCombosAPI(0, 100);
        comboCatalogCache = response?.content || response?.data?.content || [];
    } catch {
        comboCatalogCache = [];
    }
    return comboCatalogCache;
};

const resolveComboFromCatalog = async (item) => {
    const catalog = await getComboCatalog();
    const itemName = normalize(item?.productName);
    return catalog.find((combo) => normalize(combo?.name) === itemName) || null;
};

const isComboCartItem = (item) => item?.itemKind === 'combo';

const matchVariantFromCartItem = (product, cartItem) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const cartAttributes = Array.isArray(cartItem?.attributes) ? cartItem.attributes : [];

    if (variants.length === 0) return null;
    if (cartAttributes.length === 0) return variants[0];

    return (
        variants.find((variant) => {
            const variantAttributes = Array.isArray(variant?.attributes) ? variant.attributes : [];
            return cartAttributes.every((cartAttribute) =>
                variantAttributes.some(
                    (variantAttribute) =>
                        normalize(variantAttribute?.attributeName) === normalize(cartAttribute?.attributeName)
                        && normalize(variantAttribute?.attributeValue) === normalize(cartAttribute?.attributeValue)
                )
            );
        }) || variants[0]
    );
};

const buildReAddActions = async (items) => {
    const actions = [];

    for (const item of items) {
        if (isComboCartItem(item)) {
            const comboMeta = await resolveComboFromCatalog(item);
            const comboRes = await getPublicComboDetailAPI(comboMeta?.id || item.productId);
            const combo = comboRes?.data || comboRes;
            const comboItems = Array.isArray(combo?.items) ? combo.items : [];

            comboItems.forEach((comboItem) => {
                if (!comboItem?.productVariantId) return;
                actions.push({
                    productVariantId: comboItem.productVariantId,
                    quantity: (comboItem.quantity || 1) * (item.quantity || 1),
                });
            });
            continue;
        }

        const productRes = await getPublicProductDetailAPI(item.productId);
        const product = productRes?.data || productRes;
        const matchedVariant = matchVariantFromCartItem(product, item);

        if (!matchedVariant?.id) {
            throw new Error(`Cannot resolve variant for product ${item.productId}`);
        }

        actions.push({
            productVariantId: matchedVariant.id,
            quantity: item.quantity || 1,
        });
    }

    return actions;
};

export const rebuildCartFromItems = async (items) => {
    const actions = await buildReAddActions(items);
    await clearCartAPI();

    for (const action of actions) {
        await addToCartAPI(action.productVariantId, action.quantity);
    }
};

export const transformCartForCheckout = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    const hasComboItems = items.some(isComboCartItem);
    if (!hasComboItems) return false;

    await rebuildCartFromItems(items);
    return true;
};

export const isLegacyComboCartItem = isComboCartItem;

export const attachCartItemKinds = async (items) => {
    if (!Array.isArray(items) || items.length === 0) return [];

    const catalog = await getComboCatalog();
    const comboNames = new Set(catalog.map((combo) => normalize(combo?.name)));

    return items.map((item) => ({
        ...item,
        itemKind: comboNames.has(normalize(item?.productName)) ? 'combo' : 'product',
    }));
};

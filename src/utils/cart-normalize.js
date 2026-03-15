const toArray = (value) => (Array.isArray(value) ? value : []);

export const isComboCartItem = (item) => item?.isCombo === true;

export const getCartItemId = (item) => item?.cartItemId ?? item?.id ?? null;

export const getCartItemName = (item) => (
    isComboCartItem(item)
        ? item?.comboName || 'Combo'
        : item?.productName || 'Sản phẩm'
);

export const getCartItemImage = (item) => (
    isComboCartItem(item)
        ? item?.comboImage || null
        : item?.productImage || null
);

export const getCartItemLineTotal = (item) => item?.totalPrice ?? 0;

export const getCartItemTypeLabel = (item) => {
    if (isComboCartItem(item)) return 'Combo uu dai';

    const saleType = String(item?.saleType ?? '').toUpperCase();
    if (saleType === 'PRE_ORDER') return 'Pre-order';
    if (saleType === 'IN_STOCK') return 'San pham san kho';
    return 'San pham';
};

export const getCartItemMeta = (item) => {
    if (isComboCartItem(item)) {
        const comboItems = toArray(item?.comboItems);
        if (comboItems.length === 0) return 'Combo ưu đãi';

        return comboItems
            .map((comboItem) => `${comboItem.productName || `Variant #${comboItem.variantId}`} x${comboItem.quantity || 1}`)
            .join(', ');
    }

    const attributes = toArray(item?.attributes);
    if (attributes.length === 0) return item?.saleType || 'Sản phẩm đơn lẻ';

    return attributes
        .map((attribute) => `${attribute.attributeName}: ${attribute.attributeValue}`)
        .join(' • ');
};

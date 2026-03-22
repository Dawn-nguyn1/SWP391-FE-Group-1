const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export const parseMaybeString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;

    try {
        return JSON.parse(trimmed);
    } catch {
        try {
            const normalized = trimmed
                .replace(/\\'/g, '__SQUOTE__')
                .replace(/'/g, '"')
                .replace(/__SQUOTE__/g, "'");
            return JSON.parse(normalized);
        } catch {
            return value;
        }
    }
};

export const extractJsonFromString = (value) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        const parsed = parseMaybeString(trimmed.slice(firstBrace, lastBrace + 1));
        if (isObject(parsed) || Array.isArray(parsed)) return parsed;
    }

    const firstBracket = trimmed.indexOf('[');
    const lastBracket = trimmed.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
        const parsed = parseMaybeString(trimmed.slice(firstBracket, lastBracket + 1));
        if (Array.isArray(parsed)) return parsed;
    }

    return value;
};

export const coerceArray = (value) => {
    if (Array.isArray(value)) return value;
    if (isObject(value)) {
        const vals = Object.values(value);
        if (vals.length && vals.every(item => isObject(item))) {
            return vals;
        }
    }
    return null;
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = null) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
        if (value === 1) return true;
        if (value === 0) return false;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 'yes'].includes(normalized)) return true;
        if (['false', '0', 'no'].includes(normalized)) return false;
    }
    return fallback;
};

const firstDefined = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

const unwrapData = (input) => {
    let data = parseMaybeString(input);
    if (typeof data === 'string') data = extractJsonFromString(data);
    if (isObject(data) && 'data' in data) {
        data = parseMaybeString(data.data);
        if (typeof data === 'string') data = extractJsonFromString(data);
    }
    return data;
};

export const normalizeCollectionResponse = (input) => {
    const data = unwrapData(input);
    if (Array.isArray(data)) return { items: data, total: data.length };

    const directCandidates = [
        data?.content?.content,
        data?.content,
        data?.items,
        data?.result,
        data?.results,
        data?.data,
        data?.rows
    ];

    for (const candidate of directCandidates) {
        const parsed = parseMaybeString(candidate);
        const items = coerceArray(parsed) || (Array.isArray(parsed) ? parsed : null);
        if (items) {
            return {
                items,
                total: firstDefined(data?.totalElements, data?.total, data?.count, items.length)
            };
        }
    }

    if (isObject(data)) {
        for (const value of Object.values(data)) {
            const parsed = parseMaybeString(value);
            const items = coerceArray(parsed) || (Array.isArray(parsed) ? parsed : null);
            if (items) return { items, total: items.length };
        }
    }

    return { items: [], total: 0 };
};

export const normalizeAddress = (input) => {
    const address = unwrapData(input) || {};
    return {
        ...address,
        id: firstDefined(address.id, address.addressId),
        receiverName: firstDefined(address.receiverName, address.recipientName, address.fullName, address.name),
        phone: firstDefined(address.phone, address.phoneNumber, address.receiverPhone),
        province: firstDefined(address.province, address.city, address.provinceName),
        district: firstDefined(address.district, address.districtName),
        ward: firstDefined(address.ward, address.wardName),
        addressLine: firstDefined(address.addressLine, address.street, address.detail, address.line1),
        isDefault: Boolean(firstDefined(address.isDefault, address.defaultAddress, address.default)),
    };
};

export const formatAddressText = (input) => {
    const address = normalizeAddress(input);
    const parts = [address.addressLine, address.ward, address.district, address.province].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
};

export const normalizeAddressListResponse = (input) =>
    normalizeCollectionResponse(input).items.map(normalizeAddress);

export const normalizeProfile = (input) => {
    const profile = unwrapData(input) || {};
    return {
        ...profile,
        id: firstDefined(profile.id, profile.userId),
        fullName: firstDefined(profile.fullName, profile.name, profile.customerName),
        email: firstDefined(profile.email, profile.username),
        phone: firstDefined(profile.phone, profile.phoneNumber),
        gender: firstDefined(profile.gender, profile.sex),
        dob: firstDefined(profile.dob, profile.dateOfBirth),
    };
};

export const normalizeCartItem = (input) => {
    const item = unwrapData(input) || {};
    const attributes = Array.isArray(item.attributes) ? item.attributes : [];
    const imageCandidates = [
        item.productImage,
        item.imageUrl,
        item.image,
        item.product?.productImage,
        item.product?.imageUrl,
        item.variant?.imageUrl,
        item.variant?.productImage,
        attributes[0]?.images?.[0],
        item.attribute?.images?.[0]?.imageUrl
    ];

    const productName = firstDefined(
        item.productName,
        item.name,
        item.product?.name,
        item.variantName,
        item.variant?.sku
    );
    const unitPrice = firstDefined(item.unitPrice, item.price, item.salePrice, item.variant?.price, 0);
    const quantity = toNumber(firstDefined(item.quantity, item.qty), 1);
    const variantName = firstDefined(
        item.variantName,
        item.attributeValue,
        item.attribute?.attributeValue,
        item.variant?.sku,
        attributes.map(attr => [attr.attributeName, attr.attributeValue].filter(Boolean).join(': ')).filter(Boolean).join(' | ')
    );

    return {
        ...item,
        id: firstDefined(item.id, item.itemId, item.cartItemId),
        clientKey: firstDefined(item.id, item.itemId, item.cartItemId, item.productId, item.productComboId, `${productName || 'item'}-${quantity}`),
        saleType: firstDefined(item.saleType, item.type),
        productName,
        variantName,
        brand: firstDefined(item.brand, item.brandName, item.product?.brandName),
        productImage: imageCandidates.find(Boolean) || '',
        unitPrice: toNumber(unitPrice),
        quantity,
        lineTotal: toNumber(firstDefined(item.lineTotal, item.totalPrice, unitPrice * quantity)),
        attributes,
    };
};

export const normalizeCart = (input) => {
    const cart = unwrapData(input) || {};
    const items = normalizeCollectionResponse(cart?.items || cart?.content || cart).items.map(normalizeCartItem);
    const computedTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
        ...cart,
        items,
        finalTotal: toNumber(firstDefined(cart.finalTotal, cart.totalAmount, cart.total, cart.grandTotal), computedTotal),
    };
};

export const normalizeOrder = (input) => {
    const order = unwrapData(input) || {};
    const normalizedAddress = normalizeAddress(firstDefined(order.address, order.shippingAddress, order.deliveryAddress));
    const items = normalizeCollectionResponse(firstDefined(order.items, order.orderItems, order.orderDetails, [])).items
        .map(normalizeCartItem);
    const orderType = firstDefined(order.orderType, order.saleType, order.type);
    const totalAmount = toNumber(firstDefined(order.totalAmount, order.total, order.grandTotal));
    const deposit = toNumber(firstDefined(order.deposit, order.depositAmount));
    const paymentMethod = firstDefined(order.paymentMethod, order.paymentType);
    const paymentStatus = firstDefined(order.paymentStatus, order.payment_state);
    const remainingAmount = toNumber(
        firstDefined(order.remainingAmount, order.balanceAmount),
        orderType === 'PRE_ORDER'
            ? Math.max(totalAmount - deposit, 0)
            : 0
    );
    const displayDeposit = orderType === 'IN_STOCK'
        ? ((paymentMethod === 'COD' || !['SUCCESS', 'PAID'].includes(paymentStatus))
            ? 0
            : totalAmount)
        : deposit;
    const displayRemaining = orderType === 'IN_STOCK'
        ? Math.max(totalAmount - displayDeposit, 0)
        : remainingAmount;

    return {
        ...order,
        id: firstDefined(order.id, order.orderId),
        orderCode: firstDefined(order.orderCode, order.code),
        orderStatus: firstDefined(order.orderStatus, order.status, order.order_state),
        approvalStatus: firstDefined(
            order.approvalStatus,
            order.approval_status,
            order.supportApprovalStatus,
            order.approvalState
        ),
        orderType,
        paymentMethod,
        paymentStatus,
        remainingPaymentMethod: firstDefined(order.remainingPaymentMethod, order.balancePaymentMethod),
        remainingPaymentStatus: firstDefined(
            order.remainingPaymentStatus,
            order.balancePaymentStatus,
            order.finalPaymentStatus
        ),
        remainingPaymentOpen: toBoolean(
            firstDefined(
                order.remainingPaymentOpen,
                order.isRemainingPaymentOpen,
                order.canPayRemaining,
                order.canPayRemainingAmount,
                order.finalPaymentOpen,
                order.openRemainingPayment
            ),
            null
        ),
        ghnOrderCode: firstDefined(order.ghnOrderCode, order.shipment?.ghnOrderCode, order.trackingCode),
        shipmentStatus: firstDefined(order.shipmentStatus, order.shipment?.status, order.deliveryStatus),
        createdAt: firstDefined(order.createdAt, order.createdDate, order.created_time),
        supportApprovedAt: firstDefined(
            order.supportApprovedAt,
            order.support_approved_at,
            order.supportApprovedDate,
            order.approvedAt
        ),
        operationConfirmedAt: firstDefined(
            order.operationConfirmedAt,
            order.operation_confirmed_at,
            order.operationConfirmedDate
        ),
        remainingPaymentOpenedAt: firstDefined(
            order.remainingPaymentOpenedAt,
            order.remaining_payment_opened_at,
            order.finalPaymentOpenedAt
        ),
        totalAmount,
        deposit,
        remainingAmount,
        displayDeposit,
        displayRemaining,
        address: normalizedAddress,
        receiverName: firstDefined(order.receiverName, normalizedAddress.receiverName, order.customerName),
        receiverPhone: firstDefined(order.phone, normalizedAddress.phone),
        customerEmail: firstDefined(
            order.customerEmail,
            order.userEmail,
            order.email,
            order.customer?.email,
            order.user?.email,
            normalizedAddress.email
        ),
        items,
    };
};

export const normalizeOrdersResponse = (input) => {
    const { items, total } = normalizeCollectionResponse(input);
    return {
        items: items.map(normalizeOrder),
        total,
    };
};

export const normalizePayment = (input) => {
    const payment = unwrapData(input) || {};

    return {
        ...payment,
        paymentId: firstDefined(payment.paymentId, payment.id),
        orderCode: firstDefined(payment.orderCode, payment.order_code),
        stage: firstDefined(payment.stage, payment.paymentStage),
        method: firstDefined(payment.method, payment.paymentMethod),
        status: firstDefined(payment.status, payment.paymentStatus),
        amount: toNumber(payment.amount),
        transactionCode: firstDefined(payment.transactionCode, payment.transactionNo),
        createAt: firstDefined(payment.createAt, payment.createdAt, payment.createdDate),
        paidAt: firstDefined(payment.paidAt, payment.updatedAt),
    };
};

export const normalizePaymentsResponse = (input) =>
    normalizeCollectionResponse(input).items.map(normalizePayment);

export const parseEvidenceUrls = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const parsed = parseMaybeString(value);
    if (Array.isArray(parsed)) return parsed;
    if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
    return [];
};

export const normalizeReturnRequest = (input) => {
    const request = unwrapData(input) || {};
    return {
        ...request,
        id: firstDefined(request.id, request.returnRequestId),
        status: firstDefined(request.status, request.returnStatus),
        createdAt: firstDefined(request.createdAt, request.createdDate),
        requestedQuantity: toNumber(firstDefined(request.requestedQuantity, request.quantity), 0),
        reason: firstDefined(request.reason, request.returnReason),
        note: firstDefined(request.note, request.description, request.customerNote),
        evidenceUrls: parseEvidenceUrls(firstDefined(request.evidenceUrls, request.images, request.evidences)),
    };
};

export const normalizeReturnRequestsResponse = (input) =>
    normalizeCollectionResponse(input).items.map(normalizeReturnRequest);

const MAX_PREORDER_PER_CUSTOMER = 2;

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const getCampaignWindowState = (campaign) => {
    if (!campaign?.isActive) return 'inactive';

    const now = new Date();
    const start = toDateValue(campaign?.startDate);
    const end = toDateValue(campaign?.endDate);

    if (start && now < start) return 'upcoming';
    if (end && now > end) return 'closed';
    return 'open';
};

export const buildCampaignVariantIndex = (products = []) => {
    const index = new Map();

    products.forEach((product) => {
        const variants = Array.isArray(product?.variants) ? product.variants : [];

        variants.forEach((variant) => {
            if (!variant?.id) return;
            index.set(variant.id, { product, variant });
        });
    });

    return index;
};

const getCampaignPaymentLabel = (option) => {
    if (option === 'FULL_ONLY') return 'Thanh toán 100%';
    if (option === 'DEPOSIT_ONLY') return 'Đặt cọc theo chiến dịch';
    if (option === 'FLEXIBLE') return 'Chọn cọc hoặc thanh toán 100%';
    return option || 'Theo cấu hình chiến dịch';
};

export const decorateCampaign = (campaign, variantIndex) => {
    const variantIds = Array.isArray(campaign?.variantIds)
        ? campaign.variantIds
        : Array.from(campaign?.variantIds || []);

    const variantConfigs = Array.isArray(campaign?.variantConfigs)
        ? campaign.variantConfigs
        : Array.from(campaign?.variantConfigs || []);

    const items = variantIds
        .map((variantId) => {
            const linked = variantIndex.get(variantId);
            const config = variantConfigs.find((entry) => entry?.variantId === variantId) || null;
            if (!linked) return null;

            return {
                variantId,
                config,
                product: linked.product,
                variant: linked.variant,
                productName: linked.product?.name,
                brandName: linked.product?.brandName,
                productImage: linked.product?.productImage,
                price: linked.variant?.price,
            };
        })
        .filter(Boolean);

    const prices = items
        .map((item) => toNumber(item?.price, NaN))
        .filter((price) => Number.isFinite(price) && price > 0);

    const currentPreorders = toNumber(campaign?.currentPreorders, 0);
    const preorderLimit = campaign?.preorderLimit ?? null;
    const hasLimit = Number.isFinite(Number(preorderLimit)) && Number(preorderLimit) > 0;
    const remainingSlots = hasLimit
        ? Math.max(Number(preorderLimit) - currentPreorders, 0)
        : null;

    return {
        ...campaign,
        variantIds,
        variantConfigs,
        items,
        featuredItem: items[0] || null,
        brands: [...new Set(items.map((item) => item.brandName).filter(Boolean))],
        variantCount: items.length,
        paymentSummary: [...new Set(variantConfigs.map((item) => getCampaignPaymentLabel(item?.preorderPaymentOption)))],
        priceMin: prices.length > 0 ? Math.min(...prices) : null,
        priceMax: prices.length > 0 ? Math.max(...prices) : null,
        currentPreorders,
        preorderLimit,
        hasLimit,
        remainingSlots,
        windowState: getCampaignWindowState(campaign),
    };
};

export const decorateCampaigns = (campaigns = [], products = []) => {
    const variantIndex = buildCampaignVariantIndex(products);
    return (Array.isArray(campaigns) ? campaigns : [])
        .map((campaign) => decorateCampaign(campaign, variantIndex))
        .filter((campaign) => campaign.items.length > 0);
};

export const getCampaignStatusMeta = (campaign) => {
    if (!campaign?.isActive) {
        return {
            label: 'Tạm ngưng',
            tone: 'muted',
            canOrder: false,
            helper: 'Chiến dịch đang tạm ngưng và chưa nhận thêm đơn.',
        };
    }

    if (campaign?.windowState === 'upcoming') {
        return {
            label: 'Sắp mở',
            tone: 'upcoming',
            canOrder: false,
            helper: 'Chiến dịch chưa đến thời điểm mở nhận đơn.',
        };
    }

    if (campaign?.windowState === 'closed') {
        return {
            label: 'Đã đóng',
            tone: 'closed',
            canOrder: false,
            helper: 'Chiến dịch đã hết thời gian nhận đơn.',
        };
    }

    if (campaign?.hasLimit && campaign?.remainingSlots === 0) {
        return {
            label: 'Hết suất',
            tone: 'closed',
            canOrder: false,
            helper: 'Chiến dịch đã đạt đủ giới hạn nhận đơn.',
        };
    }

    return {
        label: 'Đang mở',
        tone: 'open',
        canOrder: true,
        helper: 'Bạn có thể chọn biến thể trong chiến dịch và thêm vào giỏ hàng.',
    };
};

export const getCampaignQuantityLimit = (campaign) => {
    if (!campaign) return 1;
    if (campaign?.remainingSlots == null) return MAX_PREORDER_PER_CUSTOMER;
    return Math.max(1, Math.min(MAX_PREORDER_PER_CUSTOMER, campaign.remainingSlots));
};

export const formatCampaignPrice = (campaign, formatMoney) => {
    if (!campaign) return 'Liên hệ';
    if (campaign.priceMin && campaign.priceMax && campaign.priceMax > campaign.priceMin) {
        return `${formatMoney(campaign.priceMin)} - ${formatMoney(campaign.priceMax)}`;
    }
    if (campaign.priceMin) return formatMoney(campaign.priceMin);
    return 'Liên hệ';
};

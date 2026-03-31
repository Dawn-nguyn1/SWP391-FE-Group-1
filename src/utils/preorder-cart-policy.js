import { extractJsonFromString, parseMaybeString } from './role-data';

export const roundMoney = (amount) => Math.ceil(Number(amount) || 0);

const normalizeId = (value) => {
    if (value === undefined || value === null || value === '') return null;
    return String(value);
};

const toArray = (value) => {
    const parsed = parseMaybeString(value);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'string') {
        const extracted = extractJsonFromString(parsed);
        if (Array.isArray(extracted)) return extracted;
    }
    if (parsed && typeof parsed === 'object') return Object.values(parsed);
    return [];
};

const normalizeConfig = (input) => {
    let config = parseMaybeString(input);
    if (typeof config === 'string') config = extractJsonFromString(config);
    return config && typeof config === 'object' ? config : null;
};

export const normalizeCampaignPayload = (input) => {
    let data = parseMaybeString(input);
    if (typeof data === 'string') data = extractJsonFromString(data);

    const candidates = [data, data?.data, data?.result, data?.content];
    for (const candidate of candidates) {
        let parsed = parseMaybeString(candidate);
        if (typeof parsed === 'string') parsed = extractJsonFromString(parsed);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
    }

    return data;
};

export const getCartVariantId = (item) =>
    item?.resolvedVariantId
    || item?.matchedVariantId
    || item?.productVariantId
    || item?.variantId
    || item?.variant?.id
    || null;

export const getCartLineTotal = (item) =>
    Number(item?.lineTotal || ((item?.unitPrice || 0) * (item?.quantity || 1)) || 0);

export const buildCampaignConfigIndex = (campaigns = []) => {
    const index = new Map();
    const campaignConfigMap = new Map();

    (Array.isArray(campaigns) ? campaigns : []).forEach((rawCampaign) => {
        const campaign = normalizeCampaignPayload(rawCampaign);
        const campaignId = normalizeId(campaign?.id);
        const variantIds = toArray(campaign?.variantIds);
        const variantConfigs = toArray(campaign?.variantConfigs);
        const normalizedConfigs = [];

        variantConfigs.forEach((entry, configIndex) => {
            const config = normalizeConfig(entry);
            const variantId = normalizeId(
                config?.variantId
                || config?.productVariantId
                || config?.variant?.id
                || variantIds[configIndex]
            );

            const normalized = {
                ...config,
                campaignId,
                variantId,
            };

            normalizedConfigs.push(normalized);
            if (!variantId) return;

            index.set(variantId, normalized);
        });

        if (campaignId && normalizedConfigs.length > 0) {
            campaignConfigMap.set(campaignId, normalizedConfigs);
        }
    });

    index.campaignConfigMap = campaignConfigMap;

    return index;
};

export const getPreOrderItemConfig = (item, configIndex = new Map()) => {
    const variantId = normalizeId(getCartVariantId(item));
    if (variantId && configIndex.get(variantId)) {
        return configIndex.get(variantId) || null;
    }

    const campaignId = normalizeId(item?.campaignId || item?.preorderCampaignId || item?.campaign?.id);
    const campaignConfigs = campaignId ? configIndex?.campaignConfigMap?.get?.(campaignId) || [] : [];
    if (campaignConfigs.length === 1) {
        return campaignConfigs[0];
    }

    return null;
};

export const getPreOrderItemBreakdown = (item, configIndex = new Map()) => {
    const total = getCartLineTotal(item);
    const config = getPreOrderItemConfig(item, configIndex);
    const paymentOption = config?.preorderPaymentOption || 'DEPOSIT_ONLY';
    const rawDepositPercent = Number(config?.depositPercent);
    const depositPercent = Number.isFinite(rawDepositPercent) && rawDepositPercent > 0 ? rawDepositPercent : null;

    if (paymentOption === 'FULL_ONLY') {
        return {
            isPreOrder: item?.saleType === 'PRE_ORDER',
            paymentOption,
            depositPercent,
            dueToday: total,
            dueLater: 0,
            missingConfig: !config,
        };
    }

    if ((paymentOption === 'DEPOSIT_ONLY' || paymentOption === 'FLEXIBLE') && depositPercent) {
        const dueToday = roundMoney((total * depositPercent) / 100);
        return {
            isPreOrder: item?.saleType === 'PRE_ORDER',
            paymentOption,
            depositPercent,
            dueToday,
            dueLater: Math.max(total - dueToday, 0),
            missingConfig: !config,
        };
    }

    return {
        isPreOrder: item?.saleType === 'PRE_ORDER',
        paymentOption,
        depositPercent: null,
        dueToday: 0,
        dueLater: total,
        missingConfig: !config,
    };
};

export const collectCartCampaignIds = (items = [], campaigns = []) => {
    const preorderItems = (Array.isArray(items) ? items : []).filter((item) => item?.saleType === 'PRE_ORDER');
    const campaignIds = new Set();

    preorderItems.forEach((item) => {
        const directCampaignId = normalizeId(item?.campaignId);
        if (directCampaignId) {
            campaignIds.add(directCampaignId);
            return;
        }

        const variantId = normalizeId(getCartVariantId(item));
        if (!variantId) return;

        const matchedCampaign = (Array.isArray(campaigns) ? campaigns : []).find((campaign) => {
            const variantIds = toArray(campaign?.variantIds).map(normalizeId);
            return variantIds.includes(variantId);
        });

        const campaignId = normalizeId(matchedCampaign?.id);
        if (campaignId) campaignIds.add(campaignId);
    });

    return [...campaignIds];
};

export const resolvePreOrderPolicy = (items = [], configIndex = new Map()) => {
    const preorderItems = (Array.isArray(items) ? items : []).filter((item) => item?.saleType === 'PRE_ORDER');

    if (preorderItems.length === 0) {
        return {
            isPreOrderCart: false,
            paymentOption: null,
            depositPercent: null,
            missingConfigCount: 0,
            hasMixedPolicies: false,
            dueToday: 0,
            dueLater: 0,
        };
    }

    let selectedOption = 'DEPOSIT_ONLY';
    let selectedDepositPercent = null;
    let missingConfigCount = 0;
    let dueToday = 0;
    let dueLater = 0;
    const policyKeys = new Set();

    preorderItems.forEach((item, index) => {
        const breakdown = getPreOrderItemBreakdown(item, configIndex);

        if (breakdown.missingConfig) missingConfigCount += 1;
        if (index === 0) {
            selectedOption = breakdown.paymentOption;
            selectedDepositPercent = breakdown.depositPercent;
        }

        dueToday += breakdown.dueToday;
        dueLater += breakdown.dueLater;
        policyKeys.add(`${breakdown.paymentOption}-${breakdown.depositPercent ?? 'unknown'}`);
    });

    return {
        isPreOrderCart: true,
        paymentOption: selectedOption,
        depositPercent: selectedDepositPercent,
        missingConfigCount,
        hasMixedPolicies: policyKeys.size > 1,
        dueToday,
        dueLater,
    };
};

export const getPreOrderDepositAmount = ({ total, paymentMode, preorderPolicy }) => {
    if (!preorderPolicy?.isPreOrderCart) return 0;
    if (paymentMode === 'full' || preorderPolicy.paymentOption === 'FULL_ONLY') return total;
    if (Number(preorderPolicy?.dueToday) > 0) return preorderPolicy.dueToday;

    const depositPercent = Number(preorderPolicy.depositPercent);
    if (!Number.isFinite(depositPercent) || depositPercent <= 0) {
        return 0;
    }

    return roundMoney((total * depositPercent) / 100);
};

export const getPreOrderCartSummary = ({ totalLabel, preorderPolicy }) => {
    if (!preorderPolicy?.isPreOrderCart) return null;

    const hasDepositPercent = Number.isFinite(Number(preorderPolicy.depositPercent))
        && Number(preorderPolicy.depositPercent) > 0;
    const percentLabel = hasDepositPercent ? `${preorderPolicy.depositPercent}%` : 'theo cấu hình campaign';

    if (preorderPolicy.paymentOption === 'FULL_ONLY') {
        return {
            title: 'Thanh toán 100% tại checkout',
            detail: `Đơn pre-order này yêu cầu thanh toán toàn bộ ${totalLabel} khi sang bước checkout.`,
            dueTodayLabel: 'Thanh toán hôm nay',
            dueTodayMode: 'Thanh toán một lần',
        };
    }

    if (preorderPolicy.paymentOption === 'DEPOSIT_ONLY') {
        return {
            title: hasDepositPercent ? `Đặt cọc ${percentLabel} tại checkout` : 'Đặt cọc theo campaign tại checkout',
            detail: hasDepositPercent
                ? `Đơn pre-order này chỉ cho phép đặt cọc ${percentLabel} trước khi giữ chỗ.`
                : 'Đơn pre-order này chỉ cho phép đặt cọc theo đúng cấu hình campaign từ manager.',
            dueTodayLabel: hasDepositPercent ? `Đặt cọc ${percentLabel}` : 'Đặt cọc theo campaign',
            dueTodayMode: hasDepositPercent ? `Chỉ đặt cọc ${percentLabel}` : 'Chỉ đặt cọc theo campaign',
        };
    }

    return {
        title: 'Linh hoạt tại checkout',
        detail: hasDepositPercent
            ? `Bạn có thể chọn đặt cọc ${percentLabel} hoặc thanh toán 100% ở bước checkout.`
            : 'Bạn có thể chọn đặt cọc theo campaign hoặc thanh toán 100% ở bước checkout.',
        dueTodayLabel: hasDepositPercent ? `Từ mức cọc ${percentLabel}` : 'Theo cấu hình campaign',
        dueTodayMode: hasDepositPercent ? `Cọc ${percentLabel} hoặc thanh toán full` : 'Đặt cọc theo campaign hoặc thanh toán full',
    };
};

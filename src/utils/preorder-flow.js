const PREORDER_REMAINING_OPEN_STATUSES = new Set(['PENDING_PAYMENT']);
const PREORDER_REMAINING_DONE_STATUSES = new Set([
    'SUPPORT_CONFIRMED',
    'OPERATION_CONFIRMED',
    'SHIPPING',
    'COMPLETED',
]);

export const isPreOrder = (order) => order?.orderType === 'PRE_ORDER';

export const hasPreOrderRemainingBalance = (order) =>
    isPreOrder(order) && Number(order?.remainingAmount) > 0;

export const isPreOrderSupportApproved = (order) =>
    order?.approvalStatus === 'SUPPORT_APPROVED' || Boolean(order?.supportApprovedAt);

export const isPreOrderRemainingPaid = (order) =>
    isPreOrder(order)
    && (
        Number(order?.remainingAmount) <= 0
        || (
            hasPreOrderRemainingBalance(order)
            && (
                order?.remainingPaymentStatus === 'SUCCESS'
                || PREORDER_REMAINING_DONE_STATUSES.has(order?.orderStatus)
            )
        )
    );

export const isPreOrderFullyPaidAfterSupport = (order) =>
    isPreOrder(order)
    && Number(order?.remainingAmount) <= 0
    && isPreOrderSupportApproved(order);

export const isPreOrderRemainingOpen = (order) =>
    hasPreOrderRemainingBalance(order)
    && !isPreOrderRemainingPaid(order)
    && (
        order?.remainingPaymentOpen === true
        || isPreOrderSupportApproved(order)
        || PREORDER_REMAINING_OPEN_STATUSES.has(order?.orderStatus)
    );

export const isPreOrderWaitingSupport = (order) =>
    hasPreOrderRemainingBalance(order)
    && !isPreOrderRemainingPaid(order)
    && ['WAITING_CONFIRM', 'PAID', 'CONFIRMED'].includes(order?.orderStatus)
    && !isPreOrderSupportApproved(order);

export const canSupportConfirmPreOrder = (order) =>
    isPreOrder(order)
    && ['WAITING_CONFIRM', 'PAID', 'PENDING_PAYMENT', 'CONFIRMED'].includes(order?.orderStatus)
    && !isPreOrderSupportApproved(order);

export const isPreOrderReadyForOperation = (order) =>
    isPreOrder(order)
    && (
        isPreOrderFullyPaidAfterSupport(order)
        || order?.queueSource === 'approved_queue'
        || order?.orderStatus === 'SUPPORT_CONFIRMED'
        || order?.orderStatus === 'SHIPPING'
        || order?.orderStatus === 'COMPLETED'
    );

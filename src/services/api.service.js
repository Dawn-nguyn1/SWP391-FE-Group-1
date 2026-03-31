import axios from "./axios.customize";

/** * ==========================================
 * USER & ADMIN APIs
 * ==========================================
 */
const createUserAPI = (fullName, email, password, phone, dob, gender, role = "CUSTOMER") => 
    axios.post("/api/admin/users", { fullName, email, password, phone, dob, gender, role });

const updateUserAPI = (id, fullName, dob, gender, role) => 
    axios.put(`/api/admin/users/${id}`, { fullName, dob, gender, role });

const fetchAllUserAPI = (current = 0, size = 10, keyword = "", role = "", status = "") => {
    const URL = `/api/admin/users?page=${current}&size=${size}${keyword ? `&keyword=${keyword}` : ""}${role ? `&role=${role}` : ""}${status ? `&status=${status}` : ""}`;
    return axios.get(URL);
};

const searchAdminUsersAPI = (page = 0, size = 10, keyword = "", role = "", status = "", sort = []) => {
    const params = new URLSearchParams({ page, size });
    if (keyword) params.append('keyword', keyword);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (sort?.length) sort.forEach(s => params.append('sort', s));
    return axios.get(`/api/admin/users?${params.toString()}`);
};

const deleteUserAPI = (id) => axios.delete(`/api/admin/users/${id}`);
const getUserByIdAPI = (id) => axios.get(`/api/admin/users/${id}`);
const updateUserStatusAPI = (id, status) => axios.patch(`/api/admin/users/${id}/status`, { status });

/** * ==========================================
 * AUTHENTICATION APIs
 * ==========================================
 */
const registerUserAPI = (fullName, email, password, confirmPassword, phone, dob, gender) => 
    axios.post("/api/auth/register", { fullName, email, password, confirmPassword, phone, dob, gender });

const forgotPasswordAPI = (email) => axios.post(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`);
const resetPasswordAPI = (email, otp, newPassword) => 
    axios.post(`/api/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`);

const verifyRegisterOTPAPI = (email, otp) => axios.post(`/api/auth/register/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
const resendRegisterOTPAPI = (email) => axios.post(`/api/auth/register/resend-otp?email=${encodeURIComponent(email)}`);

const loginAPI = (username, password) => axios.post("/api/auth/login", { username, password, delay: 2000 });

/** * ==========================================
 * MANAGER PRODUCT APIs
 * ==========================================
 */
const fetchProductsAPI = () => axios.get(`/api/manager/products`);
const fetchVariantsAPI = () => axios.get(`/api/manager/variants`);

// Xử lý trùng lặp: gom 2 tên hàm về 1 logic
const fetchProductByIdAPI = (id) => axios.get(`/api/manager/products/${id}`);
const fetchManagerProductByIdAPI = fetchProductByIdAPI; 

const searchManagerProductsAPI = (page = 0, size = 10, keyword = "", brand = "", minPrice = null, maxPrice = null, inStock = null, sort = []) => {
    const params = new URLSearchParams({ page, size });
    if (keyword) params.append('keyword', keyword);
    if (brand) params.append('brand', brand);
    if (minPrice !== null) params.append('minPrice', minPrice);
    if (maxPrice !== null) params.append('maxPrice', maxPrice);
    if (inStock !== null) params.append('inStock', inStock);
    if (sort?.length) sort.forEach(s => params.append('sort', s));
    return axios.get(`/api/manager/products/search?${params.toString()}`);
};

const createProductAPI = (name, description, brandName, productImage) => axios.post("/api/manager/products", { name, description, brandName, productImage });
const createVariantAPI = (productId, sku, price, stockQuantity, saleType, allowPreorder = false) => 
    axios.post(`/api/manager/products/${productId}/variants`, { sku, price, stockQuantity, saleType, allowPreorder });

const createAttributeAPI = (variantId, attributeName, attributeValue, images = []) => {
    const normalizedImages = Array.isArray(images) ? images.map((img, index) => {
        if (!img) return null;
        const url = (typeof img === "string" ? img : img.imageUrl ?? "").trim();
        if (!url) return null;
        const sortOrder = typeof img === "object" && Number.isFinite(Number(img.sortOrder)) ? Number(img.sortOrder) : index;
        return { imageUrl: url, sortOrder };
    }).filter(Boolean) : [];
    return axios.post(`/api/manager/variants/${variantId}/attributes`, { attributeName, attributeValue, images: normalizedImages });
};

const updateProductAPI = (id, name, description, brandName, productImage) => axios.put(`/api/manager/products/${id}`, { name, description, brandName, productImage });
const updateVariantAPI = (variantId, sku, price, stockQuantity, saleType, allowPreorder = false) => 
    axios.put(`/api/manager/variants/${variantId}`, { sku, price, stockQuantity, saleType, allowPreorder });
const updateAttributeAPI = (attributeId, attributeName, attributeValue) => axios.put(`/api/manager/attributes/${attributeId}`, { attributeName, attributeValue });

const deleteProductAPI = (id) => axios.delete(`/api/manager/products/${id}`);
const deleteVariantAPI = (variantId) => axios.delete(`/api/manager/variants/${variantId}`);
const deleteAttributeAPI = (attributeId) => axios.delete(`/api/manager/attributes/${attributeId}`);

/** * ==========================================
 * IMAGE & COMBO APIs
 * ==========================================
 */
const addImagesToAttributeAPI = (attributeId, images) => axios.post(`/api/manager/attributes/${attributeId}/images`, images);
const updateAttributeImageAPI = (imageId, imageUrl, sortOrder) => axios.put(`/api/manager/attributes/images/${imageId}`, { imageUrl, sortOrder });
const deleteAttributeImageAPI = (imageId) => axios.delete(`/api/manager/attributes/images/${imageId}`);

const fetchCombosAPI = (page = 0, size = 10) => axios.get(`/api/manager/combos`, { params: { page, size } });
const fetchComboByIdAPI = (id) => axios.get(`/api/manager/combos/${id}`);
const createComboAPI = (name, description, imageUrl, items) => axios.post("/api/manager/combos", { name, description, imageUrl, items });
const updateComboAPI = (id, name, description, imageUrl, items) => axios.put(`/api/manager/combos/${id}`, { name, description, imageUrl, items });
const deleteComboAPI = (id) => axios.delete(`/api/manager/combos/${id}`);

/** * ==========================================
 * PUBLIC, CART & CUSTOMER APIs
 * ==========================================
 */
const getPublicProductsAPI = (params) => axios.get('/api/public/products', { params });
const searchProductsAPI = (params) => axios.get('/api/public/products/search', { params });
const getPublicProductDetailAPI = (id) => axios.get(`/api/public/products/${id}`);
const getBrandsAPI = () => axios.get('/api/public/products/brands');
const getPublicCombosAPI = (page = 0, size = 10) => axios.get('/api/public/products/combos', { params: { page, size } });
const getPublicComboDetailAPI = (id) => axios.get(`/api/public/products/combos/${id}`);

const getCartAPI = () => axios.get('/api/customer/cart');
const addToCartAPI = (productVariantId, quantity) => axios.post('/api/customer/cart/add', { productVariantId, quantity });
const updateCartItemAPI = (itemId, quantity) => axios.put(`/api/customer/cart/items/${itemId}`, { quantity });
const removeCartItemAPI = (itemId) => axios.delete(`/api/customer/cart/items/${itemId}`);
const updateCartSummaryAPI = (dto) => axios.put('/api/customer/cart/summary', dto);
const clearCartAPI = () => axios.delete('/api/customer/cart/clear');
const checkoutAPI = (dto) => axios.post('/api/customer/cart/checkout', dto);

const getProfileAPI = () => axios.get('/api/customer/profile');
const updateProfileAPI = (dto) => axios.put('/api/customer/profile', dto);
const changePasswordAPI = (dto) => axios.put('/api/customer/profile/change-password', dto);
const deleteProfileAPI = () => axios.delete('/api/customer/profile');
const getAddressesAPI = () => axios.get('/api/customer/addresses');
const createAddressAPI = (dto) => axios.post('/api/customer/addresses', dto);
const updateAddressAPI = (addressId, dto) => axios.put(`/api/customer/addresses/${addressId}`, dto);
const setDefaultAddressAPI = (addressId) => axios.patch(`/api/customer/addresses/${addressId}/default`);
const deleteAddressAPI = (addressId) => axios.delete(`/api/customer/addresses/${addressId}`);

const cancelOrderByCustomerAPI = (orderId) => axios.put(`/api/customer/orders/${orderId}/cancel`);
const getCustomerOrdersAPI = () => axios.get('/api/customer/my/orders');
const getCustomerOrderDetailAPI = (orderId) => axios.get(`/api/customer/my/orders/${orderId}`);
const getCustomerPaymentsAPI = () => axios.get('/api/customer/payments');
const payRemainingOrderAPI = (orderId) => axios.post(`/api/customer/orders/${orderId}/pay-remaining`);

const createCustomerReturnRequestAPI = (dto) => axios.post('/api/customer/return-requests', dto);
const getCustomerReturnRequestsAPI = () => axios.get('/api/customer/return-requests');
const getCustomerReturnRequestDetailAPI = (id) => axios.get(`/api/customer/return-requests/${id}`);
const getCustomerRefundRequestsByOrderAPI = (orderId) => axios.get(`/api/customer/orders/${orderId}/refund-requests`);

/** * ==========================================
 * STAFF & MANAGEMENT APIs
 * ==========================================
 */
// Support & Operations Staff
const getSupportWaitingOrdersAPI = (page = 0, size = 20, sort = ['createdAt,desc', 'id,desc']) => axios.get('/api/support_staff/orders/waiting', { params: { page, size, sort } });
const getSupportOrdersAPI = () => axios.get('/api/support_staff/orders');
const getSupportOrderDetailAPI = (orderId) => axios.get(`/api/support_staff/orders/${orderId}`);
const supportConfirmOrderAPI = (orderId) => axios.post(`/api/support_staff/orders/${orderId}/confirm`);
const supportCancelOrderAPI = (orderId, body) => axios.post(`/api/support_staff/orders/${orderId}/cancel`, body);
const getSupportReturnRequestsAPI = () => axios.get('/api/support_staff/return-requests/submitted');
const supportApproveReturnRequestAPI = (id) => axios.post(`/api/support_staff/return-requests/${id}/approve`);
const supportRejectReturnRequestAPI = (id, note) => axios.post(`/api/support_staff/return-requests/${id}/reject`, note ? { note } : {});
const getSupportRefundRequestsAPI = () => axios.get('/api/support_staff/refund-requests/requested');
const supportDoneRefundRequestAPI = (id, note) => axios.post(`/api/support_staff/refund-requests/${id}/done`, note ? { note } : {});
const supportRejectRefundRequestAPI = (id, note) => axios.post(`/api/support_staff/refund-requests/${id}/reject`, note ? { note } : {});

const getOperationOrdersAPI = () => axios.get('/api/operation_staff/orders');
const getApprovedOrdersAPI = (page = 0, size = 20, sort = ['createdAt,desc', 'id,desc']) => axios.get('/api/operation_staff/orders/approved', { params: { page, size, sort } });
const getOperationOrderDetailAPI = (orderId) => axios.get(`/api/operation_staff/orders/${orderId}`);
const operationsConfirmOrderAPI = (orderId) => axios.post(`/api/operation_staff/orders/${orderId}/confirm`);
const getOperationReturnRequestsAPI = () => axios.get('/api/operation_staff/return-requests/waiting-return');
const operationReceiveReturnRequestAPI = (id, dto) => axios.post(`/api/operation_staff/return-requests/${id}/received`, dto);

/** * ==========================================
 * DASHBOARD & PREORDER APIs
 * ==========================================
 */
const vnpayReturnAPI = (params) => axios.get('/api/payment/vnpay-return', { params });

const getManagerDashboardAPI = (from, to) => axios.get('/api/manager/dashboard', { params: { from, to } });
const getDashboardOrderDetailAPI = (status, from, to, page = 0, size = 10) => {
    const params = { page, size };
    if (status && status !== 'ALL') params.status = status;
    if (from) params.from = from;
    if (to) params.to = to;
    return axios.get('/api/manager/dashboard/order-detail', { params });
};
const getDashboardRevenueDetailAPI = (type, from, to) => axios.get('/api/manager/dashboard/revenue-detail', { params: { type, from, to } });

// Xử lý trùng lặp: allocate stock
const allocateCurrentStockAPI = (variantId) => axios.post(`/api/manager/preorders/variants/${variantId}/allocate-current-stock`);
const allocateCurrentStockForPreordersAPI = allocateCurrentStockAPI;

const markPreorderStockArrivedAPI = (variantId, arrivedQuantity) => axios.post(`/api/manager/preorders/variants/${variantId}/stock-arrived`, { arrivedQuantity });

const fetchPreorderCampaignsAPI = (page = 0, size = 10) => axios.get(`/api/manager/preorder-campaigns`, { params: { page, size } });
const createPreorderCampaignAPI = (data) => axios.post('/api/manager/preorder-campaigns', data);
const fetchPreorderCampaignByIdAPI = (id) => axios.get(`/api/manager/preorder-campaigns/${id}`);
const updatePreorderCampaignAPI = (id, data) => axios.put(`/api/manager/preorder-campaigns/${id}`, data);
const deletePreorderCampaignAPI = (id) => axios.delete(`/api/manager/preorder-campaigns/${id}`);
const activatePreorderCampaignAPI = (id) => axios.patch(`/api/manager/preorder-campaigns/${id}/activate`);
const deactivatePreorderCampaignAPI = (id) => axios.patch(`/api/manager/preorder-campaigns/${id}/deactivate`);

export {
    createUserAPI, updateUserAPI, fetchAllUserAPI, searchAdminUsersAPI, deleteUserAPI, getUserByIdAPI, updateUserStatusAPI,
    registerUserAPI, forgotPasswordAPI, resetPasswordAPI, verifyRegisterOTPAPI, resendRegisterOTPAPI, loginAPI,
    fetchProductsAPI, fetchVariantsAPI, fetchProductByIdAPI, createProductAPI, createVariantAPI, createAttributeAPI,
    updateProductAPI, updateVariantAPI, updateAttributeAPI, deleteProductAPI, deleteVariantAPI, deleteAttributeAPI,
    fetchManagerProductByIdAPI, addImagesToAttributeAPI, updateAttributeImageAPI, deleteAttributeImageAPI, searchManagerProductsAPI,
    fetchCombosAPI, fetchComboByIdAPI, createComboAPI, updateComboAPI, deleteComboAPI,
    getPublicProductsAPI, searchProductsAPI, getPublicProductDetailAPI, getBrandsAPI, getPublicCombosAPI, getPublicComboDetailAPI,
    getCartAPI, addToCartAPI, updateCartItemAPI, removeCartItemAPI, updateCartSummaryAPI, clearCartAPI, checkoutAPI,
    getProfileAPI, updateProfileAPI, changePasswordAPI, deleteProfileAPI, getAddressesAPI, createAddressAPI, updateAddressAPI,
    setDefaultAddressAPI, deleteAddressAPI, cancelOrderByCustomerAPI, getCustomerOrdersAPI, getCustomerOrderDetailAPI,
    getCustomerPaymentsAPI, payRemainingOrderAPI, createCustomerReturnRequestAPI, getCustomerReturnRequestsAPI,
    getCustomerReturnRequestDetailAPI, getCustomerRefundRequestsByOrderAPI,
    getSupportWaitingOrdersAPI, getSupportOrdersAPI, getSupportOrderDetailAPI, supportConfirmOrderAPI, supportCancelOrderAPI,
    getSupportReturnRequestsAPI, supportApproveReturnRequestAPI, supportRejectReturnRequestAPI,
    getSupportRefundRequestsAPI, supportDoneRefundRequestAPI, supportRejectRefundRequestAPI,
    getOperationOrdersAPI, getApprovedOrdersAPI, getOperationOrderDetailAPI, operationsConfirmOrderAPI,
    getOperationReturnRequestsAPI, operationReceiveReturnRequestAPI,
    vnpayReturnAPI, getManagerDashboardAPI, getDashboardOrderDetailAPI, getDashboardRevenueDetailAPI,
    markPreorderStockArrivedAPI, allocateCurrentStockForPreordersAPI, allocateCurrentStockAPI,
    fetchPreorderCampaignsAPI, createPreorderCampaignAPI, fetchPreorderCampaignByIdAPI, updatePreorderCampaignAPI,
    deletePreorderCampaignAPI, activatePreorderCampaignAPI, deactivatePreorderCampaignAPI
};
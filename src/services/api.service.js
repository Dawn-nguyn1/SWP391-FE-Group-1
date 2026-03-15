import axios from "./axios.customize";

// user and authentication API

// UPDATED USER APIs - Admin endpoints

const createUserAPI = (fullName, email, password, phone, dob, gender, role = "CUSTOMER") => {
    const URL_BACKEND = "/api/admin/users";
    const data = { fullName, email, password, phone, dob, gender, role };
    return axios.post(URL_BACKEND, data);
}

const updateUserAPI = (id, fullName, dob, gender, role) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    const data = { fullName, dob, gender, role };
    return axios.put(URL_BACKEND, data);
}

const fetchAllUserAPI = (current = 0, size = 10, keyword = "", role = "", status = "") => {
    const URL_BACKEND = `/api/admin/users?page=${current}&size=${size}${keyword ? `&keyword=${keyword}` : ""}${role ? `&role=${role}` : ""}${status ? `&status=${status}` : ""}`;
    return axios.get(URL_BACKEND);
}

const searchAdminUsersAPI = (page = 0, size = 10, keyword = "", role = "", status = "", sort = []) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (keyword) params.append('keyword', keyword);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (sort && sort.length > 0) {
        sort.forEach(s => params.append('sort', s));
    }
    
    const URL_BACKEND = `/api/admin/users?${params.toString()}`;
    return axios.get(URL_BACKEND);
}

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    return axios.delete(URL_BACKEND);
}

const getUserByIdAPI = (id) => {
    const URL_BACKEND = `/api/admin/users/${id}`;
    return axios.get(URL_BACKEND);
}

const updateUserStatusAPI = (id, status) => {
    const URL_BACKEND = `/api/admin/users/${id}/status`;
    const data = { status };
    return axios.patch(URL_BACKEND, data);
}

const handleUploadFile = (file, folder) => {
    const URL_BACKEND = `/api/v1/file/upload`;
    let config = {
        headers: {
            "upload-type": folder,
            "Content-Type": "multipart/form-data"
        }
    }
    const bodyFormData = new FormData();
    bodyFormData.append("fileImg", file);
    return axios.post(URL_BACKEND, bodyFormData, config);
}

const updateUserAvatarAPI = (avatar, _id, fullName, phone) => {
    const URL_BACKEND = "/api/v1/user";
    const data = {
        _id: _id,
        avatar: avatar,
        fullName: fullName,
        phone: phone
    }
    return axios.put(URL_BACKEND, data);
}

const getUserDetailAPI = (id) => {
    const URL_BACKEND = `/api/v1/user/${id}`;
    return axios.get(URL_BACKEND);
}

const registerUserAPI = (fullName, email, password, confirmPassword, phone, dob, gender) => {
    const URL_BACKEND = "/api/auth/register";
    const data = {
        fullName: fullName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        phone: phone,
        dob: dob,
        gender: gender
    }
    return axios.post(URL_BACKEND, data);
}

const forgotPasswordAPI = (email) => {
    const URL_BACKEND = `/api/auth/forgot-password?email=${encodeURIComponent(email)}`;
    return axios.post(URL_BACKEND);
}

const resetPasswordAPI = (email, otp, newPassword) => {
    const URL_BACKEND = `/api/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`;
    return axios.post(URL_BACKEND);
}

const verifyRegisterOTPAPI = (email, otp) => {
    const URL_BACKEND = `/api/auth/register/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
    return axios.post(URL_BACKEND);
}

// DOC1 version - đúng hơn
const loginAPI = (username, password) => {
    const URL_BACKEND = "/api/auth/login";
    const data = {
        username: username,
        password: password,
        delay: 2000
    }
    return axios.post(URL_BACKEND, data);
}

const getAccountAPI = () => {
    const URL_BACKEND = "/api/v1/auth/account";
    return axios.get(URL_BACKEND);
}

const logoutAPI = () => {
    const URL_BACKEND = "/api/v1/auth/logout";
    return axios.post(URL_BACKEND);
}


// product API

const fetchProductsAPI = () => {
    const URL_BACKEND = `/api/manager/products`;
    return axios.get(URL_BACKEND);
}

const searchManagerProductsAPI = (page = 0, size = 10, keyword = "", brand = "", minPrice = null, maxPrice = null, inStock = null, sort = []) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (keyword) params.append('keyword', keyword);
    if (brand) params.append('brand', brand);
    if (minPrice !== null) params.append('minPrice', minPrice);
    if (maxPrice !== null) params.append('maxPrice', maxPrice);
    if (inStock !== null) params.append('inStock', inStock);
    if (sort && sort.length > 0) {
        sort.forEach(s => params.append('sort', s));
    }
    
    const URL_BACKEND = `/api/manager/products/search?${params.toString()}`;
    return axios.get(URL_BACKEND);
}

const fetchVariantsAPI = () => {
    const URL_BACKEND = `/api/manager/variants`;
    return axios.get(URL_BACKEND);
}

const fetchProductByIdAPI = (id) => {
    const URL_BACKEND = `/api/manager/products/${id}`;
    return axios.get(URL_BACKEND);
}

// Sequential Product Creation APIs
const createProductAPI = (name, description, brandName, productImage) => {
    const URL_BACKEND = "/api/manager/products";
    const data = { name, description, brandName, productImage };
    return axios.post(URL_BACKEND, data);
}

const createVariantAPI = (productId, sku, price, stockQuantity) => {
    const URL_BACKEND = `/api/manager/products/${productId}/variants`;
    const data = { sku, price, stockQuantity, saleType: "IN_STOCK" };
    return axios.post(URL_BACKEND, data);
}

const createAttributeAPI = (variantId, attributeName, attributeValue, images = []) => {
    const URL_BACKEND = `/api/manager/variants/${variantId}/attributes`;
    // images có thể là:
    // - mảng string: ["https://..."]
    // - mảng object: [{ imageUrl, sortOrder }]
    const normalizedImages = Array.isArray(images)
        ? images
            .map((img, index) => {
                if (!img) return null;
                if (typeof img === "string") {
                    const url = img.trim();
                    if (!url) return null;
                    return { imageUrl: url, sortOrder: index };
                }
                const imageUrl = (img.imageUrl ?? "").toString().trim();
                if (!imageUrl) return null;
                const sortOrder = Number.isFinite(Number(img.sortOrder)) ? Number(img.sortOrder) : index;
                return { imageUrl, sortOrder };
            })
            .filter(Boolean)
        : [];

    const data = { attributeName, attributeValue, images: normalizedImages };
    return axios.post(URL_BACKEND, data);
}

// Update APIs
const updateProductAPI = (id, name, description, brandName, productImage) => {
    const URL_BACKEND = `/api/manager/products/${id}`;
    const data = { name, description, brandName, productImage };
    return axios.put(URL_BACKEND, data);
}

const updateVariantAPI = (variantId, sku, price, stockQuantity, saleType) => {
    const URL_BACKEND = `/api/manager/variants/${variantId}`;
    const data = { sku, price, stockQuantity, saleType };
    return axios.put(URL_BACKEND, data);
}

const updateAttributeAPI = (attributeId, attributeName, attributeValue) => {
    const URL_BACKEND = `/api/manager/attributes/${attributeId}`;
    const data = { attributeName, attributeValue };
    return axios.put(URL_BACKEND, data);
}

const deleteProductAPI = (id) => {
    const URL_BACKEND = `/api/manager/products/${id}`;
    return axios.delete(URL_BACKEND);
}

const deleteVariantAPI = (variantId) => {
    const URL_BACKEND = `/api/manager/variants/${variantId}`;
    return axios.delete(URL_BACKEND);
}

const deleteAttributeAPI = (attributeId) => {
    const URL_BACKEND = `/api/manager/attributes/${attributeId}`;
    return axios.delete(URL_BACKEND);
}

// Image Management APIs
const addImagesToAttributeAPI = (attributeId, images) => {
    const URL_BACKEND = `/api/manager/attributes/${attributeId}/images`;
    // API expects array directly, not wrapped in object
    const data = images;
    return axios.post(URL_BACKEND, data);
}

const updateAttributeImageAPI = (imageId, imageUrl, sortOrder) => {
    const URL_BACKEND = `/api/manager/attributes/images/${imageId}`;
    const data = { imageUrl, sortOrder };
    return axios.put(URL_BACKEND, data);
}

const deleteAttributeImageAPI = (imageId) => {
    const URL_BACKEND = `/api/manager/attributes/images/${imageId}`;
    return axios.delete(URL_BACKEND);
}

// Manager Product Detail API
const fetchManagerProductByIdAPI = (id) => {
    const URL_BACKEND = `/api/manager/products/${id}`;
    return axios.get(URL_BACKEND);
}

// Combo Management APIs
const fetchCombosAPI = (page = 0, size = 10) => {
    const URL_BACKEND = `/api/manager/combos?page=${page}&size=${size}`;
    return axios.get(URL_BACKEND);
}

const fetchComboByIdAPI = (id) => {
    const URL_BACKEND = `/api/manager/combos/${id}`;
    return axios.get(URL_BACKEND);
}

const createComboAPI = (name, description, imageUrl, items) => {
    const URL_BACKEND = "/api/manager/combos";
    const data = { name, description, imageUrl, items };
    return axios.post(URL_BACKEND, data);
}

const updateComboAPI = (id, name, description, imageUrl, items) => {
    const URL_BACKEND = `/api/manager/combos/${id}`;
    const data = { name, description, imageUrl, items };
    return axios.put(URL_BACKEND, data);
}

const deleteComboAPI = (id) => {
    const URL_BACKEND = `/api/manager/combos/${id}`;
    return axios.delete(URL_BACKEND);
}

// ===== PUBLIC PRODUCT APIs =====
const getPublicProductsAPI = (params) => axios.get('/api/public/products', { params });
const searchProductsAPI = (params) => axios.get('/api/public/products/search', { params });
const getPublicProductDetailAPI = (id) => axios.get(`/api/public/products/${id}`);
const getBrandsAPI = () => axios.get('/api/public/products/brands');
const getPublicCombosAPI = (page = 0, size = 12) =>
    axios.get('/api/public/products/combos', { params: { page, size } });
const getPublicComboDetailAPI = (id) => axios.get(`/api/public/products/combos/${id}`);

// ===== CART APIs =====
const getCartAPI = () => axios.get('/api/customer/cart');
const addToCartAPI = (productVariantId, quantity) => axios.post('/api/customer/cart/add', { productVariantId, quantity });
const addComboToCartAPI = (productComboId, quantity) =>
    axios.post('/api/customer/cart/add', { productComboId, quantity });
const updateCartItemAPI = (itemId, quantity) => axios.put(`/api/customer/cart/items/${itemId}`, { quantity });
const removeCartItemAPI = (itemId) => axios.delete(`/api/customer/cart/items/${itemId}`);
const clearCartAPI = () => axios.delete('/api/customer/cart/clear');
const checkoutAPI = (dto) => axios.post('/api/customer/cart/checkout', dto);

// ===== CUSTOMER PROFILE APIs =====
const getProfileAPI = () => axios.get('/api/customer/profile');
const updateProfileAPI = (dto) => axios.put('/api/customer/profile', dto);
const changePasswordAPI = (dto) => axios.put('/api/customer/profile/change-password', dto);
const getAddressesAPI = () => axios.get('/api/customer/addresses');
const createAddressAPI = (dto) => axios.post('/api/customer/addresses', dto);
const updateAddressAPI = (addressId, dto) => axios.put(`/api/customer/addresses/${addressId}`, dto);
const setDefaultAddressAPI = (addressId) => axios.patch(`/api/customer/addresses/${addressId}/default`);
const deleteAddressAPI = (addressId) => axios.delete(`/api/customer/addresses/${addressId}`);
const getProvincesAPI = () => axios.get('/api/public/location/provinces');
const getDistrictsAPI = (provinceId) => axios.get(`/api/public/location/districts?provinceId=${provinceId}`);
const getWardsAPI = (districtId) => axios.get(`/api/public/location/wards?districtId=${districtId}`);
const cancelOrderByCustomerAPI = (orderId) => axios.put(`/api/customer/orders/${orderId}/cancel`);
const getCustomerOrdersAPI = () => axios.get('/api/customer/my/orders');
const getCustomerPaymentsAPI = () => axios.get('/api/customer/payments');
// ===== CUSTOMER RETURN REQUEST APIs =====
const submitCustomerReturnRequestAPI = (dto) => axios.post('/api/customer/return-requests', dto);
const getCustomerReturnRequestsAPI = () => axios.get('/api/customer/return-requests');
const getCustomerReturnRequestDetailAPI = (id) => axios.get(`/api/customer/return-requests/${id}`);

// ===== SUPPORT STAFF APIs =====
const getSupportOrdersAPI = () => axios.get('/api/support_staff/orders');
const supportConfirmOrderAPI = (orderId) => axios.post(`/api/support_staff/orders/${orderId}/confirm`);
const supportCancelOrderAPI = (orderId) => axios.post(`/api/support_staff/orders/${orderId}/cancel`);
const getSupportReturnRequestsAPI = () => axios.get('/api/support_staff/return-requests/submitted');
const supportApproveReturnRequestAPI = (id) => axios.post(`/api/support_staff/return-requests/${id}/approve`);
const supportRejectReturnRequestAPI = (id, note) =>
    axios.post(`/api/support_staff/return-requests/${id}/reject`, note ? { note } : {});

// ===== OPERATIONS STAFF APIs =====
const getApprovedOrdersAPI = (page = 0, size = 20) =>
    axios.get('/api/operation_staff/orders/approved', { params: { page, size } });
const operationsConfirmOrderAPI = (orderId) => axios.post(`/api/operation_staff/orders/${orderId}/confirm`);
const getOperationOrdersAPI = () => axios.get('/api/operation_staff/orders');
const getOperationReturnRequestsAPI = () => axios.get('/api/operation_staff/return-requests/waiting-return');
const operationReceiveReturnRequestAPI = (id, dto) =>
    axios.post(`/api/operation_staff/return-requests/${id}/received`, dto);

// ===== PAYMENT APIS =====
const vnpayReturnAPI = (params) => axios.get('/api/payment/vnpay-return', { params });

export {
    // Updated User APIs
    createUserAPI, updateUserAPI, fetchAllUserAPI, searchAdminUsersAPI,
    deleteUserAPI, getUserByIdAPI, updateUserStatusAPI,
    // File & Auth APIs
    handleUploadFile, updateUserAvatarAPI, getUserDetailAPI,
    registerUserAPI, forgotPasswordAPI, resetPasswordAPI, verifyRegisterOTPAPI, loginAPI, getAccountAPI,
    logoutAPI,
    // Product APIs
    fetchProductsAPI, fetchVariantsAPI, fetchProductByIdAPI,
    createProductAPI, createVariantAPI, createAttributeAPI,
    updateProductAPI, updateVariantAPI, updateAttributeAPI,
    deleteProductAPI, deleteVariantAPI, deleteAttributeAPI,
    fetchManagerProductByIdAPI,
    addImagesToAttributeAPI, updateAttributeImageAPI, deleteAttributeImageAPI,
    searchManagerProductsAPI,
    // Combo Management APIs
    fetchCombosAPI, fetchComboByIdAPI,
    createComboAPI, updateComboAPI, deleteComboAPI,
    // Public product APIs
    getPublicProductsAPI, searchProductsAPI, getPublicProductDetailAPI, getBrandsAPI,
    getPublicCombosAPI, getPublicComboDetailAPI,
    // Cart APIs
    getCartAPI, addToCartAPI, addComboToCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI, checkoutAPI,
    // Customer profile/address/order APIs
    getProfileAPI, updateProfileAPI, changePasswordAPI,
    getAddressesAPI, createAddressAPI, updateAddressAPI, setDefaultAddressAPI, deleteAddressAPI,
    cancelOrderByCustomerAPI, getCustomerOrdersAPI, getCustomerPaymentsAPI,
    submitCustomerReturnRequestAPI, getCustomerReturnRequestsAPI, getCustomerReturnRequestDetailAPI,
    getProvincesAPI, getDistrictsAPI, getWardsAPI,
    // Support Staff APIs
    getSupportOrdersAPI, supportConfirmOrderAPI, supportCancelOrderAPI,
    getSupportReturnRequestsAPI, supportApproveReturnRequestAPI, supportRejectReturnRequestAPI,
    // Operations Staff APIs
    getApprovedOrdersAPI, operationsConfirmOrderAPI,
    getOperationOrdersAPI, getOperationReturnRequestsAPI, operationReceiveReturnRequestAPI,
    // Payment APIs
    vnpayReturnAPI,
}

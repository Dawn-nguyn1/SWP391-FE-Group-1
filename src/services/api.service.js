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


//product API

const fetchProductsAPI = () => {
    const URL_BACKEND = `/api/manager/products`;
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

const createAttributeAPI = (variantId, attributeName, attributeValue) => {
    const URL_BACKEND = `/api/manager/variants/${variantId}/attributes`;
    const data = { attributeName, attributeValue };
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
    const data = { images };
    return axios.post(URL_BACKEND, data);
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

const createComboAPI = (name, description, items) => {
    const URL_BACKEND = "/api/manager/combos";
    const data = { name, description, items };
    return axios.post(URL_BACKEND, data);
}

const updateComboAPI = (id, name, description, items) => {
    const URL_BACKEND = `/api/manager/combos/${id}`;
    const data = { name, description, items };
    return axios.put(URL_BACKEND, data);
}

const deleteComboAPI = (id) => {
    const URL_BACKEND = `/api/manager/combos/${id}`;
    return axios.delete(URL_BACKEND);
}

export {
    // Updated User APIs
    createUserAPI, updateUserAPI, fetchAllUserAPI,
    deleteUserAPI, getUserByIdAPI, updateUserStatusAPI,
    // File & Auth APIs
    handleUploadFile, updateUserAvatarAPI,
    registerUserAPI, forgotPasswordAPI, resetPasswordAPI, loginAPI, getAccountAPI,
    logoutAPI,
    // Product APIs
    fetchProductsAPI, fetchProductByIdAPI,
    createProductAPI, createVariantAPI, createAttributeAPI,
    updateProductAPI, updateVariantAPI, updateAttributeAPI,
    deleteProductAPI, deleteVariantAPI, deleteAttributeAPI,
    fetchManagerProductByIdAPI,
    addImagesToAttributeAPI, deleteAttributeImageAPI,
    // Combo Management APIs
    fetchCombosAPI, fetchComboByIdAPI,
    createComboAPI, updateComboAPI, deleteComboAPI
}


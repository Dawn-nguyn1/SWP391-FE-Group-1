import axios from "./axios.customize";

// =============================================================================
// USER & AUTH APIs
// =============================================================================

const createUserAPI = (fullName, email, password, phone) => {
    const URL_BACKEND = "/api/v1/user";
    const data = { fullName, email, password, phone };
    return axios.post(URL_BACKEND, data);
}

const updateUserAPI = (_id, fullName, phone) => {
    const URL_BACKEND = `/api/v1/user`;
    const data = { _id, fullName, phone };
    return axios.put(URL_BACKEND, data);
}

const fetchAllUserAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/user?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

const deleteUserAPI = (id) => {
    const URL_BACKEND = `/api/v1/user/${id}`;
    return axios.delete(URL_BACKEND);
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

// =============================================================================
// BOOK APIs (Existing)
// =============================================================================

const fetchALlBookAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/v1/book?current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

// =============================================================================
// PRODUCT APIs (New)
// =============================================================================

const fetchProductsAPI = (current, pageSize) => {
    const URL_BACKEND = `/api/public/products/search?page=${current - 1}&size=${pageSize}`;
    return axios.get(URL_BACKEND);
}

const fetchProductByIdAPI = (id) => {
    const URL_BACKEND = `/api/public/products/${id}`;
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
    const data = { sku, price, stockQuantity };
    return axios.post(URL_BACKEND, data);
}

const createAttributeAPI = (variantId, attributeName, attributeValue) => {
    const URL_BACKEND = `/api/manager/variants/${variantId}/attributes`;
    const data = { attributeName, attributeValue };
    return axios.post(URL_BACKEND, data);
}

export {
    createUserAPI, updateUserAPI, fetchAllUserAPI,
    deleteUserAPI, handleUploadFile, updateUserAvatarAPI,
    registerUserAPI, forgotPasswordAPI, resetPasswordAPI, loginAPI, getAccountAPI,
    logoutAPI, fetchALlBookAPI,
    // Exports new endpoints
    fetchProductsAPI, fetchProductByIdAPI,
    createProductAPI, createVariantAPI, createAttributeAPI
}
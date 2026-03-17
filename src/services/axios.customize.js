// noi cau hinh interceptor
import axios from "axios";
// Set config defaults when creating the instance
// No baseURL — all /api/* requests go through Vite proxy (vite.config.js → localhost:8081)
const instance = axios.create({});


// Alter defaults after instance has been created
// instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  if (typeof window !== "undefined" && window && window.localStorage //neu co dong nay thi lay ra dong duoi
    && window.localStorage.getItem('access_token')//lay ra access_token đã set ở login để gắn header
    && !config.url.includes('/api/public/')
    && !config.url.includes('/auth/login') //không thêm header cho login/register...
    && !config.url.includes('/auth/reset-password')
    && !config.url.includes('/auth/forgot-password')
    && !config.url.includes('/auth/register')) {
    config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
  }
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) { // noi tra ve respone
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  console.log(">>>>> response tu API <<<<<:", response);
  if (response && response.data)
    return response.data;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  if (error.response && error.response.status === 500 && error.response.data?.trace?.includes('ExpiredJwtException')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  if (error.response && error.response.data) return Promise.reject(error.response.data);
  return Promise.reject(error);
});
export default instance;
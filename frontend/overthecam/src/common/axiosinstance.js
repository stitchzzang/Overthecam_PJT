import axios from "axios";

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("authAxios baseURL:", authAxios.defaults.baseURL); // 여기 추가

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.data?.message === 'EXPIRED_ACCESS_TOKEN' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        const response = await publicAxios.post('/auth/refresh', { refreshToken });

        if (response.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAxios(originalRequest);
        }
      } catch (error) {
        if (error.response?.data?.message === 'EXPIRED_REFRESH_TOKEN') {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/main/login";
          return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'));
        }
        
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/main/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

publicAxios.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";
    console.log("Request config:", {
      url: config.url,
      headers: config.headers,
      withCredentials: config.withCredentials,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

publicAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error.response.data);
  }
);

// // 환경변수 값도 직접 확인
// console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);  // 여기 추가
// console.log("Current origin:", window.location.origin);

export { authAxios, publicAxios };

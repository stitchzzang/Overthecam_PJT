import axios from "axios";
import { toast } from 'react-toastify';

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
    const token = localStorage.getItem('token');
    
    // JWT 토큰 디코딩해서 만료시간 확인
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        console.log('토큰 페이로드:', payload);
        console.log('현재 시간:', Math.floor(Date.now() / 1000));
        console.log('만료 시간:', payload.exp);
        console.log('남은 시간:', payload.exp - Math.floor(Date.now() / 1000), '초');
        
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('토큰 디코딩 에러:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 전역 변수로 토스트 표시 여부 관리
let isToastShown = false;

authAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (!originalRequest._retry && (
      error.response?.status === 401 || 
      error.response?.status === 403 || 
      error.response?.data?.message === 'EXPIRED_ACCESS_TOKEN' ||
      error.response?.data?.error?.message === 'EXPIRED_ACCESS_TOKEN'
    )) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다');
        }

        const response = await publicAxios.post('/auth/refresh', { refreshToken });

        if (response.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return authAxios(originalRequest);
        } else {
          throw new Error('토큰 갱신 실패');
        }
      } catch (refreshError) {
        if (!isToastShown) {  // 전역 플래그 체크
          isToastShown = true;  // 토스트 표시 상태로 변경
          toast.error('로그인이 만료되었습니다. 다시 로그인해 주세요.', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => {
              isToastShown = false;  // 토스트가 닫힐 때 플래그 초기화
            }
          });

          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            window.location.href = '/main/login';
          }, 3000);
        }
        return Promise.reject(refreshError);
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

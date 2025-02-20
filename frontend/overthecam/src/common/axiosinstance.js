import axios from "axios";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

      // 중복 알림 방지
      if (!isToastShown) {
        isToastShown = true;
        
        // 알림 표시
        window.alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
        // 또는 토스트 메시지 사용: toast.error("세션이 만료되었습니다. 다시 로그인해 주세요.");
        
        // 로컬 스토리지 클리어
        localStorage.clear();
        
        // 로그인 페이지로 리다이렉트
        window.location.href = '/main/login';
        
        // 5초 후 토스트 상태 초기화 (다른 페이지에서 필요할 경우)
        setTimeout(() => {
          isToastShown = false;
        }, 5000);
      }

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
          
          // 이미지의 두 번째 방식으로 수정
          return authAxios({
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`
            }
          });
        }
      } catch (error) {
        localStorage.clear();
        window.location.href = '/main/login';
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

const handleLogout = async () => {
  try {
    // 서버에 로그아웃 요청 보내기
    await authAxios.post('/auth/logout');
    
    // 로컬 스토리지 클리어
    localStorage.clear();
    
    // 로그인 페이지로 리다이렉트
    navigate('/main/login');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    // 에러가 발생해도 로컬 스토리지는 클리어하고 로그인 페이지로 이동
    localStorage.clear();
    navigate('/main/login');
  }
};

export { authAxios, publicAxios };

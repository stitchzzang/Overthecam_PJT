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

authAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.log('에러 발생:', error.response?.status);
    console.log('에러 메시지:', error.response?.data);
    
    const isTokenExpired = 
      error.response?.status === 401 || 
      error.response?.status === 403 || 
      error.response?.data?.message === 'EXPIRED_ACCESS_TOKEN' ||
      error.response?.data?.error?.message === 'EXPIRED_ACCESS_TOKEN';

    if (isTokenExpired && !originalRequest._retry) {
      console.log('토큰 만료 감지! 리프레시 시도...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log('저장된 리프레시 토큰:', refreshToken ? '존재' : '없음');

        if (!refreshToken) {
          throw new Error('리프레시 토큰이 없습니다');
        }

        console.log('리프레시 토큰으로 새 토큰 요청 시작');
        const response = await publicAxios.post('/auth/refresh', { refreshToken });
        console.log('리프레시 응답:', response);

        if (response.success) {
          console.log('새 토큰 발급 성공!');
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // 새 토큰 저장
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          console.log('원래 요청 재시도...');
          return authAxios(originalRequest);
        } else {
          console.log('리프레시 응답이 success가 아님:', response);
          throw new Error('토큰 갱신 실패');
        }
      } catch (refreshError) {
        console.error('리프레시 토큰 에러:', refreshError);
        console.log('로그아웃 처리 시작...');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/main/login';
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

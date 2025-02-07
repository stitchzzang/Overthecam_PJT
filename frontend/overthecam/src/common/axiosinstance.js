import axios from "axios";

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
});
console.log('authAxios baseURL:', authAxios.defaults.baseURL);  // 여기 추가

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 저장된 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["Content-Type"] = "application/json";
    }
    // console.log(import.meta.env.VITE_BASE_URL,)
    return config;
  },
  (error) => Promise.reject(error)
);

authAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

publicAxios.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";
    return config;
  },
  (error) => Promise.reject(error)
);

publicAxios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// 환경변수 값도 직접 확인
console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);  // 여기 추가

export { authAxios, publicAxios };

import axios from "axios"

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
});
console.log('authAxios baseURL:', authAxios.defaults.baseURL);  // 여기 추가

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰이 만료되었을 때 처리
      localStorage.removeItem("token")
      // 로그인 페이지로 리다이렉트
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
  (error) => {
    // console.log("Response error:", error.response.data);
    return Promise.reject(error.response.data);
  }
);

const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
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
  (error) => Promise.reject(error),
)

publicAxios.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error.response.data);
  }
);


// // 환경변수 값도 직접 확인
// console.log('VITE_BASE_URL:', import.meta.env.VITE_BASE_URL);  // 여기 추가
// console.log("Current origin:", window.location.origin);

export { authAxios, publicAxios };

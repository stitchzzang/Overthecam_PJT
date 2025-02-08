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
  (error) => {
    return Promise.reject(error);
  }
);

authAxios.interceptors.response.use(
  (response) => {
    return response.data;
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

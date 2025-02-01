import axios from "axios";

const authAxios = axios.create({
  baseURL: "http://i12d204.p.ssafy.io/api",
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 저장된 토큰 가져오기, cookie 로 수정 필요
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const publicAxios = axios.create({
  baseURL: "http://i12d204.p.ssafy.io/api",
});

export { authAxios, publicAxios };

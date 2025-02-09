import axios from "axios"

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
})

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

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
)

const publicAxios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
})

publicAxios.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json"
    return config
  },
  (error) => Promise.reject(error),
)

publicAxios.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    return Promise.reject(error)
  },
)

export { authAxios, publicAxios }


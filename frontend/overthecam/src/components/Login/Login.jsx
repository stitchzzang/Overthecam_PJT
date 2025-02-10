import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { publicAxios } from "../../common/axiosinstance"
import "./Auth.css"

const Login = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    rememberMe: false,
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!formData.id.trim() || !formData.password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.")
      return
    }

    const loginData = {
      email: formData.id,
      password: formData.password,
    }
    console.log("로그인 시도 (상세):", JSON.stringify(loginData, null, 2))

    try {
      const response = await publicAxios.post("/auth/login", loginData)
      console.log("서버 응답 (상세):", JSON.stringify(response.data, null, 2))
      
      if (response.data.accessToken) {
        // JWT 토큰에서 사용자 정보 추출
        const token = response.data.accessToken
        const payload = JSON.parse(atob(token.split('.')[1]))
        
        // 사용자 정보 객체 생성
        const userInfo = {
          userId: payload.userId,
          email: payload.email,
          nickname: payload.nickname
        }
        
        // localStorage에 정보 저장
        localStorage.setItem("token", token)
        localStorage.setItem("userInfo", JSON.stringify(userInfo))
        localStorage.setItem("isLoggedIn", "true")
        
        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }
        
        console.log("저장된 사용자 정보:", userInfo)
        
        // 이전 페이지가 있으면 그곳으로 이동, 없으면 홈으로 이동
        const from = location.state?.from || "/";
        navigate(from);
      }
    } catch (err) {
      console.error("로그인 에러 (상세):", JSON.stringify(err.response?.data, null, 2))
      setError(err.response?.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Login Image */}
      <div className="hidden lg:block lg:w-[55%] p-12">
        <div className="h-full w-full rounded-3xl overflow-hidden">
          <img 
            src="/images/loginPageImage.png" 
            alt="Login decoration" 
            className="w-full h-full object-cover translate-x-8"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600">로그인 후 더 많은 서비스를 만나보세요.</p>
          </div>

          {error && <p className="error-message">{error}</p>}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="ID"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-colors"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-colors"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-400 border-gray-300 rounded focus:ring-blue-100"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                로그인 유지하기
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-400 text-white py-3.5 rounded-xl hover:bg-blue-500 transition-colors font-medium"
            >
              Login
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">또는</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-[#FEE500] text-gray-800 py-3.5 rounded-xl hover:bg-[#FDD800] transition-colors font-medium flex items-center justify-center gap-2"
            >
              <img src="/kakao-icon.png" alt="Kakao" className="w-5 h-5" />
              Login with Kakao
            </button>

            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <Link to="/find-account" className="hover:text-gray-700">아이디 찾기</Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link to="/find-account" className="hover:text-gray-700">비밀번호 찾기</Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link to="/signup" className="hover:text-gray-700">회원가입</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login


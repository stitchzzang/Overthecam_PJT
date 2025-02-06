import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
      if (response.data.data.accessToken) {
        localStorage.setItem("token", response.data.data.accessToken)
        // localStorage.setItem("refreshToken", response.data.data.refreshToken)
        console.log("토큰이 로컬 스토리지에 저장되었습니다.")

        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true")
          console.log("로그인 유지 설정됨")
        }
        console.log("로그인 성공, 메인 페이지로 이동")

        // 메인 페이지로 리다이렉트
        window.location.href = "http://i12d204.p.ssafy.io/"
      }
    } catch (err) {
      console.error("로그인 에러 (상세):", JSON.stringify(err.response?.data, null, 2))
      console.error("전체 에러 객체:", err)
      setError(err.response?.data?.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.")
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <p className="auth-subtitle">로그인 후 더 많은 서비스를 만나보세요.</p>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="checkbox-field">
          <input
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">로그인 유지하기</label>
        </div>

        <button type="submit" className="submit-button">
          Login
        </button>

        <div className="divider">또는</div>

        <button type="button" className="kakao-button">
          Login with Kakao
        </button>
      </form>

      <div className="auth-links">
        <Link to="/find-account">아이디 찾기</Link>
        <Link to="/find-account">비밀번호 찾기</Link>
      </div>

      <p className="signup-text">
        아직 회원이 아니시라면? <Link to="/signup">회원가입</Link>
      </p>
    </div>
  )
}

export default Login


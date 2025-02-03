import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
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
    try {
      const response = await axios.post("/api/login", {
        id: formData.id,
        password: formData.password,
      })
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
        if (formData.rememberMe) {
          localStorage.setItem("rememberMe", "true")
        }
        navigate("/dashboard")
      }
    } catch (err) {
      setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.")
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


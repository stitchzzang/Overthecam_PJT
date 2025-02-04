import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    gender: "",
    birth: "",
    phoneNumber: "",
  })
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const registerUser = async (userData) => {
    try {
      const response = await axios.post(AUTH_URL + "/api/auth/signup", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      return response.data
    } catch (error) {
      if (error.response) {
        // 서버가 2xx 범위를 벗어나는 상태 코드로 응답한 경우
        throw new Error(error.response.data.message || "회원가입에 실패했습니다.")
      } else if (error.request) {
        // 요청이 이루어졌으나 응답을 받지 못한 경우
        throw new Error("서버로부터 응답을 받지 못했습니다.")
      } else {
        // 요청을 설정하는 중에 문제가 발생한 경우
        throw new Error("요청 설정 중 오류가 발생했습니다.")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.")
      return
    }

    try {
      const newUser = {
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        gender: formData.gender === "male" ? 1 : 2,
        birth: formData.birth,
        phoneNumber: formData.phoneNumber,
      }

      const result = await registerUser(newUser)

      setMessage(result.message)
      console.log("회원가입 성공:", result.data)

      setTimeout(() => {
        navigate("/")
      }, 3000)
    } catch (error) {
      setMessage(error.message || "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <div style={{ height: "60px", marginBottom: "10px", overflow: "auto" }}>
        {message && (
          <p
            style={{
              color: "#721c24",
              backgroundColor: "#f8d7da",
              border: "1px solid #f5c6cb",
              borderRadius: "4px",
              padding: "10px",
              margin: "0",
            }}
          >
            {message}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="email" id="email" placeholder="이메일" value={formData.email} onChange={handleChange} required />
        <input
          type="password"
          id="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          id="passwordConfirm"
          placeholder="비밀번호 확인"
          value={formData.passwordConfirm}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          id="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          required
        />
        <select id="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">성별 선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
        <input type="date" id="birth" placeholder="생년월일" value={formData.birth} onChange={handleChange} required />
        <input
          type="tel"
          id="phoneNumber"
          placeholder="전화번호"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
        <button type="submit">가입하기</button>
      </form>
      <p>
        이미 계정이 있으신가요? <Link to="/">로그인</Link>
      </p>
    </div>
  )
}

export default Signup


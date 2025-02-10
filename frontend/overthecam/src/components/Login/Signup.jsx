import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { publicAxios } from "../../common/axiosinstance"

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    username: "",
    nickname: "",
    gender: "",
    birth: "",
    phoneNumber: ""
  })
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setIsError(false)

    if (formData.password !== formData.passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.")
      setIsError(true)
      return
    }

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        nickname: formData.nickname,
        gender: parseInt(formData.gender),
        birth: formData.birth,
        phoneNumber: formData.phoneNumber
      }

      const response = await publicAxios.post("/auth/signup", signupData)
      
      if (response.data) {
        setMessage("회원가입이 완료되었습니다.")
        setIsError(false)
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (error) {
      setIsError(true)
      if (error.response) {
        setMessage(error.response.data.message || "회원가입에 실패했습니다.")
      } else if (error.request) {
        setMessage("서버와의 통신에 실패했습니다.")
      } else {
        setMessage("요청 중 오류가 발생했습니다.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Signup Image */}
      <div className="hidden lg:block lg:w-[55%] p-12">
        <div className="h-full w-full rounded-3xl overflow-hidden">
          <img 
            src="/images/loginPageImage.png" 
            alt="Signup decoration" 
            className="w-full h-full object-cover translate-x-8"
          />
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-[45%] p-12">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Signup</h1>

          {message && (
            <div
              className={`p-4 rounded-xl ${
                isError 
                  ? "bg-red-100 text-red-700 border border-red-200" 
                  : "bg-green-100 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="email" className="text-lg font-bold text-gray-900 w-32">이메일</label>
              <input
                type="email"
                id="email"
                placeholder="이메일"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="password" className="text-lg font-bold text-gray-900 w-32">비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="passwordConfirm" className="text-lg font-bold text-gray-900 w-32">비밀번호 확인</label>
              <input
                type="password"
                id="passwordConfirm"
                placeholder="비밀번호 확인"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="nickname" className="text-lg font-bold text-gray-900 w-32">닉네임</label>
              <input
                type="text"
                id="nickname"
                placeholder="닉네임"
                value={formData.nickname}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="username" className="text-lg font-bold text-gray-900 w-32">사용자 이름</label>
              <input
                type="text"
                id="username"
                placeholder="사용자 이름"
                value={formData.username}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="gender" className="text-lg font-bold text-gray-900 w-32">성별</label>
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              >
                <option value="">성별 선택</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="birth" className="text-lg font-bold text-gray-900 w-32">생년월일</label>
              <input
                type="date"
                id="birth"
                placeholder="생년월일"
                value={formData.birth}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="phoneNumber" className="text-lg font-bold text-gray-900 w-32">전화번호</label>
              <input
                type="tel"
                id="phoneNumber"
                placeholder="전화번호"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                to="/login"
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-center"
              >
                BACK
              </Link>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors"
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup


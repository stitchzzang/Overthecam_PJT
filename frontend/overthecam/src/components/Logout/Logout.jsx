import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authAxios } from "../../common/axiosinstance"

const Logout = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const handleLogout = async () => {
    try {
      const response = await authAxios.post("/auth/logout")

      if (response.code === 200) {
        // 로컬 스토리지에서 토큰 제거
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("rememberMe")

        console.log(response.message) // "로그아웃이 완료되었습니다" 출력

        // 로그인 페이지로 리다이렉트
        navigate("/login")
      } else {
        setError("로그아웃 처리 중 오류가 발생했습니다.")
      }
    } catch (err) {
      console.error("로그아웃 에러:", err)
      setError("로그아웃 처리 중 오류가 발생했습니다.")
    }
  }

  return (
    <div>
      <button onClick={handleLogout} className="logout-button">
        로그아웃
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

export default Logout


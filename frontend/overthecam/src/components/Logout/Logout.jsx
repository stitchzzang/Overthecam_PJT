import { useNavigate } from "react-router-dom"
import { privateAxios } from "../../common/axiosinstance"

const Logout = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청
      await privateAxios.post("/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      })

      // 로컬 스토리지에서 로그인 관련 정보 삭제
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("userId")
      localStorage.removeItem("rememberMe")
      localStorage.removeItem("accessToken") // 토큰도 삭제

      console.log("로그아웃 성공")
      navigate("/login")
    } catch (error) {
      console.error("로그아웃 실패:", error)
      
      // 에러가 발생하더라도 로컬의 데이터는 삭제하고 로그인 페이지로 이동
      localStorage.clear()
      navigate("/login")
    }
  }

  return (
    <button onClick={handleLogout} className="logout-button">
      로그아웃
    </button>
  )
}

export default Logout


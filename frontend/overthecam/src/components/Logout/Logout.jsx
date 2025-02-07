import { useNavigate } from "react-router-dom"

const Logout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // 로컬 스토리지에서 로그인 관련 정보 삭제
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userId")
    localStorage.removeItem("rememberMe")

    console.log("로그아웃 성공")
    navigate("/login")
  }

  return (
    <button onClick={handleLogout} className="logout-button">
      로그아웃
    </button>
  )
}

export default Logout


export const isLoggedIn = () => {
    // localStorage 또는 sessionStorage에서 로그인 상태 확인
    return localStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("isLoggedIn") === "true"
  }
  
  export const getToken = () => {
    // localStorage 또는 sessionStorage에서 토큰 가져오기
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  }
  
  export const getUserId = () => {
    // localStorage 또는 sessionStorage에서 사용자 ID 가져오기
    return localStorage.getItem("userId") || sessionStorage.getItem("userId")
  }
  
  
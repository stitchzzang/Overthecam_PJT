import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { publicAxios } from "../../common/axiosinstance";
import "./Auth.css";
import useUserStore from "../../store/User/UserStore";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Login = () => {
  const [formData, setFormData] = useState({
    id: localStorage.getItem('savedId') || "",
    password: "",
    saveId: localStorage.getItem('savedId') ? true : false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const setUserInfo = useUserStore((state) => state.setUserInfo);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.id.trim() || !formData.password.trim()) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    if (formData.saveId) {
      localStorage.setItem('savedId', formData.id);
    } else {
      localStorage.removeItem('savedId');
    }

    const loginData = {
      email: formData.id,
      password: formData.password,
    };

    try {
      const response = await publicAxios.post("/auth/login", loginData);
      
      if (response.data.accessToken) {
        const { accessToken, refreshToken, grantType, accessTokenExpiresIn } = response.data;
        
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = decodeURIComponent(escape(window.atob(base64)));
        const parsedPayload = JSON.parse(payload);

        const userInfo = {
          userId: parsedPayload.userId,
          email: parsedPayload.email,
          nickname: response.data.nickname,
          profileImage: response.data.profileImage,
          token: accessToken,
          tokenType: grantType,
          expiresIn: accessTokenExpiresIn,
          point: response.data.point,
          supportScore: response.data.supportScore
        };

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("tokenType", grantType);
        localStorage.setItem("tokenExpiresIn", accessTokenExpiresIn);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("isLoggedIn", "true");

        setUserInfo({
          isLoggedIn: true,
          userNickname: userInfo.nickname,
          userId: userInfo.userId,
          point: userInfo.point,
          cheerPoint: userInfo.cheerPoint
        });

        const from = location.state?.from || '/main';
        navigate(from);
      }
    } catch (err) {
      console.error("로그인 에러 (상세):", JSON.stringify(err.response?.data, null, 2));
      setError(err.response?.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="flex bg-white rounded-lg h-[600px] w-[1000px] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)]">
        {/* Left Side - Motion Design */}
        <div className="w-1/2 overflow-hidden">
          <CursorMotionEffect />
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-col w-1/2 items-center justify-center h-full py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2 mb-4">
            <h1 className="text-3xl font-semibold">Login</h1>
            <p className="text-lg">로그인 후 더 많은 서비스를 만나보세요.</p>
          </div>

          {error && <p className="error-message text-red-500 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-full px-12">
            <input
              type="text"
              placeholder="ID"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full px-5 py-4 text-lg border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                placeholder:text-gray-400"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeIcon className="h-6 w-6" />
                ) : (
                  <EyeSlashIcon className="h-6 w-6" />
                )}
              </button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveId"
                name="saveId"
                checked={formData.saveId}
                onChange={handleChange}
                className="w-4 h-4 text-cusBlue border-gray-300 rounded focus:ring-cusLightBlue"
              />
              <label htmlFor="saveId" className="ml-2 text-sm text-gray-600">
                아이디 저장하기
              </label>
            </div>

            <button
              type="submit"
              className="btn w-full bg-cusBlue text-cusLightBlue-lighter hover:bg-cusLightBlue hover:text-cusBlue px-10 py-3"
            >
              Login
            </button>

            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 mt-4">
              <Link to="/main/find-account" className="hover:text-gray-700">
                아이디 찾기
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link to="/main/find-account" className="hover:text-gray-700">
                비밀번호 찾기
              </Link>
              <div className="w-px h-4 bg-gray-300"></div>
              <Link to="/main/signup" className="hover:text-gray-700">
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

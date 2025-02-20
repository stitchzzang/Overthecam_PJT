import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { publicAxios } from "../../common/axiosinstance"
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign"
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    username: "",
    nickname: "",
    gender: "",
    birth: "",
    phoneNumber1: "", // 010
    phoneNumber2: "", // XXXX
    phoneNumber3: ""  // XXXX
  })
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // 전화번호 입력 필드의 숫자만 허용
    if (id.startsWith('phoneNumber')) {
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // 각 부분별 최대 길이 제한
      const maxLengths = {
        phoneNumber1: 3,
        phoneNumber2: 4,
        phoneNumber3: 4
      };
      
      if (numericValue.length <= maxLengths[id]) {
        setFormData(prev => ({ ...prev, [id]: numericValue }));
      }
      
      // 자동으로 다음 입력 필드로 포커스 이동
      if (numericValue.length === maxLengths[id]) {
        const nextField = {
          phoneNumber1: 'phoneNumber2',
          phoneNumber2: 'phoneNumber3'
        }[id];
        
        if (nextField) {
          document.getElementById(nextField)?.focus();
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
    
    setMessage("");
    setIsError(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setMessage("유효하지 않은 이메일 형식입니다");
      setIsError(true);
      return;
    }

    // 비밀번호 형식 검증
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordRegex.test(formData.password)) {
      setMessage("비밀번호는 8~20자리수여야 합니다. 영문 대소문자, 숫자, 특수문자를 1개 이상 포함해야 합니다");
      setIsError(true);
      return;
    }

    // 비밀번호 확인 검증
    if (formData.password !== formData.passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다");
      setIsError(true);
      return;
    }

    // 닉네임 길이 검증
    if (formData.nickname.trim().length < 2 || formData.nickname.trim().length > 10) {
      setMessage("닉네임은 2자 이상 10자 이하여야 합니다");
      setIsError(true);
      return;
    }

    // 전화번호 형식 검증
    if (!formData.phoneNumber1 || !formData.phoneNumber2 || !formData.phoneNumber3) {
      setMessage("전화번호를 모두 입력해주세요");
      setIsError(true);
      return;
    }

    try {
      const signupData = {
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim(),
        nickname: formData.nickname.trim(),
        gender: formData.gender === "male" ? 0 : 1,
        birth: formData.birth,
        phoneNumber: `${formData.phoneNumber1}-${formData.phoneNumber2}-${formData.phoneNumber3}`,
        
      };

      const response = await publicAxios.post("/auth/signup", signupData);
      
      if (response.success) {
        setMessage("회원가입이 완료되었습니다");
        setIsError(false);
        window.location.replace("/main/login");
      }
    } catch (error) {
      setIsError(true);
      const errorData = error.error || {};
      
      switch (errorData.code) {
        case 'DUPLICATE_EMAIL':
          setMessage("이미 등록된 이메일입니다");
          break;
        case 'DUPLICATE_NICKNAME':
          setMessage("이미 등록된 닉네임입니다");
          break;
        case 'DUPLICATE_PHONE_NUMBER':
          setMessage("이미 등록된 전화번호입니다");
          break;
        default:
          setMessage("회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
    }
  };

  return (
    <div className="flex justify-center mt-16">
      <div className="flex bg-white rounded-lg h-[600px] w-[1000px] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)]">
        {/* Left Side - Motion Design */}
        <div className="w-1/2 overflow-hidden">
          <CursorMotionEffect />
        </div>

        {/* Right Side - Signup Form */}
        <div className="flex flex-col w-1/2 items-center justify-center h-full py-4">
          <div className="flex flex-col items-center justify-center text-center space-y-2 mb-6">
            <h1 className="text-3xl font-semibold">Signup</h1>
            <p className="text-lg">회원가입 후 더 많은 서비스를 만나보세요.</p>
          </div>

          {message && (
            <p className={`${isError ? 'text-red-500' : 'text-green-500'} text-sm mb-2`}>
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-2 w-full max-w-full px-12">
            <input
              type="email"
              id="email"
              placeholder="이메일"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-2.5 text-base border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                placeholder:text-gray-400"
              required
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="비밀번호"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-2.5 text-base border border-gray-200 rounded-xl
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
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                id="passwordConfirm"
                placeholder="비밀번호 확인"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswordConfirm ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                id="username"
                placeholder="이름"
                value={formData.username}
                onChange={handleChange}
                className="w-1/2 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400"
                required
              />

              <input
                type="text"
                id="nickname"
                placeholder="닉네임"
                value={formData.nickname}
                onChange={handleChange}
                className="w-1/2 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400"
                required
              />
            </div>

            <div className="flex gap-2">
              <select
                id="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-1/3 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400"
                required
              >
                <option value="">성별</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>

              <input
                type="date"
                id="birth"
                placeholder="생년월일"
                value={formData.birth}
                onChange={handleChange}
                className="w-2/3 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400"
                required
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                id="phoneNumber1"
                placeholder="010"
                value={formData.phoneNumber1}
                onChange={handleChange}
                className="w-1/4 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400 text-center"
                maxLength="3"
                required
              />
              <span className="flex items-center">-</span>
              <input
                type="text"
                id="phoneNumber2"
                placeholder="XXXX"
                value={formData.phoneNumber2}
                onChange={handleChange}
                className="w-1/3 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400 text-center"
                maxLength="4"
                required
              />
              <span className="flex items-center">-</span>
              <input
                type="text"
                id="phoneNumber3"
                placeholder="XXXX"
                value={formData.phoneNumber3}
                onChange={handleChange}
                className="w-1/3 px-5 py-2.5 text-base border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
                  placeholder:text-gray-400 text-center"
                maxLength="4"
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-full bg-cusBlue text-cusLightBlue-lighter hover:bg-cusLightBlue hover:text-cusBlue px-10 py-2.5 mt-6"
            >
              Signup
            </button>

            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 mt-2">
              <Link to="/main/login" className="hover:text-gray-700">
                이미 계정이 있으신가요? 로그인하기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup


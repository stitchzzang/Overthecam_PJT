import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from '../../common/axiosinstance';
import VoteCreatingForm from "../../components/Vote/VoteCreatingForm";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";

export default function VoteCreatingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  // Check server availability
  useEffect(() => {
    const checkServer = async () => {
      try {
        await authAxios.get('/');
        setIsServerAvailable(true);
      } catch (error) {
        console.error("서버 연결 확인:", error);
        setIsServerAvailable(false);
      }
    };
    checkServer();
  }, []);

  const createVoteHandler = async (formData) => {
    if (!isServerAvailable) {
      alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      console.log("API 요청 정보:", {
        url: `${authAxios.defaults.baseURL}/vote/create`,
        method: 'POST',
        data: formData
      });

      const response = await authAxios.post('/vote/create', formData);
      console.log("생성된 투표:", response.data);

      navigate(`/vote-detail/${response.data.voteId}`, {
        state: { isMaster: true }
      });
    } catch (error) {
      console.error("투표 생성 실패:", {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        baseURL: authAxios.defaults.baseURL
      });

      if (error.code === "ERR_NETWORK") {
        alert(`서버 연결 실패 (${authAxios.defaults.baseURL})\n네트워크 연결을 확인해주세요.`);
        setIsServerAvailable(false);
      } else if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('투표 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="w-full h-screen bg-white flex items-center justify-center pr-10 relative">
        {/* 커서 모션 효과 영역 */}
        <div className="w-1/2 h-full flex justify-center items-center">
          <CursorMotionEffect />
        </div>

        {/* 폼 영역 */}
        <div className="w-1/2 h-full flex flex-col justify-center items-center pl-8">
          <h1 className="text-3xl font-bold mb-4 text-center">투표 생성</h1>
          <p className="text-lg mb-6 text-center">
            지금 바로 투표를 생성하고 여러분의 의견을 나눠보세요!
          </p>
          {!isServerAvailable && (
            <div className="text-red-500 mb-4">
              서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.
            </div>
          )}
          <VoteCreatingForm 
            onCreateVote={createVoteHandler} 
            disabled={isLoading || !isServerAvailable} 
          />
        </div>
      </div>
  );
}
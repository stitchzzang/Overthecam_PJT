import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAxios } from '../../common/axiosinstance';
import VoteCreatingForm from "../../components/Vote/VoteCreatingForm";
import CursorMotionEffect from "../../components/Layout/CusorMotionDesign";

export default function VoteCreatingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createVoteHandler = async (formData) => {
    setIsLoading(true);
    try {
      console.log('전송 데이터:', JSON.stringify(formData, null, 2));
      
      const response = await authAxios.post('/vote/create', formData);  // 올바른 API 경로
      
      console.log("서버 응답:", response.data);
      
      if (response.data.success && response.data.data?.voteId) {
        navigate(`/vote-detail/${response.data.data.voteId}`);
      } else {
        throw new Error(response.data.error?.message || '투표 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error("투표 생성 실패:", error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert(error.message || '투표 생성에 실패했습니다.');
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
        <VoteCreatingForm 
          onCreateVote={createVoteHandler} 
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
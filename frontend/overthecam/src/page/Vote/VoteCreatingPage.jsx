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
      const response = await authAxios.post('/vote/create', formData);
      
      if (response.data?.voteId) {
        navigate(`/main/vote-detail/${response.data.voteId}`);
      } else {
        throw new Error('투표 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error("투표 생성 실패:", error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/main/login');
      } else {
        alert(error.message || '투표 생성에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="flex bg-white rounded-lg h-[600px] w-[1000px] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.2),inset_-0px_-2px_4px_rgba(0,0,0,0.2)]">
        <div className="w-1/2 overflow-hidden">
          <CursorMotionEffect />
        </div>
        <div className="flex flex-col w-1/2 items-center justify-center h-full py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2 mb-4">
            <h1 className="text-3xl font-semibold">투표 생성</h1>
            <p className="text-lg">투표를 만들고 다양한 의견을 나눠보세요!</p>
          </div>
          <VoteCreatingForm 
            onCreateVote={createVoteHandler} 
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
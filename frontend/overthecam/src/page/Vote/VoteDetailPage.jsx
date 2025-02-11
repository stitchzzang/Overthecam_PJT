import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAxios } from '../../common/axiosinstance';
import VoteDetail from '../../components/Vote/VoteDetail';
import VoteDetailComment from '../../components/Vote/VoteDetailComment';

export default function VoteDetailPage() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  const [voteData, setVoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVoteDetail = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get(`/vote/${voteId}`);
        
        if (response.data.success) {
          const data = response.data.data;
          setVoteData({
            ...data,
            isCreator: Number(localStorage.getItem('userId')) === Number(data.creatorUserId)
          });
          setError(null);
        } else {
          throw new Error('투표 정보를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Failed to fetch vote:', error);
        setError('투표 정보를 불러오는데 실패했습니다.');
        
        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVoteDetail();
  }, [voteId, navigate]);

  const handleDelete = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token');
      
      // 사용자 정보 및 토큰 유효성 검사
      if (!userInfo.userId || !token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return false;
      }

      // 작성자 확인
      if (Number(userInfo.userId) !== Number(voteData.creatorUserId)) {
        alert('삭제 권한이 없습니다.');
        return false;
      }

      // 삭제 요청 전 데이터 유효성 검사
      if (!voteId || !voteData) {
        alert('잘못된 요청입니다.');
        return false;
      }

      // 삭제 요청
      const response = await authAxios.delete(`/vote/${voteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          userId: Number(userInfo.userId),
          battleId: voteData.battleId || null
        }
      });

      // 응답 처리
      if (response.data?.success) {
        alert('투표가 삭제되었습니다.');
        navigate('/vote-inprogress', { replace: true });
        return true;
      }

      throw new Error(response.data?.error?.message || '투표 삭제에 실패했습니다.');
    } catch (error) {
      console.error('Delete error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });

      let errorMessage = '투표 삭제 중 오류가 발생했습니다.';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }

      alert(errorMessage);
      return false;
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>
      
      <VoteDetail voteData={voteData} onDelete={handleDelete} />
      <VoteDetailComment voteId={voteId} />
    </div>
  );
}
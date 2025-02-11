import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authAxios } from '../../common/axiosinstance';
import VoteDetail from '../../components/Vote/VoteDetail';
import VoteDetailComment from '../../components/Vote/VoteDetailComment';

export default function VoteDetailPage() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  const [voteData, setVoteData] = useState(null);

  useEffect(() => {
    const fetchVoteDetail = async () => {
      try {
        const response = await authAxios.get(`/vote/${voteId}`);
        console.log('Vote detail response:', response.data);
        
        if (response.data.success) {
          // userId와 creatorUserId를 포함하여 데이터 설정
          const data = response.data.data;
          console.log('Current userId:', localStorage.getItem('userId'));
          console.log('Creator userId:', data.creatorUserId);
          
          setVoteData({
            ...data,
            isCreator: Number(localStorage.getItem('userId')) === Number(data.creatorUserId)
          });
        }
      } catch (error) {
        console.error('Failed to fetch vote:', error);
        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          navigate('/login');
        }
      }
    };

    fetchVoteDetail();
  }, [voteId, navigate]);

  const handleDelete = async () => {
    try {
      // 사용자 정보와 토큰 확인
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = localStorage.getItem('token');
      
      if (!userInfo.userId || !token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return false;
      }

      // 권한 체크
      if (Number(userInfo.userId) !== Number(voteData.creatorUserId)) {
        alert('삭제 권한이 없습니다.');
        return false;
      }

      const response = await authAxios({
        method: 'DELETE',
        url: `/vote/${voteId}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: { userId: userInfo.userId }  // 필요한 경우 userId 전송
      });

      console.log('Delete API Response:', response);

      // 성공 처리
      if (response.status === 200 || response.status === 204 || response.data?.success) {
        alert('투표가 삭제되었습니다.');
        navigate('/vote-inprogress', { replace: true });
        return true;
      }

      throw new Error('투표 삭제에 실패했습니다.');
    } catch (error) {
      console.error('Delete error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });

      // 서버 에러 상세 정보
      if (error.response?.data?.error) {
        console.error('Server error details:', error.response.data.error);
      }

      let errorMessage;
      switch (error.response?.status) {
        case 400:
          errorMessage = '잘못된 요청입니다.';
          break;
        case 401:
          errorMessage = '로그인이 필요합니다.';
          navigate('/login');
          break;
        case 403:
          errorMessage = '삭제 권한이 없습니다.';
          break;
        case 404:
          errorMessage = '투표를 찾을 수 없습니다.';
          break;
        case 500:
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          errorMessage = '투표 삭제 중 오류가 발생했습니다.';
      }

      alert(errorMessage);
      return false;
    }
  };

  if (!voteData) return <div>로딩 중...</div>;

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
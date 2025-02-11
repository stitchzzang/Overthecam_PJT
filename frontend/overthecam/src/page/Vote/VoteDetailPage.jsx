import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';
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
        
        if (response.success) {
          const data = response.data;
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
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return false;
      }

      // publicAxios 대신 authAxios 사용
      await authAxios.delete(`/vote/${voteId}`);
      
      navigate('/vote', { replace: true });
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        alert('투표를 삭제할 권한이 없습니다.');
      } else {
        alert('투표 삭제에 실패했습니다.');
      }
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
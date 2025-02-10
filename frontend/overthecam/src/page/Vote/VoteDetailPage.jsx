import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';
import VoteDetail from '../../components/Vote/VoteDetail';
import VoteDetailComment from '../../components/Vote/VoteDetailComment';

export default function VoteDetailPage() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  const [voteData, setVoteData] = useState(null);

  useEffect(() => {
    const fetchVoteDetail = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      try {
        const response = await publicAxios.get(`/vote/${voteId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Fetched vote details:', response.data);
        setVoteData(response.data);
      } catch (error) {
        console.error('Failed to fetch vote details:', error);
        if (error.response?.status === 401) {
          alert('로그인이 필요하거나 세션이 만료되었습니다.');
          localStorage.removeItem('token');
          navigate('/login');
        } else if (error.response?.status === 400) {
          alert('잘못된 입력값입니다.');
        } else if (error.response?.status === 404) {
          alert('투표를 찾을 수 없습니다.');
          navigate('/vote');
        } else {
          alert('예기치 않은 오류가 발생했습니다.');
        }
      }
    };

    fetchVoteDetail();
  }, [voteId, navigate]);

  const handleDelete = async () => {
    try {
      await publicAxios.delete(`/vote/${voteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Vote deleted:', voteId);
      navigate('/vote');
    } catch (error) {
      if (error.response?.status === 400) {
        console.error('Invalid input data:', error.response.data);
        alert('잘못된 입력값입니다.');
      } else if (error.response?.status === 404) {
        console.error('Resource not found:', error.response.data);
        alert('투표를 찾을 수 없습니다.');
      } else {
        console.error('Failed to delete vote:', error);
        alert('투표 삭제에 실패했습니다.');
      }
    }
  };

  if (!voteData) return <div>로딩 중...</div>;

  return (
    <div>
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>
      
      <VoteDetail voteData={voteData} />
      <VoteDetailComment voteId={voteId} />
    </div>
  );
}
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
      try {
        const response = await publicAxios.get(`/vote/${voteId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Fetched vote details:', response.data);
        setVoteData(response.data);
      } catch (error) {
        if (error.response?.status === 400) {
          console.error('Invalid input data:', error.response.data);
          alert('잘못된 입력값입니다.');
        } else if (error.response?.status === 404) {
          console.error('Resource not found:', error.response.data);
          alert('투표를 찾을 수 없습니다.');
        } else {
          console.error('Failed to fetch vote details:', error);
          navigate('/vote');
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
      <VoteDetail voteId={voteId} />
      <div>{voteData.content}</div>
      <VoteDetailComment voteId={voteId} />
      <button onClick={() => navigate(`/edit-vote/${voteId}`)}>Edit</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
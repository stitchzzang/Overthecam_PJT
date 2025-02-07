import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const VoteDetail = ({ voteId }) => {
  const navigate = useNavigate();
  const [voteData, setVoteData] = useState(null);

  useEffect(() => {
    const fetchVoteDetail = async () => {
      try {
        console.log('Fetching vote details for voteId:', voteId);
        const response = await publicAxios.get(`/vote/${voteId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Fetched vote details:', response.data);
        setVoteData(response.data);
      } catch (error) {
        console.error('Failed to fetch vote details:', error);
        if (error.response?.status === 400) {
          console.error('Invalid input data:', error.response.data);
          alert('잘못된 입력값입니다.');
        } else if (error.response?.status === 401) {
          console.error('Unauthorized access:', error.response.data);
          alert('인증되지 않은 접근입니다.');
        } else if (error.response?.status === 404) {
          console.error('Vote not found:', error.response.data);
          alert('투표를 찾을 수 없습니다.');
        } else {
          console.error('An unexpected error occurred:', error.response?.data || error.message);
          alert('예기치 않은 오류가 발생했습니다.');
        }
      }
    };

    fetchVoteDetail();
  }, [voteId]);

  if (!voteData) return <div>로딩 중...</div>;

  return (
    <div>
      <h1>{voteData.title}</h1>
      <p>Date: {voteData.createdAt} | Author: {voteData.creatorNickname}</p>
      <p>{voteData.content}</p>
      <div style={{ display: 'flex', width: '100%', height: '30px', backgroundColor: '#e0e0e0' }}>
        {voteData.options.map((option, index) => (
          <div key={option.optionId} style={{ width: `${option.votePercentage}%`, backgroundColor: index % 2 === 0 ? 'blue' : 'green', color: 'white', textAlign: 'center' }}>
            {option.optionTitle} ({option.votePercentage}%)
          </div>
        ))}
      </div>
      <div>
        <h3>성별 통계</h3>
        <div style={{ marginTop: '10px' }}>
          <h4>남성</h4>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '15px', backgroundColor: '#e0e0e0' }}>
            {voteData.options.map((option, index) => (
              <div key={option.optionId} style={{ width: `${option.genderDistribution['남성']}%`, backgroundColor: index % 2 === 0 ? 'blue' : 'green', color: 'white', textAlign: 'center', marginLeft: index === 0 ? 'auto' : '0', marginRight: index === 1 ? 'auto' : '0' }}>
                {option.genderDistribution['남성']}%
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '10px' }}>
          <h4>여성</h4>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '15px', backgroundColor: '#e0e0e0' }}>
            {voteData.options.map((option, index) => (
              <div key={option.optionId} style={{ width: `${option.genderDistribution['여성']}%`, backgroundColor: index % 2 === 0 ? 'blue' : 'green', color: 'white', textAlign: 'center', marginLeft: index === 0 ? 'auto' : '0', marginRight: index === 1 ? 'auto' : '0' }}>
                {option.genderDistribution['여성']}%
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h3>연령별 통계</h3>
        {['10대', '20대', '30대', '40대', '50대', '60대 이상'].map((ageRange, ageIndex) => (
          <div key={ageIndex} style={{ marginTop: '10px' }}>
            <h4>{ageRange}</h4>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '15px', backgroundColor: '#e0e0e0' }}>
              {voteData.options.map((option, index) => (
                <div key={option.optionId} style={{ width: `${option.ageDistribution[ageRange]}%`, backgroundColor: index % 2 === 0 ? 'blue' : 'green', color: 'white', textAlign: 'center', marginLeft: index === 0 ? 'auto' : '0', marginRight: index === 1 ? 'auto' : '0' }}>
                  {option.ageDistribution[ageRange]}%
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p>Participants: {voteData.options.reduce((acc, option) => acc + option.voteCount, 0)} | Comments: {voteData.comments}</p>
      <button onClick={() => navigate(`/edit-vote/${voteData.voteId}`)}>Edit</button>
      <button onClick={() => navigate(`/delete-vote/${voteData.voteId}`)}>Delete</button>
    </div>
  );
}

export default VoteDetail;
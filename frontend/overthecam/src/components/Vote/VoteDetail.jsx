import React, { useState } from 'react';

const VoteDetail = () => {
  const [voteData, setVoteData] = useState({
    voteId: 10,
    battleId: 300,
    title: '오늘의 점심 메뉴',
    content: '점심 메뉴를 선택해주세요',
    creatorNickname: '테스터1',
    endDate: '2025-02-11T23:59:59',
    createdAt: '2025-02-04T21:51:42.565054',
    options: [
      { optionId: 33, optionTitle: '한식', voteCount: 200, votePercentage: 20.0, ageDistribution: { '30대': 20.0 }, genderDistribution: { '남성': 20.0 } },
      { optionId: 34, optionTitle: '중식', voteCount: 0, votePercentage: 60.0, ageDistribution: { '20대': 40.0, '30대': 20.0 }, genderDistribution: { '여성': 60.0 } }
    ]
  });

  return (
    <div>
      <h1>{voteData.title}</h1>
      <p>Date: {voteData.createdAt} | Author: {voteData.creatorNickname}</p>
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
      <button>Edit</button>
      <button>Delete</button>
    </div>
  );
}

export default VoteDetail;
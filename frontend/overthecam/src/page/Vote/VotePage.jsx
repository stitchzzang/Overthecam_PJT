import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { publicAxios, authAxios } from '../../common/axiosinstance';

const VotePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [currentList, setCurrentList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [voteStatus, setVoteStatus] = useState('all'); // 'all', 'active', 'ended'

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const votedItems = getVotedItems();

      if (!navigator.onLine) {
        setError('인터넷 연결이 없습니다. 네트워크 상태를 확인해주세요.');
        return;
      }

      // status 파라미터 추가
      const params = {
        page: page - 1,
        size: 5,
        includeVoteResult: true
      };

      // voteStatus가 'all'이 아닐 때만 status 파라미터 추가
      if (voteStatus !== 'all') {
        params.status = voteStatus;
      }

      const response = await publicAxios.get('/vote/list', { params });

      if (response.data?.content) {
        const votesWithResults = response.data.content.map(vote => ({
          ...vote,
          hasVoted: token ? (vote.hasVoted || votedItems[vote.voteId] === true) : false,
          options: vote.options.map(option => ({
            ...option,
            votePercentage: option.votePercentage || 0
          }))
        }));
        setCurrentList(votesWithResults);
        setTotalPages(response.data.pageInfo.totalPages);
        setError(null);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [page, voteStatus]);

  // 로컬 스토리지에서 투표 정보를 가져오는 함수
  const getVotedItems = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return {};
    
    const userId = JSON.parse(userInfo).userId;
    const votedItems = localStorage.getItem(`votedItems_${userId}`);
    return votedItems ? JSON.parse(votedItems) : {};
  };

  // 투표 정보를 로컬 스토리지에 저장하는 함수
  const saveVotedItem = (voteId) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return;
    
    const userId = JSON.parse(userInfo).userId;
    const votedItems = getVotedItems();
    votedItems[voteId] = true;
    localStorage.setItem(`votedItems_${userId}`, JSON.stringify(votedItems));
  };

  // 사용자 나이 계산 함수
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // 연령대 변환 함수
  const getAgeGroup = (age) => {
    if (age < 20) return '10';
    if (age < 30) return '20';
    if (age < 40) return '30';
    if (age < 50) return '40';
    return '50';
  };

  // 투표 처리 함수 수정
  const handleVote = async (vote, optionId) => {
    try {
      const token = localStorage.getItem('token');
      const userInfoStr = localStorage.getItem('userInfo');
      
      if (!token || !userInfoStr) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      if (vote.hasVoted) {
        return;
      }

      // 사용자 정보에서 성별과 생년월일 가져오기
      const userInfo = JSON.parse(userInfoStr);
      const age = calculateAge(userInfo.birth);
      const ageGroup = getAgeGroup(age);
      const gender = userInfo.gender === 0 ? 'male' : 'female';

      // 투표 요청에 성별과 연령대 정보 포함
      const response = await authAxios.post(`/vote/${vote.voteId}/vote/${optionId}`, {
        age: ageGroup,
        gender: gender
      });

      if (response.status === 200) {
        saveVotedItem(vote.voteId);
        await fetchVotes();
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error?.code === 'DUPLICATE_VOTE') {
        saveVotedItem(vote.voteId);
        await fetchVotes();
      } else if (err.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
      } else {
        alert('투표 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 투표 결과 렌더링 함수
  const renderVoteResult = (vote) => (
    <div className="mb-4">
      {vote.options && vote.options.length >= 2 && (
        <>
          <div className="mb-2 flex justify-between">
            <span className="text-red-500 font-medium">{vote.options[0].optionTitle}</span>
            <span className="text-blue-500 font-medium">{vote.options[1].optionTitle}</span>
          </div>
          <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-red-500 flex items-center justify-start pl-2 text-white"
              style={{ width: `${vote.options[0].votePercentage}%` }}
            >
              {vote.options[0].votePercentage.toFixed(1)}%
            </div>
            <div
              className="absolute right-0 top-0 h-full bg-blue-500 flex items-center justify-end pr-2 text-white"
              style={{ width: `${vote.options[1].votePercentage}%` }}
            >
              {vote.options[1].votePercentage.toFixed(1)}%
            </div>
          </div>
          <div className="text-right text-sm text-gray-600 mt-2">
            총 투표수: {vote.options.reduce((sum, option) => sum + option.voteCount, 0)}
          </div>
        </>
      )}
    </div>
  );

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-[800px] mx-auto p-4">
      {/* 그라데이션 헤더 */}
      <div className="relative p-10 bg-gradient-to-r from-[#FFD6D6] to-[#D6DFFF]">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Vote</h1>
      </div>

      {/* 필터링 버튼 */}
      <div className="flex justify-center gap-4 my-6">
        <button
          onClick={() => setVoteStatus('all')}
          className={`px-6 py-2 rounded-full transition-colors ${
            voteStatus === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          전체보기
        </button>
        <button
          onClick={() => setVoteStatus('active')}
          className={`px-6 py-2 rounded-full transition-colors ${
            voteStatus === 'active'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          진행중
        </button>
        <button
          onClick={() => setVoteStatus('ended')}
          className={`px-6 py-2 rounded-full transition-colors ${
            voteStatus === 'ended'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          종료됨
        </button>
      </div>

      {/* 투표 목록 */}
      <div className="space-y-4 mt-4">
        {currentList.length > 0 ? (
          currentList.map((vote) => (
            <div key={vote.voteId} className="bg-white rounded-lg shadow-lg p-6">
              <Link to={`/vote-detail/${vote.voteId}`}>
                <h2 className="text-xl font-bold mb-4 hover:text-blue-600 cursor-pointer">
                  {vote.title}
                </h2>
              </Link>
              
              <p className="text-gray-600 mb-4">{vote.content}</p>

              <div className="transition-all duration-300">
                {vote.hasVoted ? (
                  renderVoteResult(vote)
                ) : (
                  <div className="flex gap-4 mb-4">
                    {vote.options.map((option) => (
                      <button
                        key={option.optionId}
                        onClick={() => handleVote(vote, option.optionId)}
                        className={`flex-1 p-4 ${
                          option.optionId === vote.options[0].optionId
                            ? 'bg-red-100 hover:bg-red-200 text-red-500'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-500'
                        } rounded-lg transition-colors`}
                      >
                        {option.optionTitle}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{vote.creatorNickname}</span>
                <span>·</span>
                <span>댓글 {vote.commentCount}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">투표가 없습니다.</div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6 pb-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {'<<'}
          </button>
          <button
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              page === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {'<'}
          </button>
          <span className="mx-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {'>'}
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              page === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotePage; 
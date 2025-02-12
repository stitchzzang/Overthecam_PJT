import React, { useState, useEffect } from 'react';
import { publicAxios } from '../../common/axiosinstance';

const VoteDetailComment = ({ voteId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // 댓글 목록 조회
  useEffect(() => {
    fetchComments();
  }, [voteId]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('토큰이 없습니다.');
        return;
      }

      const response = await publicAxios.get(`/vote/${voteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.comments && Array.isArray(response.data.comments)) {
        const userInfo = localStorage.getItem('userInfo');
        const currentUserId = userInfo ? JSON.parse(userInfo).userId : null;
        
        const commentsWithAuthor = response.data.comments.map(comment => ({
          ...comment,
          isAuthor: currentUserId && Number(comment.userId) === Number(currentUserId)
        }));
        
        const sortedComments = [...commentsWithAuthor].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  // 댓글 작성
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await publicAxios.post(`/vote/${voteId}/comment`, 
        { content: newComment },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setNewComment('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    }
  };

  // 댓글 수정
  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await publicAxios.put(
        `/vote/comment/${commentId}`,
        { content: editContent },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 수정 성공 시 즉시 UI 업데이트
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.commentId === commentId 
            ? { 
                ...comment, 
                content: editContent,
                updatedAt: new Date().toISOString() // 현재 시간으로 updatedAt 업데이트
              }
            : comment
        )
      );
      
      setEditingCommentId(null);
      setEditContent('');

    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await publicAxios.delete(
        `/vote/comment/${commentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // 삭제 성공 시 즉시 UI 업데이트
      setComments(prevComments => 
        prevComments.filter(comment => comment.commentId !== commentId)
      );

    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // formatDate 함수 수정
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '.').replace(/ /g, ' ');
  };

  return (
    <div className="w-full max-w-[800px] mx-auto my-7">
      <div className="clay bg-cusLightBlue-lighter p-4">
        <h2 className="text-xl font-bold mb-4">댓글</h2>
        
        {/* 댓글 목록 */}
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment.commentId} className="flex flex-col">
              {/* 댓글 작성자 정보 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-cusBlack">{comment.userNickname || '익명'}</span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && ' (수정됨)'}
                </span>
                {comment.isAuthor && (
                  <div className="flex gap-2 text-xs items-center ml-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.commentId);
                        setEditContent(comment.content);
                      }}
                      className="text-cusBlue hover:text-opacity-80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(comment.commentId)}
                      className="text-cusBlue hover:text-opacity-80 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              {/* 댓글 내용 */}
              {editingCommentId === comment.commentId ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-cusBlue focus:border-transparent"
                  />
                  <button
                    onClick={() => handleEdit(comment.commentId)}
                    className="btn bg-cusBlue text-white px-4 py-2"
                  >
                    완료
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditContent('');
                    }}
                    className="btn bg-gray-500 text-white px-4 py-2"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="relative clay bg-white rounded-lg p-3 max-w-[80%] shadow-lg before:content-[''] before:absolute before:top-[-6px] before:left-[15px] before:w-3 before:h-3 before:bg-white before:rotate-45 before:rounded-sm before:shadow-lg">
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 댓글 입력 폼 */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 h-10 px-4 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-cusBlue focus:border-transparent"
          />
          <button
            type="submit"
            className="btn bg-cusBlue text-white px-4 h-10"
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
};

export default VoteDetailComment;
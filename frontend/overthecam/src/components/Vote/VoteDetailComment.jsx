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
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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

      const response = await publicAxios({
        method: 'PUT',
        url: `/vote/comment/${commentId}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          content: editContent
        }
      });

      if (response.data) {
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.commentId === commentId 
              ? { ...comment, content: editContent }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditContent('');
      }
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

      // 즉시 UI에서 댓글 제거 
      setComments(prevComments => 
        prevComments.filter(comment => comment.commentId !== commentId)
      );
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto mt-4">
      {/* 댓글 목록 */}
      <div className="mb-4 bg-white rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">댓글</h2>
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.commentId} className="border-b border-gray-100 pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{comment.userNickname || '익명'}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {/* 수정/삭제 버튼 - 작성자인 경우에만 표시 */}
                {comment.isAuthor && (
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.commentId);
                        setEditContent(comment.content);
                      }}
                      className="text-[#7986CB] hover:text-[#6977BD]"
                    >
                      수정
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => handleDelete(comment.commentId)}
                      className="text-[#7986CB] hover:text-[#6977BD]"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              {editingCommentId === comment.commentId ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-[#EEF1FF] p-3 rounded-lg flex items-center gap-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 h-9 px-3 text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => handleEdit(comment.commentId)}
                      className="h-9 px-4 text-sm bg-[#7986CB] text-white rounded-lg hover:bg-[#6977BD] transition-colors"
                    >
                      완료
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent('');
                      }}
                      className="h-9 px-4 text-sm bg-[#7986CB] text-white rounded-lg hover:bg-[#6977BD] transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">{comment.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 입력 폼 */}
      <form onSubmit={handleSubmit} className="bg-[#EEF1FF] p-3 rounded-lg flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="flex-1 h-9 px-3 text-sm rounded-lg border-0 focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="h-9 px-4 text-sm bg-[#7986CB] text-white rounded-lg hover:bg-[#6977BD] transition-colors"
        >
          등록
        </button>
      </form>
    </div>
  );
};

export default VoteDetailComment;
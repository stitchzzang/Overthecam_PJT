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

      // GET 메서드를 POST로 변경
      const response = await publicAxios.post(`/vote/comment/${voteId}/list`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response.data)) {
        setComments(response.data);
      } else if (response.data.content && Array.isArray(response.data.content)) {
        setComments(response.data.content);
      } else {
        console.error('댓글 데이터 형식이 잘못되었습니다:', response.data);
        setComments([]);
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
      }
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
      await publicAxios.put(`/vote/comment/${commentId}`,
        { content: editContent },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setEditingCommentId(null);
      setEditContent('');
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await publicAxios.delete(`/vote/comment/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-[800px] mx-auto mt-4">
      {/* 댓글 목록 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">댓글</h2>
        <div className="space-y-4">
          {Array.isArray(comments) && comments.map((comment) => (
            <div key={comment.commentId} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold">{comment.userNickname || '익명'}</div>
                <div className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
                {comment.isAuthor && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.commentId);
                        setEditContent(comment.content);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(comment.commentId)}
                      className="text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              {editingCommentId === comment.commentId ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={() => handleEdit(comment.commentId)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    완료
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommentId(null);
                      setEditContent('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="text-gray-700">{comment.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 댓글 입력 폼 */}
      <form onSubmit={handleSubmit} className="bg-[#EEF1FF] p-4 rounded-lg">
        <div className="flex">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 p-3 rounded-lg mr-2 border-0 focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-[#7986CB] text-white px-6 py-2 rounded-lg hover:bg-[#6977BD] transition-colors"
          >
            등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default VoteDetailComment;
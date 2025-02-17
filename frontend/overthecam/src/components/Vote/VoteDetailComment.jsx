import React, { useState, useEffect, useRef } from 'react';
import { publicAxios } from '../../common/axiosinstance';
import CommentDeleteModal from './VoteModal/CommentDeleteModal';

const VoteDetailComment = ({ voteId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const deleteModalRef = useRef();
  const [selectedCommentId, setSelectedCommentId] = useState(null);

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
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return false;
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
      return true;

    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      return false;
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
        <div className="flex items-center gap-2 mb-4 justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="w-6 h-6 text-gray-700"
          >
            <path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM12 2C6.47715 2 2 6.47715 2 12C2 13.7025 2.42544 15.3056 3.17581 16.7088L2 22L7.29117 20.8242C8.6944 21.5746 10.2975 22 12 22C17.5228 22 22 17.5228 22 12C22 11.5975 21.9762 11.2002 21.9298 10.8094L19.9437 11.0452C19.9809 11.3579 20 11.6765 20 12C20 16.4183 16.4183 20 12 20C10.6655 20 9.38248 19.6745 8.23428 19.0605L7.58075 18.711L4.63416 19.3658L5.28896 16.4192L4.93949 15.7657C4.32549 14.6175 4 13.3345 4 12C4 7.58172 7.58172 4 12 4C12.6919 4 13.3618 4.0876 14 4.25179L14.4983 2.31487C13.6987 2.10914 12.8614 2 12 2ZM9 12H7C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12H15C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12Z"></path>
          </svg>
          <h2 className="text-xl font-bold">댓글</h2>
        </div>
        
        {/* 댓글 목록 */}
        <div className="space-y-4 mb-4 px-4">
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
                      onClick={() => {
                        setSelectedCommentId(comment.commentId);
                        deleteModalRef.current?.showModal();
                      }}
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
                <div className="relative clay bg-white rounded-lg py-3 px-5 w-fit max-w-[80%] shadow-lg before:content-[''] before:absolute before:top-[-6px] before:left-[15px] before:w-3 before:h-3 before:bg-white before:rotate-45 before:rounded-sm before:shadow-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap text-justify">{comment.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 댓글 입력 폼 */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3 mt-6 px-4">
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
      <CommentDeleteModal 
        ref={deleteModalRef} 
        onDelete={() => handleDelete(selectedCommentId)} 
      />
    </div>
  );
};

export default VoteDetailComment;
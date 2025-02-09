import React from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAxios } from '../../common/axiosinstance';

const VoteDeleteModal = ({ voteId, onClose }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      await publicAxios.delete(`/vote/${voteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      navigate('/vote-inprogress', { replace: true });
    } catch (error) {
      console.error('Failed to delete vote:', error);
      if (error.response?.status === 403) {
        alert('투표를 삭제할 권한이 없습니다.');
      } else {
        alert('투표 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold mb-4">투표 삭제</h3>
        <p className="mb-6">정말로 이 투표를 삭제하시겠습니까?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteDeleteModal;

import { forwardRef, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../../../common/axiosinstance';
import SuccessAlertModal from '../../@common/SuccessAlertModal';
import FailAlertModal from '../../@common/FailAlertModal';

const VoteDeleteModal = forwardRef(function VoteDeleteModal(
  { voteId },
  ref
) {
  const navigate = useNavigate();
  const successAlertRef = useRef();
  const failAlertRef = useRef();

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        failAlertRef.current.showAlert('로그인이 필요합니다.');
        setTimeout(() => {
          navigate('/main/login');
        }, 1500);
        return;
      }

      await authAxios.delete(`/vote/${voteId}`);
      if (ref.current) {
        ref.current.close();
      }
      successAlertRef.current.showAlert('투표가 성공적으로 삭제되었습니다.');
      
      setTimeout(() => {
        navigate('/main/vote', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('Failed to delete vote:', error);
      if (ref.current) {
        ref.current.close();
      }
      
      if (error.response?.status === 403) {
        failAlertRef.current.showAlert('투표를 삭제할 권한이 없습니다.');
      } else {
        failAlertRef.current.showAlert('투표 삭제에 실패했습니다.');
      }
    }
  };

  const handleClick = (e) => {
    if (e.target === ref.current) {
      ref.current.close();
    }
  };

  return (
    <>
      <dialog
        ref={ref}
        onClick={handleClick}
        className="rounded-xl shadow-2xl p-6 w-full max-w-md backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col items-center gap-4">
          <h4 className="text-xl font-bold text-cusBlack">투표 삭제</h4>
          <h5 className="text-lg font-semibold text-cusBlack">
            정말로 이 투표를 삭제하시겠습니까?
          </h5>
          <div className="flex gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => ref.current.close()}
              className="btn flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-300 font-semibold"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn flex-1 py-2 px-4 bg-cusRed hover:bg-cusRed-light text-white rounded-lg transition-all duration-300 font-semibold"
            >
              삭제
            </button>
          </div>
        </div>
      </dialog>
      <SuccessAlertModal ref={successAlertRef} />
      <FailAlertModal ref={failAlertRef} />
    </>
  );
});

export default VoteDeleteModal;

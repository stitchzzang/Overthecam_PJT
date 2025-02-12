import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import FailAlertModal from "../../../@common/FailAlertModal";

const BattlerSettingModal = forwardRef(function BattlerSettingModal(_, ref) {
  const modalRef = useRef();
  const failToast = useRef();
  // api response로 선택지, user 정보 넘겨주기

  const [battlers, setBattlers] = useState([]);
  const [participants, setParticipants] = useState([
    {
      participantName: "우끼끼 정해기",
    },
    {
      participantName: "빽다방구라치노",
    },
    {
      participantName: "우르르롹끼",
    },
    {
      participantName: "붐샤카라카",
    },
  ]);

  const handleChange = (e) => {};

  useImperativeHandle(ref, () => ({
    showModal: (option1, option2) => {
      try {
        modalRef.current?.showModal();
        // 배틀러 두명이 잘 선정 되었는지?
      } catch (error) {
        console.error("모달 표시 중 에러:", error);
      }
    },
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 유효성 검사
      // api 검사해서 post 요청
      // 성공 하면 모달 닫기
      modalRef.current?.close();
    } catch (error) {
      console.error("투표 생성 중 에러:", error);
      if (modalRef.current) {
        modalRef.current.close();
      }
      if (failToast.current && failToast.current.showAlert) {
        failToast.current?.showAlert("배틀러를 선정하지 못했습니다.");
      } else {
        console.error("failAlertRef.current나 showAlert 메서드가 없습니다.");
      }
    }
  }

  return (
    <>
      <dialog ref={modalRef}>
        <div>
          <h1>배틀러 선정</h1>
        </div>
        <div className="flex">
          <div>
            <p>선택지 1</p>
          </div>
          <div>
            <p>선택지 2</p>
          </div>
        </div>
      </dialog>
      <FailAlertModal ref={failToast}/>
    </>
  );
});

export default BattlerSettingModal;

import { forwardRef, useRef, useState } from "react";

const BattlerSettingModal = forwardRef(function BattlerSettingModal(_, ref) {
  const modalRef = useRef();
  const FailToast = useRef();
  // api response로 선택지, user 정보 넘겨주기

  const [battlers, setBattlers] = useState([]);
  const [participants, setParticipants] = useState([]);

  return (
    <>
      <dialog>
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
    </>
  );
});

export default BattlerSettingModal;

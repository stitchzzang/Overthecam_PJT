import { Form } from "react-router-dom";

function BattleCreateForm({ onCreateRoom }) {
  // creat 버튼 누르면면 세션 생성 됨, 생성한 사람한테 master(방장 부여)
  // webRTC 연결 후 다른 사람들이 들어 올 수 있게 해야함 방 id, 제목 등 post 보내고...
  // 사람들이 join the session 할 수 있도록 (메인이나, 다른 곳에서 할 수 잇게)
  // webRTC에서 세션 들어오는 버튼 = Link 이도록 해야할듯
  // router name - battle-room/:battleId

  return (
    <form action="">
      <label htmlFor="battleName">방 제목</label>
      <input type="text" id="battleName" name="battleName" />
      <button type="submit" onClick={onCreateRoom}>
        Create !
      </button>
    </form>
  );
}

export default BattleCreateForm;

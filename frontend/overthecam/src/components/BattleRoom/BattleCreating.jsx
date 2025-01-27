import BattleCreateForm from "./BattleCreatingForm";

function BattleCreate() {

    function createBattle() {
        // post 방 생성
        // post 방장 부여
        // post 방 id
        // post 방 제목 
    }

    function createBattleRoomHandler(event) {
        event.preventDefault();
        createBattle();
        console.log("방을 생성 합니다");
        // createBattle() 호출
        // battle-room/:battleId 로 이동
    }


    return (
        <div>
            <h1>방 만들기</h1>
            <p>지금 바로 배틀 방을 만들고 논쟁을 즐겨보세요!</p>
            <BattleCreateForm onCreateRoom={createBattleRoomHandler} />
        </div>
    )
}

export default BattleCreate;
import { Link } from "react-router-dom";

function BattleListItem (props) {
    return (
      <div>
        <p>{props.BattleName}</p>
        <Link to={`/battle-room/${props.sessionId}`}>입장하기</Link>
      </div>
    );
}

export default BattleListItem;
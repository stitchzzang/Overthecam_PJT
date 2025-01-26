import { Form } from "react-router-dom";

function BattleCreateForm() {
    return (
        <form action="">
            <label htmlFor="battleName">방 제목</label>
            <input type="text" id="battleName" name="battleName" />
            <button type="submit">Create !</button>
        </form>
    )
}

export default BattleCreateForm;
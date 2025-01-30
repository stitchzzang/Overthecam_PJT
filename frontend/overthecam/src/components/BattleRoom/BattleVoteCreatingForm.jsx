import { useState } from "react";

function BattleVoteCreatingForm() {

    const [voteName, setVoteName] = useState("");
    const [description, setDescription] = useState("");
    const [selection1, setSelection1] = useState("");
    const [selection2, setSelection2] = useState("");

    const handleNameChange = (event) => {
        setVoteName(event.target.value);
    }

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    }

    const handleSelection1Change = (event) => {
        setSelection1(event.target.value);
    }

    const handleSelection2Change = (event) => {
        setSelection2(event.target.value);
    }

    const handleClick = (event) => {
        event.preventDefault();
        // useState에 저장된 값들을 axios 요청으로 투표 보내기기
    }

    return (
      <>
        <form>
          <label htmlFor="voteName">투표 제목</label>
          <input type="text" name="" id="voteName" onChange={handleNameChange}/>
          <label htmlFor="description">설명</label>
          <input type="text" name="" id="description" onChange={handleDescriptionChange} />
          <label htmlFor="selection1">선택지1</label>
          <input type="text" name="" id="selection1" onChange={handleSelection1Change}/>
          <label htmlFor="selection2">선택지2</label>
          <input type="text" name="" id="selection2" onChange={handleSelection2Change}/>
          <input type="submit" value="확인" onClick={handleClick}/>
        </form>
      </>
    );
}

export default BattleVoteCreatingForm;
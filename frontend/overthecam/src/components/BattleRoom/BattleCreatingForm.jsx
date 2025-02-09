import { useState } from "react";

function BattleCreateForm({ onCreateRoom }) {
  const [title, setTitle] = useState("");

  const getTitle = (event) => {
    setTitle(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("제출된 title 값:", title);
    await onCreateRoom(title);
  };

  return (
    <form onSubmit={handleSubmit}>
      {" "}
      {/* Use onSubmit instead of onClick */}
      <label htmlFor="battleName">방 제목</label>
      <input
        type="text"
        id="battleName"
        name="battleName"
        value={title} // Ensure input is controlled
        onChange={getTitle}
      />
      <button type="submit">Create !</button>
    </form>
  );
}

export default BattleCreateForm;

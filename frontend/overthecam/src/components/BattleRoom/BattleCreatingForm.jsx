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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 w-full max-w-full px-12"
    >
      {" "}
      {/* Use onSubmit instead of onClick */}
      <input
        type="text"
        id="battleName"
        name="battleName"
        value={title} // Ensure input is controlled
        placeholder="방 제목을 입력하세요"
        className="w-full px-5 py-4 text-lg border border-gray-200 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-cusLightBlue focus:border-transparent
    placeholder:text-gray-400"
        onChange={getTitle}
      />
      <button
        type="submit"
        className="btn w-1/3 self-center bg-cusBlue text-cusLightBlue-lighter hover:bg-cusLightBlue hover:text-cusBlue px-10 py-3"
      >
        Create !
      </button>
    </form>
  );
}

export default BattleCreateForm;

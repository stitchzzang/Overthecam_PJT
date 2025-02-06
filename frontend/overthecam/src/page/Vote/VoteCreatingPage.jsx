import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VoteCreatingForm from "../../components/Vote/VoteCreatingForm";

export default function VoteCreatingPage() {
  const [voteId, setVoteId] = useState("exampleVoteId"); // 투표 아이디(번호)
  const navigate = useNavigate();

  const createVoteHandler = async (event) => {
    event.preventDefault();

    try {
      console.log("투표를 생성합니다");
      navigate(`/vote-room/${voteId}`, {
        state: {
          sessionId: voteId,
          isMaster: true,
        },
      });
    } catch (error) {
      console.error("Vote room navigation error:", error);
    }
  };

  return (
    <div>
      <h1>Create a vote</h1>
      <VoteCreatingForm onCreateVote={createVoteHandler} />
    </div>
  );
}
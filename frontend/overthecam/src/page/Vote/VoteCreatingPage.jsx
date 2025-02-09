import { useState } from "react";
import { useNavigate } from "react-router-dom";
import VoteCreatingForm from "../../components/Vote/VoteCreatingForm";

export default function VoteCreatingPage() {
  const [voteId, setVoteId] = useState("voteId"); // 투표 아이디(번호)
  const [content, setContent] = useState(""); // 투표 내용
  const navigate = useNavigate();

  const createVoteHandler = async (event) => {
    event.preventDefault();

    try {
      console.log("투표를 생성합니다");
      console.log("Input data:", { voteId, content });
      navigate(`/api/vote-detail/${voteId}`, {
        state: {
          sessionId: voteId,
          isMaster: true,
        },
      });
    } catch (error) {
      console.error("Vote room navigation error:", error);
      if (error.response?.status === 400) {
        console.error('Invalid input data:', error.response.data);
        alert('잘못된 입력값입니다.');
      } else if (error.response?.status === 404) {
        console.error('Resource not found:', error.response.data);
        alert('투표를 찾을 수 없습니다.');
      } else {
        console.error('Vote creation failed:', error);
        alert('투표 생성에 실패했습니다.');
      }
    }
  };

  return (
    <div>
      <h1>Create a vote</h1>
      <VoteCreatingForm onCreateVote={createVoteHandler} content={content} />
    </div>
  );
}
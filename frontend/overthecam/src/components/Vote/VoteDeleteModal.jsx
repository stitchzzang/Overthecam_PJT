import React from 'react';
import { useNavigate } from 'react-router-dom';

const VoteDeleteModal = ({ voteId }) => {
  const navigate = useNavigate();

  const handleDelete = () => {
    // Logic to delete the vote
    console.log('Vote Deleted');
    navigate('/vote-inprogress');
  };

  return (
    <div>
      <h1>Are you sure you want to delete this vote?</h1>
      <button onClick={handleDelete}>Yes</button>
      <button onClick={() => navigate(-1)}>No</button>
    </div>
  );
};

export default VoteDeleteModal;

import React from 'react';
import VoteCreatingForm from '../../components/Vote/VoteCreatingForm';

const VoteEditPage = () => {
  const handleEditVote = (e) => {
    e.preventDefault();
    // Logic to edit the vote
    console.log('Vote Edited');
  };

  return (
    <div>
      <h1>Edit Vote</h1>
      <VoteCreatingForm onCreateVote={handleEditVote} />
    </div>
  );
};

export default VoteEditPage;

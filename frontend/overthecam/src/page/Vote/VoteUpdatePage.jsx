import React from 'react';
import VoteCreatingForm from '../../components/Vote/VoteCreatingForm';

const VoteUpdatePage = () => {
  const handleEditVote = (e) => {
    e.preventDefault();
    console.log('Vote Edited');
  };

  return (
    <div>
      <VoteCreatingForm onCreateVote={handleEditVote} />
    </div>
  );
};

export default VoteUpdatePage;

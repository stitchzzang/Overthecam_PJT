import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VoteInProgressPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await axios.get('/api/votes');
        setVotes(response.data);
      } catch (error) {
        console.error('Failed to fetch votes:', error);
        setVotes([]); // Ensure votes is an array even if the fetch fails
      }
    };

    fetchVotes();
  }, []);

  const handleVote = (voteId, option) => {
    setVotes(votes.map(vote => {
      if (vote.id === voteId) {
        if (option === 'option1') {
          vote.option1Votes += 1;
        } else {
          vote.option2Votes += 1;
        }
      }
      return vote;
    }));
  };

  return (
    <div>
      {Array.isArray(votes) && votes.length > 0 ? (
        votes.map(vote => (
          <div key={vote.id}>
            <h3 onClick={() => navigate(`/vote-detail/${vote.id}`)}>{vote.title}</h3>
            <button onClick={() => handleVote(vote.id, 'option1')}>{vote.option1}</button>
            <button onClick={() => handleVote(vote.id, 'option2')}>{vote.option2}</button>
            <div>
              <span>{vote.option1}: {vote.option1Votes}%</span>
              <span>{vote.option2}: {vote.option2Votes}%</span>
            </div>
          </div>
        ))
      ) : (
        <p>No votes available.</p>
      )}
    </div>
  );
};

export default VoteInProgressPage;

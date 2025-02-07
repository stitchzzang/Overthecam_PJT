import React, { useState } from 'react';

const VoteDetailComment = () => {
  const [comments, setComments] = useState([
    { id: 1, text: 'Comment 1' },
    // ...other comments...
  ]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const handleEdit = (commentId) => {
    setEditingCommentId(commentId);
    setNewCommentText(comments.find(comment => comment.id === commentId).text);
  };

  const handleDelete = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleSave = () => {
    setComments(comments.map(comment => {
      if (comment.id === editingCommentId) {
        comment.text = newCommentText;
      }
      return comment;
    }));
    setEditingCommentId(null);
    setNewCommentText('');
  };

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          {editingCommentId === comment.id ? (
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            />
          ) : (
            <span>{comment.text}</span>
          )}
          <button onClick={() => handleEdit(comment.id)}>Edit</button>
          <button onClick={() => handleDelete(comment.id)}>Delete</button>
          {editingCommentId === comment.id && <button onClick={handleSave}>Save</button>}
        </div>
      ))}
    </div>
  );
};

export default VoteDetailComment;
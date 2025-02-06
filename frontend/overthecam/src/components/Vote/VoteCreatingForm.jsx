import React, { useState } from 'react';

const VoteCreatingForm = ({ onCreateVote }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to create a vote
        console.log('Vote Created:', { title, description, option1, option2 });
        onCreateVote(e);
        // Reset form fields
        setTitle('');
        setDescription('');
        setOption1('');
        setOption2('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>투표 제목</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>설명</label>
                <input 
                    type="text" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>선택지 1</label>
                <input 
                    type="text" 
                    value={option1} 
                    onChange={(e) => setOption1(e.target.value)} 
                    required 
                />
            </div>
            <div>
                <label>선택지 2:</label>
                <input 
                    type="text" 
                    value={option2} 
                    onChange={(e) => setOption2(e.target.value)} 
                    required 
                />
            </div>
            <button type="submit">Create!</button>
        </form>
    );
};

export default VoteCreatingForm;

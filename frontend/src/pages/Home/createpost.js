import React, {useState } from 'react';

function CreatePost() {
    const [desc, setDesc] = useState('');
    const [song_id, setSongId] = useState('');
    const [postpic, setPostpic] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const response = await fetch('post/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ desc, song_id: song_id, postpic: postpic }),
            });
            const data = await response.json();
            if (data.success){
                alert("Successfully created");
                window.location.href = '/';
            }else {
                alert("Failed to post.");
            }
        }catch (error){
            console.error("Failed to send message:", error);
        }
    }

    return (
        <div className ="create-post">
            <form onSubmit={handleSubmit}>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={"What are we thinking about?"}/>
                <input
                    type="text"
                    value={song_id}
                    onChange={(e) => setSongId(e.target.value)}
                    placeholder={"What are we listening to today?"}/>
                <input
                    type="text"
                    value={postpic}
                    onChange={(e)=>setPostpic(e.target.value)}
                    placeholder={"What are we up to today?"}/>
                <button type="submit">Post</button>
            </form>
        </div>
    )
}

export default CreatePost;

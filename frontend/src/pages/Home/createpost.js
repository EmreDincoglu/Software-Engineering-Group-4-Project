import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SongPicker = ({ onSongSelect }) => {
    const [songQ, setSongQ] = useState('');
    const [songResults, setSongResults] = useState([]);

    const handle_search = async() => {
        const response = await fetch(`/spotify/search?query=${songQ}`);
        const data = await response.json();

        if (data.success){
            setSongResults(data.data.track.items);
        }else{
            console.log('oopsies', data.error);
            setSongResults([]);
        }
    }

    return(
        <div>
            <input
                type="text"
                value={songQ}
                onChange={(e) => setSongQ(e.target.value)}
                placeholder="What are we listening to today?"/>
            <button onClick={handle_search}>Search</button>
            {songResults.length > 0 && (
                <ul>
                    {songResults.map((track) => (
                        <li key={track.id}>
                            <button onClick={() => onSongSelect(track.id)}>
                                {track.name} by {track.artists.map(artist => artist.name).join(", ")}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function CreatePost() {
    const [desc, setDesc] = useState('');
    const [postpic, setPostpic] = useState(null);
    const [song_id, set_song_id] = useState('');
    const navigate = useNavigate();

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file){
           setPostpic(file);
        }
    }

    const handleSongSelect = (id) => {
        set_song_id(id);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        if(desc) formData.append('text',desc);
        if(song_id) formData.append('song_id',song_id);
        formData.append('image',postpic);
        try{
            const response = await fetch('http://localhost:5000/post/create', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            if (!response.ok){
                throw new Error('something went wrong');
            }
            const data = await response.json();
            console.log('posted!', data);
            navigate('/home');
        }catch (error){
            console.error("error submitting post: ", error);
        }
    }

    return (
        <div className ="create-post">
            <h2>What are you up to?</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder={"What are we thinking about?"}></textarea>
                <br />
                <div className = "song-select-container">
                    <SongPicker onSongSelect={handleSongSelect}/>
                    <br/>
                </div>
                <input
                    type="file"
                    id="fileInput"
                    onChange={handleImageUpload}
                    placeholder={"What are we up to today?"}
                    required/>
                    <button type="submit">Post</button>
            </form>
        </div>
    )
}

export default CreatePost;

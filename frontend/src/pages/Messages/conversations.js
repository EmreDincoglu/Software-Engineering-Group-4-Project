import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function MutualFollowers({ userId }) {
    const [mutualFollowers, setMutualFollowers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMutualFollowers = async () => {
            try {
                const response = await fetch('/user/follower-following', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include' // Include cookies for session
                });
                const data = await response.json();
                if (data.success) {
                    setMutualFollowers(data.mutualFollowers);
                }
            } catch (error) {
                console.error("Failed to fetch mutual followers:", error);
            }
        };

        fetchMutualFollowers();
    }, []);

    const handleFollowerClick = (followerId) => {
        navigate(`/messages/${followerId}`);
    };

    return (
        <div className="mutual-followers">
            <h1>Mutual Followers</h1>
            <ul>
                {mutualFollowers.map((follower) => (
                    <li key={follower._id} onClick={() => handleFollowerClick(follower._id)}>
                        <img
                            // src={follower.profilePicture || '/default-avatar.png'}
                            alt={`${follower.username}'s avatar`}
                            className="profile-picture"
                        />
                        <span>{follower.username}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MutualFollowers;

import React from 'react';

export default function Confirmation({ setProfileComplete, ProfileComplete}) {
    const handleComplete = () => {
        setProfileComplete(true);
        alert("Profile completed!");
    };

    return (
        <div>
            <h2>Profile Completion</h2>
            <button onClick={handleComplete}>Complete Profile</button>
        </div>
    );
}

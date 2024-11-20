import React from 'react';
import './profile-steps.css';

function FirstName({profileData, setProfileData}) {
    const handleNameChange = (e) => {
        const {value} = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            firstname: value
        }));
    }
    return (
        <>
            <grid-background></grid-background>
        <div className = "profile-step-container">
            <label>Whats your first name?
            <input type={"text"}
                   name={"firstname"}
                   value={profileData.firstname}
                   onChange={handleNameChange}
                   required />
            </label>
        </div>
        </>
    )
}

export default FirstName;

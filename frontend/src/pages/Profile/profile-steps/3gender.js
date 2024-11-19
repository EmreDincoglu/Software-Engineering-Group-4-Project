import React from 'react';
import { useState } from 'react';
import Calendar from 'react-calendar';


function Gender({profileData, setProfileData}) {
    const handleGenderChange = (e) => {
        const {value} = e.target.value;
        setProfileData((prevData) => ({
            ...prevData,
            gender: prevData.gender.includes(value)
            ? prevData.gender.filter((gender) => gender !== value)
                : [...prevData.gender, value],
        }));
    }
    return (
        <>
        <div>
            <h2>Select Your Gender</h2>
            <label>
                <input
                    type="checkbox"
                    value="Man"
                    checked={profileData.gender.includes('Man')}
                    onChange={handleGenderChange}
                />
                Man
            </label>
            <label>
                <input
                    type="checkbox"
                    value="Woman"
                    checked={profileData.gender.includes('Woman')}
                    onChange={handleGenderChange}
                />
                Woman
            </label>
            <label>
                <input
                    type="checkbox"
                    value="Other"
                    checked={profileData.gender.includes('Other')}
                    onChange={handleGenderChange}
                />
                Other
            </label>
        </div>
        </>
    )
}

export default Gender;

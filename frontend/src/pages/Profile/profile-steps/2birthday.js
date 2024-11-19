import React from 'react';
import { useState } from 'react';
import Calendar from 'react-calendar';


function Birthday({profileData, setProfileData}) {
    const [value, setValue] = useState<value>(new Date());

    const calculateAge = (birthday) => {
        const today = new Date();
        const age = today.getFullYear() - birthday.getFullYear();
        const month = today.getMonth() -birthday.getMonth();
        if (month < 0 || (month ===0 && today.getDate() < birthday.getDate())){
            return age - 1;
        }
        return age;
    }
    const handleDateChange = (selectedDate) => {
        setValue(selectedDate);
        const age = calculateAge(selectedDate);
        setProfileData((prevData) => ({
            ...prevData,
            birthday: selectedDate,
            age: age
        }));
    }
    return (
        <div className = "Profile">
            <Calendar onChange={handleDateChange} value={value}/>
        </div>
    )
}

export default Birthday;

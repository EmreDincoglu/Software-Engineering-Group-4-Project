import './profile.css';
import React, { useState } from 'react';
import FirstName from './profile-steps/firstname';
import Birthday from './profile-steps/birthday';
import Confirmation from './profile-steps/confirmation';
import { useAuth } from '../Login/AuthProvider';

export default function ProfilePage(){
    const { authUser, setAuthUser, isLoggedIn, setIsLoggedIn, ProfileComplete, setProfileComplete} = useAuth();
    const [step, setStep] = useState(1);
    const [profileData, setProfileData] = useState({
        firstname: '',
        birthday: '',
        age: null,
        gender: [],
        sexual_orientation: '',
        gender_preference: [],
        relationship_goals: '',
        favorite_genres: [],
        favorite_artists: [],
        photos: []
    });

    const handleNext = () => setStep((prevStep) => prevStep + 1);
    const handlePrevious = () => setStep((prevStep) => prevStep - 1);

    const render_step_content = () => {

        switch(step){
            case 1:
                return <FirstName profileData={profileData} setProfileData={setProfileData} />;
            case 2:
                return <Birthday profileData={profileData} setProfileData={setProfileData} />;
            //  case 3:
            //     return <Gender profileData={profileData} setProfileData={setProfileData} />;
            // case 4:
            //     return <SexualOrientation profileData={profileData} setProfileData={setProfileData} />;
            // case 5:
            //     return <GenderPreference profileData={profileData} setProfileData={setProfileData} />;
            // case 6:
            //     return <RelationshipGoals profileData={profileData} setProfileData={setProfileData} />;
            // case 7:
            //     return <MusicQuestions profileData={profileData} setProfileData={setProfileData} />;
            // case 8:
            //     return <Photos profileData={profileData} setProfileData={setProfileData} />;
            case 9:
                return <Confirmation
                    profileData={profileData}
                    setProfileComplete={setProfileComplete}
                    isProfileComplete={ProfileComplete}
                />;
            default:
                return null;
        }
        // e.preventDefault();
        //
        // const formData = new FormData();
        // formData.append('profilePic',uploadedFile);
        //
        // try {
        //     const response = await fetch('http://localhost:5000/uploadProfilePic', {
        //         method: 'POST',
        //         body: formData,
        //     });
        //     const result = await response.json();
        //     if (result.success) {
        //         alert('Profile picture uploaded successfully!');
        //     } else {
        //         alert('Error uploading profile picture');
        //     }
        // } catch (error) {
        //     console.error('Error:', error);
        //     alert('Error uploading profile picture');
        // }
    }
    return (
        <><div className = "grid-background"></div>
            <div className="profile-nav">
            {render_step_content()}
            {step > 1 && <button className="next-button" onClick = {handlePrevious}>Back</button>}
            {step < 9 && <button className="prev-button" onClick = {handleNext}>Next</button>}
            </div>
        </>
);}


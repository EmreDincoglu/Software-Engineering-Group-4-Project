import './profile.css';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useAuth } from '../Login/AuthProvider';

export default function ProfilePage() {
    const { authUser, setProfileComplete, ProfileComplete } = useAuth();
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
        photos: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [photoError, setPhotoError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (ProfileComplete) {
                    const response = await fetch('http://localhost:5000/api/getProfile', { credentials: 'include' });
                    const result = await response.json();
                    console.log('Profile Fetch Result:', result);
                    if (result.success) {
                        setProfileData(result.profile);
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [ProfileComplete]);

    const handleInputChange = (key, value) => {
        setProfileData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    function calculateAge(birthday){
        const today= new Date();
        const birth = new Date(birthday);

        let age = today.getFullYear()-birth.getFullYear();

        const monthandday = today.getMonth() > birth.getMOnth() ||
            (today.getMonth() === birth.getMonth() &&
                today.getDate() >= birth.getDate());
        if (!monthandday){
            age--;
        }
        return age;
    }

    const handleBirthdayChange = (birthday) => {
        const age = calculateAge(birthday);
        setProfileData((prevData) => ({
            ...prevData,
            birthday,
            age,
        }))
    }

    const music_options = [
        {value: 'pop' , label: 'Pop'},
        {value: 'rock', label: 'Rock'},
        {value: 'hip-hop', label: 'Hip Hop'},
        {value: 'rap', label: 'Rap'},
        {value: 'country', label: 'Country'},
        {value: 'randb', label: 'R&B'},
        {value: 'folk', label: 'Folk'},
        {value: 'jazz', label: 'Jazz'},
        {value: 'heavy-metal', label:"Heavy Metal"}
    ];

    const handlePhotoUpload = async(index, event) => {
        const files = Array.from(event.target.files);
        const newPhotos = files.map((file) => URL.createObjectURL(file));

        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setPhotoError('File size must be less than 5MB.');
            return;
        }

        if (profileData.photos.length + newPhotos.length > 9) {
            setPhotoError('You can upload a maximum of 9 photos.');
            return;
        }

        const formData = new FormData();
        profileData.photos.forEach((photo) => formData.append('photos', photo));

        const photoURL = URL.createObjectURL(file);

        try {
            const response = await fetch('http://localhost:5000/api/uploadPhotos', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            const result = await response.json();
            if (result.success) {
                alert('Photos uploaded successfully!');
            } else {
                alert('Error uploading photos.');
            }
        } catch (error) {
            console.error('Error uploading photos:', error);
            alert('Something went wrong.');
        }

        setProfileData((prevData) => {
            const updatedPhotos = [...prevData.photos];
            updatedPhotos[index] = photoURL;
            return { ...prevData, photos: updatedPhotos };
        });

        setPhotoError('');
    };

    const handlePhotoRemove = (index) => {
        setProfileData((prevData) => {
            const updatedPhotos = [...prevData.photos];
            updatedPhotos[index] = null;
            return { ...prevData, photos: updatedPhotos };
        });
    }

    const handleSaveProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/editProfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                alert('Profile saved successfully!');
                setProfileComplete(true);
                setIsEditing(false);
            } else {
                alert('Error saving profile.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Something went wrong.');
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2>Enter Your First Name</h2>
                        <input
                            type="text"
                            value={profileData.firstname}
                            onChange={(e) => handleInputChange('firstname', e.target.value)}
                            placeholder="First Name"
                        />
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2>Enter Your Birthday</h2>
                        <input
                            type="date"
                            value={profileData.birthday}
                            onChange={(e) => handleBirthdayChange('birthday', e.target.value)}
                        />
                    </div>
                //     calculate age also
                );
            case 3:
            return(
                <div>
                    <h2>What is your gender</h2>
                    <div className='gender-buttons'>
                    <label>
                    <input
                        type='radio'
                        name='gender'
                        value='Man'
                        checked={profileData.gender === 'Man'}
                        onChange={(e)=> handleInputChange('gender', e.target.value)}
                    />Man
                    </label>
                    <label>
                        <input
                            type='radio'
                            name='gender'
                            value='woman'
                            checked={profileData.gender === 'Woman'}
                            onChange={(e)=>handleInputChange('gender', e.target.value)}
                            />
                        Woman
                    </label>
                    <label>
                        <input
                        type='radio'
                        name='gender'
                        value= 'other'
                        checked={profileData.gender === 'other'}
                        onChange={(e)=>handleInputChange()}
                        />
                        Other
                    </label>
                    </div>
                </div>
            );
            case 4:
                return (
                    <div>
                        <div>
                            <h2>What is your sexual orientation?</h2>
                            <div className='sexual-orientation-buttons'>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='Straight'
                                        checked={profileData.sexual_orientation === 'straight'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    />Straight
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='gay'
                                        checked={profileData.sexual_orientation === 'gay'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    />
                                    Gay
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='bisexual'
                                        checked={profileData.sexual_orientation === 'bi'}
                                        onChange={(e) => handleInputChange()}
                                    />
                                    Bisexual
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='pansexual'
                                        checked={profileData.sexual_orientation === 'pan'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    />
                                    Pansexual
                                </label>
                            {/*    keep going...*/}
                            </div>
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div>
                        <div>
                            <h2>What is your gender preference</h2>
                            <div className='gender-pref-buttons'>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='Man'
                                        checked={profileData.gender_preference === 'Man'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    />Man
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='woman'
                                        checked={profileData.gender_preference === 'Woman'}
                                        onChange={(e) => handleInputChange('gender', e.target.value)}
                                    />
                                    Woman
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='other'
                                        checked={profileData.gender_preference === 'other'}
                                        onChange={(e) => handleInputChange()}
                                    />
                                    Other
                                </label>
                            </div>
                        </div>
                    </div>
                )
            case 6:
                return (
                    <div>
                        <h2>What are your goals for a relationship?</h2>
                        <div className='relationship-goal-buttons'>
                            <label>
                                <input
                                    type='radio'
                                    name='relationshipgoal'
                                    value='short-term'
                                    checked={profileData.relationship_goals === 'Short-Term'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                />Short Term
                            </label>
                            <label>
                                <input
                                    type='radio'
                                    name='relationshipgoal'
                                    value='long-term'
                                    checked={profileData.relationship_goals === 'Long-Term'}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                />
                                Long Term
                            </label>
                            <label>
                                <input
                                    type='radio'
                                    name='relationshipgoal'
                                    value='nothing-serious'
                                    checked={profileData.relationship_goals === 'nothing-serious'}
                                    onChange={(e) => handleInputChange()}
                                />
                                    Nothing Serious
                            </label>
                        </div>
            </div>
            )
            case 7:
                const animatecomps = makeAnimated();

                return (
                   <div>
                        <h2>What are your favorite music genres & artists?</h2>
                        <h3>Pick 3 max</h3>
                        <Select
                            components={animatecomps}
                            options={music_options}
                            value={profileData.favorite_genres}
                            onChange={(e) => handleInputChange()}
                            placeholder={"Select your favorite genres"}
                        />
                    </div>
                )
            case 8:
                const defaultImage = '/default-placeholder.png';
                return (
                    <div>
                        <h2>Upload Your Best Photos</h2>
                        <div className="photo-grid">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className="photo-box">
                                    <label htmlFor={`photo-input-${index}`}>
                                        <img
                                            src={profileData.photos[index] || defaultImage}
                                            alt={`Photo ${index + 1}`}
                                            className="photo-preview"
                                        />
                                    </label>
                                    <input
                                        id={`photo-input-${index}`}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePhotoUpload(index, e)}
                                        style={{ display: 'none' }}
                                    />
                                    {profileData.photos[index] && (
                                        <button
                                            className="remove-button"
                                            onClick={() => handlePhotoRemove(index)}
                                        >Remove</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {photoError && <p style={{ color: 'red' }}>{photoError}</p>}
                    </div>
                );
            case 9:
                return (
                    <div>
                        <h2>prompts </h2>
                    </div>
                )
            default:
                return null;
        }
    };

    if (isLoading) return <div>Loading...</div>;

    if (ProfileComplete && !isEditing) {
        return (
            <div className="profile-view">
                <h1>{profileData.firstname}</h1>
                <h2> Age: {profileData.age}</h2>


                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            </div>
        );
    }

    return (
        <div className="profile-creation">
            {renderStepContent()}
            {step > 1 && <button onClick={() => setStep((prev) => prev - 1)}>Back</button>}
            {step < 9 && <button onClick={() => setStep((prev) => prev + 1)}>Next</button>}
            {step === 9 && <button onClick={handleSaveProfile}>Save Profile</button>}
        </div>
    );
}

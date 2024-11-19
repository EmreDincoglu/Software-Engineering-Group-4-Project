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

        const monthandday = today.getMonth() > birth.getMonth() ||
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

        if (!files.length) return;

        if (files.some(file => file.size > 5 * 1024 * 1024)) {
            setPhotoError('File size must be less than 5MB.');
            return;
        }

        if (profileData.photos.length + files.length > 9) {
            setPhotoError('You can upload a maximum of 9 photos.');
            return;
        }

        const newPhotoURLs = files.map(file => URL.createObjectURL(file));
        setProfileData(prevData=> ({
            ...prevData,
            photos: [...prevData.photos, ...newPhotoURLs.slice(0,9 - prevData.photos.length)],
        }))

        const formData = new FormData();
        files.forEach(file => formData.append('photos', file));

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
                            onChange={(e) => handleBirthdayChange( e.target.value)}
                        />
                    </div>
                //     calculate age also
                );
            case 3:
            return(
                <div>
                    <h2>What is your gender?</h2>
                    <div className="gender-buttons">
                        {['Man', 'Woman', 'Other'].map((genderOption) => (
                            <label key={genderOption}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value={genderOption}
                                    checked={profileData.gender === genderOption}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                />
                                {genderOption}
                            </label>
                        ))}
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
                                        onChange={(e) => handleInputChange('sexual_orientation', e.target.value)}
                                    />Straight
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='gay'
                                        checked={profileData.sexual_orientation === 'gay'}
                                        onChange={(e) => handleInputChange('sexual_orientation', e.target.value)}
                                    />
                                    Gay
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='bisexual'
                                        checked={profileData.sexual_orientation === 'bi'}
                                        onChange={(e) => handleInputChange('sexual_orientation', e.target.value)}
                                    />
                                    Bisexual
                                </label>
                                <label>
                                    <input
                                        type='radio'
                                        name='gender'
                                        value='pansexual'
                                        checked={profileData.sexual_orientation === 'pan'}
                                        onChange={(e) => handleInputChange('sexual_orientation', e.target.value)}
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
                        <h2>What is your gender preference?</h2>
                        <div className="gender-pref-buttons">
                            {['Man', 'Woman', 'Other'].map((genderprefOption) => (
                                <label key={genderprefOption}>
                                    <input
                                        type="radio"
                                        name="gender-pref"
                                        value={genderprefOption}
                                        checked={profileData.gender_preference === genderprefOption}
                                        onChange={(e) => handleInputChange('gender_preference', e.target.value)}
                                    />
                                    {genderprefOption}
                                </label>
                            ))}
                        </div>
            </div>
            )
            case 6:
                return (
                    <div>
                        <h2>What are your goals for a relationship?</h2>
                        <div className="relationship_goal-buttons">
                            {['Long-Term', 'Short-Term', 'Other'].map((relationshipOption) => (
                                <label key={relationshipOption}>
                                    <input
                                        type="radio"
                                        name="relationship"
                                        value={relationshipOption}
                                        checked={profileData.relationship_goals === relationshipOption}
                                        onChange={(e) => handleInputChange('relationship_goals', e.target.value)}
                                    />
                                    {relationshipOption}
                                </label>
                            ))}
                        </div>
                    </div>
                )
            case 7:

                return (
                    <div>
                        <h2>What are your favorite music genres & artists?</h2>
                        <h3>Pick 3 max</h3>
                        <div className="music-select">
                            <Select
                                components={makeAnimated()}
                                options={music_options}
                                value={profileData.favorite_genres.map((genre) => music_options.find((opt) => opt.value === genre))}
                                onChange={(selectedOptions) => {
                                    const selectedGenres = selectedOptions.map((option) => option.value);
                                    handleInputChange('favorite_genres', selectedGenres);
                                }}
                                placeholder="Select your favorite genres"
                               isMulti
                           />
                       </div>
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
                <div className = "basic-info">
                    <h2> Age: {profileData.age}</h2>
                    <h2> Relationship Goals: {profileData.relationship_goals}</h2>
                    <h2> Gender: {profileData.gender}</h2>
                    <h2> Sexual Orientation: {profileData.sexual_orientation}</h2>
                    <h2> Birthday: {profileData.birthday}</h2>
                </div>
                <div className="music-section">
                    <h2> Favorite Genres: {profileData.favorite_genres}</h2>
                    <h2> Favorite Artists: {profileData.favorite_artists}</h2>
                {/*    album cover pictures maybe?*/}
                </div>

                {/*Will also add pictures */}

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

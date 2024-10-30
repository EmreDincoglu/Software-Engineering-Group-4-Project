import './profile.css';
import React, { useState } from 'react';

export default function ProfilePage(){
    const [profilePic, setProfilePic] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
        setProfilePic(URL.createObjectURL(file));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('profilePic',uploadedFile);

        try {
            const response = await fetch('http://localhost:5000/uploadProfilePic', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                alert('Profile picture uploaded successfully!');
            } else {
                alert('Error uploading profile picture');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading profile picture');
        }
    }
    return (
        <><div className = "grid-background"></div>
            <div className = "profile-box-one">
                <div className = "profile-header">
            <label htmlFor="ProfilePic" className = "profile-pic-label">
                    {profilePic ? (
                        <img
                            src={profilePic}
                            alt = "Profile Preview"
                            className = "profile-pic-preview"
                        />):(<span>Upload</span>)
                    }
                </label>
                <input type = "file"
                id = "ProfilePic"
                accept = "image/*"
                onChange = { handleImageChange }
                className = "file-input"
                required
                />
                <div className="profile-info">
                    <h1>Hi! My name is </h1>
                    <div className="user-name">
                        <input type="text" class = "name-input" placeholder = "Your preferred name"
                               required/>
                    </div>
                </div>
                <div className= "age-enter">
                <h3> and I am </h3>
                <div className = "age">
                <input type = "number" class = "age-input" placeholder = "Your age"
               required/>
                </div>
                <h3> years old.</h3>
            </div>
            </div>
            <div className = "optional-prompts">
                    <div class="prompt">
                        <label for="prompt1">Choose prompt:</label>
                        <select id="prompt1">
                            <option value="" disabled selected>Pick a prompt</option>
                            <option value="1">What is your favorite hobby?</option>
                            <option value="2">What inspires you?</option>
                            <option value="3">What's your dream job?</option>
                        </select>
                        <textarea placeholder="Answer here"></textarea>
                    </div>

                    <div class="prompt">
                        <label for="prompt2">Choose prompt:</label>
                        <select id="prompt2">
                            <option value="" disabled selected>Pick a prompt</option>
                            <option value="1">Describe your ideal vacation</option>
                            <option value="2">What motivates you?</option>
                            <option value="3">What's your favorite food?</option>
                        </select>
                        <textarea placeholder="Answer here"></textarea>
                    </div>

                    <div class="prompt">
                        <label for="prompt3">Choose prompt:</label>
                        <select id="prompt3">
                            <option value="" disabled selected>Pick a prompt</option>
                            <option value="1">What are you passionate about?</option>
                            <option value="2">What is your biggest achievement?</option>
                            <option value="3">What do you want to learn next?</option>
                        </select>
                        <textarea placeholder="Answer here"></textarea>
                    </div>
                </div>
        </div>
        </>
);}

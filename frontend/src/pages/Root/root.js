import { Outlet, Link } from "react-router-dom";
import './root.css';
import React from 'react';
import { useAuth } from '../Login/AuthProvider';
// This defines global web page constants, such as the navbar


export function RootPage(){
    const { isLoggedIn } = useAuth();

    return (
    <>
        <div className='nav-bar'>
            <div className='app-name'>
                <Link className="app-name-heart" to="/">Heart</Link>
                <Link className="app-name-beatz" to="/">Beatz</Link>
            </div>
            <div className='nav-bar-page-links'>
                {isLoggedIn ? (
                    <>
                        <Link to="/home">Home</Link>
                    <Link to="/profile">Profile</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/">About</Link>
                        <Link to="/login">Login</Link>
                        </>
                    )}
                </div>
            </div>
            <Outlet/>
        </>
        );}

export function AboutPage() {
    return (
        <div className="body">
            <div className="title-container">
                <div className="big-photo">
                    <img src="/img/peoplelisteningtomusicholdinghands.jpg" alt="People listening to music holding hands" />
                </div>
                <div className="title-name">
                    <h1>HEARTBEATZ</h1>
                </div>
            </div>
            <div className="about-us">
                <div className="grid-background"></div>
                <div className="about-us-content">
                    <div className="small-photo">
                        <img src="/img/peoplesharingearbuds.jpg" alt="People sharing earbuds" />
                    </div>
                    <div className="about-us-text">
                        <h2>ABOUT US</h2>
                        <h3>At HeartBeatz, we believe that music is more than just sound—it's a powerful connection that brings people together. Our dating app is designed for music lovers who want to find that special someone with a shared passion for the same beats, lyrics, and artists. HeartBeatz matches you with potential partners based on your unique music preferences, creating a personalized and meaningful connection from the first song. Whether you’re into indie, jazz, or hip-hop, HeartBeatz lets you discover new people through the music that moves you. Join a community where love and rhythm unite, and let the soundtrack of your life guide you to someone who truly understands your vibe.</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

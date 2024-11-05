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
                    <Link to="/login">Login</Link>
                    <Link to="/">About</Link>
                    </>
                    )}
                </div>
            </div>
            <Outlet/>
        </>
        );}

export function AboutPage(){
    return (
        <div className = "body">
    <div className = "title">
        <div className = "big-photo">
        <img src = "/img/peoplelisteningtomusicholdinghands.jpg" alt = "People listening to music holding hands" />
        </div>
        <div className= "title-name">
            <h1>HEARTBEATZ</h1>
        </div>
    </div>
    <div className= "about-us">
        <div className= "grid-background"/>
            <div className= "small-photo">
                <img src = "/img/peoplesharingearbuds.jpg" alt = "People sharing earbuds"/>
            </div>
            <div className= "about-us-text">
                <h3> YADA YADA YADA</h3>
            </div>
     </div>
   </div>
    );
}

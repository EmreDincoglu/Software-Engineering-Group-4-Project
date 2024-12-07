import {Outlet, Link} from "react-router-dom";
import './root.css';
import React from 'react';
import {loggedOutPage, userAwarePage} from '../../lib/default';

class Root extends React.Component {
  render() {
    if (this.props.authLoading) {return <></>;}
    return <>
      <div className='nav-bar'>
        <img className="app-name" src='/Heartbeatz-name.png' alt="HeartBeatz"/>
        <div className='page-links'>
          {(this.props.isLoggedIn??false) ? <>
            <Link to="/home" key={"home"}>Home</Link>
            <Link to="/messages" key={"messages"}>Messages</Link>
            <Link to="/profile" key={"profile"}>Profile</Link>
            <Link to="/account" key={"account"}>Account</Link>
          </> : <>
            <Link to="/" key={"about"}>About</Link>
            <Link to="/login" key={"login"}>Login</Link>
          </>}
        </div>
      </div>
      <Outlet/>
    </>;
  }
}
export const RootPage = userAwarePage(Root);

function About() {
  return <div className="about-body">
    <div className="big-photo">
      <img
        src="/img/peoplelisteningtomusicholdinghands.jpg" 
        alt="People listening to music holding hands" 
      />
    </div>
    <h1 className="app-name">HEARTBEATZ</h1>
    <div className="about-us-content">
      <img className="small-photo"
        src="/img/peoplesharingearbuds.jpg" 
        alt="People sharing earbuds" 
      />
      <div className="about-us-text">
        <h2>ABOUT US</h2>
        <h3>At HeartBeatz, we believe that music is more than just sound—it's a powerful connection that brings people together. Our dating app is designed for music lovers who want to find that special someone with a shared passion for the same beats, lyrics, and artists. HeartBeatz matches you with potential partners based on your unique music preferences, creating a personalized and meaningful connection from the first song. Whether you’re into indie, jazz, or hip-hop, HeartBeatz lets you discover new people through the music that moves you. Join a community where love and rhythm unite, and let the soundtrack of your life guide you to someone who truly understands your vibe.</h3>
      </div>
    </div>
  </div>;
}
export const AboutPage = loggedOutPage(About);

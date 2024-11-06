import { Outlet, Link } from "react-router-dom";
import './root.css';
// This defines global web page constants, such as the navbar
export function RootPage(){return (
    <>
        <div className='nav-bar'>
            <div className='app-name'>
                <Link className="app-name-heart" to="/">Heart</Link>
                <Link className="app-name-beatz" to="/">Beatz</Link>
            </div>
            <div className='nav-bar-page-links'>
                <Link to="/home">Home</Link>
                <Link to="/">About</Link>
                <Link to="/login">Login</Link>
                <Link to="/profile">Profile</Link>
            </div>
        </div>
        <Outlet/>
    </>
);}

export function AboutPage(){return (
    <div>
        <div className = "grid-background"/>
        <div className="heartbeatz-title">
            <img src="%PUBLIC_URL%/HEARTBEATZ%20LOGO-01.png"/>
            <h1>HEARTBEATZ</h1>
        </div>
        <div className = "slogan">
            <h2>The app for people who something something</h2>
        </div>
        <div className = "about-us-text">
            <h3> We are HEARTBEATZ and our mission is to blah blah love blah </h3>
        {/*    Add pictures of random people being happy and screenshots of the app here*/}
        </div>
    </div>
);
}

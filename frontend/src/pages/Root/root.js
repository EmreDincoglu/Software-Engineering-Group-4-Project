import { Outlet, Link } from "react-router-dom";
import './root.css';
// This defines global web page constants, such as the navbar
export function RootPage(){return (
    <div>
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
    </div>
);}

export function AboutPage(){return (
    <div>
        <text>About Page</text>
    </div>
);}
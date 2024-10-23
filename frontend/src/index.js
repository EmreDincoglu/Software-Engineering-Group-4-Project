import React from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';

import LoginPage from './pages/Login/LoginPage';
import {RootPage, AboutPage} from './pages/Root/root';
import HomePage from './pages/Home/home'
import ProfilePage from './pages/Profile/profile'
import SpotifyCallbackPage from './pages/SpotifyAuthCallback/spotify';

export default function App() {return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<RootPage/>}>
                <Route index element={<AboutPage/>} />
                <Route path="login" element={<LoginPage/>}/>
                <Route path="home" element={<HomePage/>}/>
                <Route path="profile" element={<ProfilePage/>}/>
            </Route>
            <Route path="/spotifyAuthCallback" element={<SpotifyCallbackPage/>}/>
        </Routes>
    </BrowserRouter>
);}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App/>);
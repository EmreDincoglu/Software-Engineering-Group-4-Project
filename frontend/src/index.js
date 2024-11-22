import React from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';

import {LoginPage, RootPage, AboutPage, HomePage, AccountPage, SpotifyCallbackPage} from './pages/default';
import { AuthProvider } from './lib/auth';

export default function App() {return (
    <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<RootPage/>}>
                <Route index element={<AboutPage/>} />
                <Route path="login" element={<LoginPage/>}/>
                <Route path="home" element={<HomePage/>}/>
                <Route path="account" element={<AccountPage/>}/>
            </Route>
            <Route path="/spotifyAuthCallback" element={<SpotifyCallbackPage/>}/>
        </Routes>
    </BrowserRouter>
    </AuthProvider>
    </React.StrictMode>
);}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App/>);

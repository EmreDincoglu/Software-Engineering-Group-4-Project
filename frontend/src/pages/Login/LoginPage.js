import React, { useState } from "react";
import './LoginPage.css';
import { createUser, loginUser } from './lib'; // Using the backend logic from the first file
import { Navigate } from "react-router-dom";

const UserLogIn = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [redirectToHomepage, setRedirectToHomepage] = useState(false);

    // Backend logic for handling login
    const handleLogin = async event => {
        event.preventDefault();
        const user = {
            username: username,
            password: password
        };
        try {
            const result = await loginUser(user);
            if (!result.success) {
                alert(result.fail_message);
                return;
            }
            setRedirectToHomepage(true); // Redirect to homepage on successful login
        } catch (err) {
            console.error(err);
        }
    };

    // Backend logic for handling signup
    const handleSignUp = async event => {
        event.preventDefault();
        const newUser = { username, password, email };

        try {
            const result = await createUser(newUser);
            if (!result.success) {
                alert(result.fail_message);
                return;
            }
            alert('Signup Successful');
            setIsLogin(true); // Switch to login after signup
        } catch (err) {
            console.error(err);
        }
    };

    if (redirectToHomepage) {
        return <Navigate to='/home' />; // Navigate to homepage if login is successful
    }

    return (
        <div className='container'>
            {isLogin ? (
                <form onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input type="text" placeholder='Email / Username' value={username}
                               onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Password' value={password}
                               onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className="forgot-password">
                        <label><input type="checkbox" /><span>Remember me</span></label>
                        <a href="#">Forgot Password</a>
                    </div>
                    <button type="submit">Login</button>
                    <div className="register-link">
                        <p>Don't have an account? <a href="#" onClick={() => setIsLogin(false)}>Sign Up</a></p>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSignUp}>
                    <h1>Sign Up</h1>
                    <div className="input-box">
                        <input type="email" placeholder='Email' value={email}
                               onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-box">
                        <input type="text" placeholder='Username' value={username}
                               onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Password' value={password}
                               onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit">Sign Up</button>
                    <div className="login-link">
                        <p>Already have an account? <a href="#" onClick={() => setIsLogin(true)}>Login</a></p>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UserLogIn;

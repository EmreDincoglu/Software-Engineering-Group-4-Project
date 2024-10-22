import React, {useState} from "react";
import './UserSignupBox.css';
const UserSignupBox = props => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const sendUserInfo = async event => {
        event.preventDefault();
        const newUser = {
            username: username,
            password: password,
            email: email
        }
        try {
            await fetch('http://localhost:5000/newUser', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(newUser)
            })
        }catch(err) {
            console.log(err);
        }

        setUsername('');
        setPassword('');
        setEmail('');

    }

    return(
        <div className = 'container'>
            <form action="">
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" placeholder='Username' value = {username} onChange ={e => setUsername(e.target.value)} required/>
                </div>
                <div className="input-box">
                    <input type="password" placeholder='Password' value = {password} onChange={e => setPassword(e.target.value)}/>
                </div>
                <div className="forgot-password">
                    <label><input type="checkbox"/><span>Remember me</span></label>
                    <a href="#">Forgot Password</a>
                </div>


                <button type="submit">Login</button>

                <div className="register-link">
                    <p>Don't have an account? <a href="#">Register</a></p>
                </div>
            </form>
        </div>
    )

}

export default UserSignupBox

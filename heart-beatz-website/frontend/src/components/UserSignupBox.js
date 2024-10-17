import React, {useState} from "react";
import './UserSignupBox.css';
const UserSignupBox = props => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const sendUserInfo = event => {
        event.preventDefault();
        const newUser = {
            username: username,
            password: password,
            email: email
        }
        try {
            fetch('', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    email: email
                })
            })
        }catch(err) {
            console.log(err);
        }
        
        setUsername('');
        setPassword('');
        setEmail('');
        
    }

    const usernameChangeHandler = event => {
        setUsername(event.target.value);
    }
    const passwordChangeHandler = event => {
        setPassword(event.target.value);
    }
    const emailChangeHandler = event => {
        setEmail(event.target.value);
    }

    return <form className="EntryBox" onSubmit={sendUserInfo}>
        <input type="text" value={username} onChange={usernameChangeHandler}/>
        <input type="text" value={password} onChange={passwordChangeHandler}/>
        <input type="text" value={email} onChange={emailChangeHandler}/>
        <button type="submit">Submit</button>
    </form>
}

export default UserSignupBox
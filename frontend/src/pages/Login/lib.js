/*
    Create a user on express and interpret the result
*/
export async function createUser(userData) {
    try {
        let response = await fetch('http://localhost:5000/createUser', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {return {success: false, fail_message: "HTTP Error: " + response.statusText};}
        let res_data = await response.json();
        if (!res_data) {return {success: false, fail_message: "Bad Response Body"};}
        if (!res_data.success) {
            if (res_data.duplicate_email && res_data.duplicate_username) {
                return {success: false, fail_message: "Email and Username are both already in use"};
            }else if (res_data.duplicate_email) {
                return {success: false, fail_message: "Email is already in use"};
            }else if (res_data.duplicate_username) {
                return {success: false, fail_message: "Username is already in use"};
            }
        }
        return {success: true};
    } catch (err) {return {success: false, fail_message: "Fetch Failed: " + err};}
}
/*
    Login to an existing user on express, get a session, interpret success result
*/
export async function loginUser(userData) {
    try {
        let response = await fetch('http://localhost:5000/createSession', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3000/',
            },
            body: JSON.stringify({username: userData.username, password: userData.password})
        });
        if (!response.ok) {return {success: false, fail_message: "HTTP Error: " + response.statusText};}
        let res_data = await response.json();
        if (!res_data) {return {success: false, fail_message: "Bad Response Body"};}
        if (res_data.invalid_username) {
            return {success: false, fail_message: "Incorrect Username"};
        }else if (res_data.invalid_password) {
            return {success: false, fail_message: "Incorrect Password"};
        }
        return {success: true};
    } catch (err) {return {success: false, fail_message: "Fetch Failed: " + err};}
}
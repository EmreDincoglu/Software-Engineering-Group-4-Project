import { sendRequest } from "./default";
// Returns {success: true, user} if session is valid, and {success: false, fail_message} if not. User has sub elements for the profile and spotify account as well
export async function getUser() {
  let result = await sendRequest({
    url: 'http://localhost:5000/user/get',
    method: 'GET',
    credentials: true,
    body: null,
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
    ],
    desired_data: "user"
  });
  return {success: result.success, fail_message: result.fail_message, user: result.data};
}
// Creates a user account from userData
export async function createUser(username, password, email) {
  return await sendRequest({
    url: 'http://localhost:5000/user/create',
    method: 'POST',
    credentials: true,
    body: {username: username, password: password, email: email},
    fail_conds: [
      [{success: false, duplicate_email: true, duplicate_username: true}, "Email and Username are both already in use"],
      [{success: false, duplicate_email: true, duplicate_username: false}, "Email is already in use"],
      [{success: false, duplicate_email: false, duplicate_username: true}, "Username is already in use"],
    ],
    desired_data: false
  });
}
// Delete logged in user account
export async function deleteUser() {
  return await sendRequest({
    url: 'http://localhost:5000/user/delete',
    method: 'DELETE',
    credentials: true,
    body: null,
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
    ],
    desired_data: false
  });
}
// Update user account data
export async function updateUser(accountData) {
  return await sendRequest({
    url: 'http://localhost:5000/user/update',
    method: 'PUT',
    credentials: true,
    body: accountData,
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
      [{success: false, duplicate_username: true}, "Username is already in use"],
      [{success: false, duplicate_email: true}, "Email is already in use"],
    ],
    desired_data: false
  });
}
// User-User relationship management
export async function followUser(user_id) {
  return await sendRequest({
    url: 'http://localhost:5000/user/follow',
    method: 'POST',
    credentials: true,
    body: {user_id: user_id},
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
      [{success: false, invalid_user: true}, "User Not Found"],
      [{success: false, blocked: true}, "User is/has you blocked"],
      [{success: false, already_following: true}, "Already Following User"]
    ],
    desired_data: false
  });
}
export async function unfollowUser(user_id) {
  return await sendRequest({
    url: 'http://localhost:5000/user/unfollow',
    method: 'POST',
    credentials: true,
    body: {user_id: user_id},
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
      [{success: false, invalid_user: true}, "User Not Found"]
    ],
    desired_data: false
  });
}
export async function blockUser(user_id) {
  return await sendRequest({
    url: 'http://localhost:5000/user/block',
    method: 'POST',
    credentials: true,
    body: {user_id: user_id},
    fail_conds: [
      [{success: false, invalid_session: true}, "Invalid Session"],
      [{success: false, invalid_user: true}, "User Not Found"]
    ],
    desired_data: false
  });
}
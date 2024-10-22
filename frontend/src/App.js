import './App.css';
import {CookiesProvider, useCookies} from 'react-cookie';
import UserSignupBox from './components/UserSignupBox';

function App() {
  const [cookies, setCookie] = useCookies(['user_id', 'session_id'])

  return (
    <div>
      <UserSignupBox/>
    </div>
  )
}

export default App;

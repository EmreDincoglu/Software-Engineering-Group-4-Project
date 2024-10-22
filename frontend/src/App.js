import './App.css';
import {CookiesProvider, useCookies} from 'react-cookie';
import UserSignupBox from './components/UserSignupBox';

function App() {
  const [cookies, setCookie] = useCookies(['user_id', 'session_id'])

  return (
    <CookiesProvider>
      <div>
        <UserSignupBox setCookie={setCookie}/>
      </div>
    </CookiesProvider>
  )
}

export default App;

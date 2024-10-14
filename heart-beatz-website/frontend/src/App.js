import './App.css';
import UserSignupBox from './components/UserSignupBox';

const foo = () => {
  try {
    const response = fetch('http://localhost:5000', {method: 'GET'});
    console.log(response)
  } catch (err) {
    console.log(err);
  }
}

function App() {
  return (
    <div>
      <UserSignupBox/>

        <button onClick={foo}>Submit</button>
      
      
    
    </div>
  )
}

export default App;

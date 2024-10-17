import './App.css';
import UserSignupBox from './components/UserSignupBox';

const foo = async () => {
  try {
    const response = await fetch('http://localhost:5000/');
    console.log(response);
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

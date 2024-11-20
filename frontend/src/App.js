import './App.css';
import AboutPage from '/pages/Root/root.js';
import { AuthProvider } from './pages/Login/AuthProvider.js';

function App() {
    return(
        <AuthProvider><AboutPage /></AuthProvider>
    ) ;
}

export default App;

import logo from './logo.svg';
import './App.css';
import { HeroLayout2 } from './ui-components';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Hallo to Amplify test by Ibrahim
        </p>
      </header>
      <main>
        <HeroLayout2/>
      </main>
    </div>
  );
}

export default App;

import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import GlitchCanvas from "./glitch/index";

const Root = () => {
  const [glitchKey, setGlitchKey] = useState(Math.random());
  return (
    <React.StrictMode>
      <nav>
        <GlitchCanvas key={glitchKey} />
        <a href="https://twitch.tv/joe_js" target="_blank" rel="noreferrer"><h1>ttv/joe_js</h1></a>
        <img src="prof.jpg" onClick={() => setGlitchKey(Math.random())} />
      </nav>
      <main>
        <img src="https://i.pinimg.com/originals/eb/1b/27/eb1b27863813653543914d222ceb9cd0.gif" />
      </main>
    </React.StrictMode>
  );

};

ReactDOM.render(<Root />, document.getElementById('root'));

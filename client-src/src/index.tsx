import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import GlitchCanvas from "./glitch/index";
import SmashPreferencesInterface from "./smashPreferences";

const Root = () => {
  const [glitchKey, setGlitchKey] = useState(Math.random());
  return (
    <React.StrictMode>
      <GlitchCanvas key={glitchKey} />
      <nav>
        <a href="https://twitch.tv/joe_js" target="_blank" rel="noreferrer"><h1>ttv/joe_js</h1></a>
        <img alt="joe_js" src="prof.jpg" onClick={() => setGlitchKey(Math.random())} />
      </nav>
      <main>
        <SmashPreferencesInterface />
      </main>
    </React.StrictMode>
  );

};

ReactDOM.render(<Root />, document.getElementById('root'));

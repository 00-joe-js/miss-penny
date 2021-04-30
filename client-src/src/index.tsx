import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <nav>
      <a href="https://twitch.tv/joe_js" target="_blank" rel="noreferrer"><h1>ttv/joe_js</h1></a>
      <img src="prof.jpg" />
    </nav>
    <h1 onClick={() => fetch("/pop").then(console.log)}>yiss</h1>
  </React.StrictMode>,
  document.getElementById('root')
);

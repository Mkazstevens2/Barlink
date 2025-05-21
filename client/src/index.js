import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import io from 'socket.io-client';

// Automatically connects back to the server that served this page
const socket = io();

ReactDOM.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>,
  document.getElementById('root')
);

import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './main.css';

window.onload = () => {
    ReactDOM.render(React.createElement(App), document.querySelector('#react-root'));
};

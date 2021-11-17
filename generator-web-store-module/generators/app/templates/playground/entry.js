import React from 'react'; // eslint-disable-line import/no-extraneous-dependencies
import ReactDOM from 'react-dom'; // eslint-disable-line import/no-extraneous-dependencies

import App from './App';
import './main.css';

window.onload = () => {
    ReactDOM.render(React.createElement(App), document.querySelector('#react-root'));
};

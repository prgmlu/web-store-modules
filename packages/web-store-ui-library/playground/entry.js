import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import './main.css';

window.onload = () => {
    const viewportNodes = document.getElementsByName('viewport');
    if (!viewportNodes || viewportNodes.length === 0) {
        const viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        viewportMeta.setAttribute('content', 'width=device-width');
        viewportMeta.setAttribute('minimum-scale', '1.0');
        viewportMeta.setAttribute('maximum-scale', '1.0');
        document.head.appendChild(viewportMeta);
    }
    ReactDOM.render(React.createElement(App), document.querySelector('#obsessvr-webstore-react-embed-root'));
};

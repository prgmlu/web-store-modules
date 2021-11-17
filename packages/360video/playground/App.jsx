import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { WebStoreUILayer } from 'web-store-ui-layer';
import { createBrowserHistory } from 'history';
import ThreeJSWorld from './world/ThreeJSWorld';
import Room from './world/Room';

const history = createBrowserHistory();

export default class App extends Component {
    render() {
        return (
            <div id="app">
                {/* <iframe width="100%" height="100%" src="https://www.youtube.com/embed/Kgrd5aFEA0c" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> */}
                <ThreeJSWorld history={history}>
                    <WebStoreUILayer>
                        <Router history={history}>
                            <Room />
                        </Router>
                    </WebStoreUILayer>
                </ThreeJSWorld>
            </div>
        );
    }
}

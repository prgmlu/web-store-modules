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

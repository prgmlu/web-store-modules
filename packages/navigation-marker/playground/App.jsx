import React, { Component } from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ThreeJSWorld from './world/ThreeJSWorld';

const history = createBrowserHistory();

export default class App extends Component {
    render() {
        return (
            <div id="app">
                <ThreeJSWorld history={history}>
                    <Router history={history} />
                </ThreeJSWorld>
            </div>
        );
    }
}

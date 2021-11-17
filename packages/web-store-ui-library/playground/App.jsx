import React, { Component } from 'react';
import Button from '../lib/ui/Button/Button';

const appStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
};

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div style={appStyle}>
                <Button>Hello</Button>
            </div>
        );
    }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';
import { WebStoreUILayerContext } from '../../lib/WebStoreUILayerContext';
import TestUI from './TestUI';

class Room extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        const { threeJSWorldContext, webStoreUILayerContext } = this.props;

        webStoreUILayerContext.addDynamicUI('1', TestUI, { p1: 'p1', p2: 'p2' });
    }

    componentWillUnmount() {
        webStoreUILayerContext.removeDynamicUI('1');
    }

    render() {
        return (
            <></>
        );
    }
}

Room.propTypes = {
    threeJSWorldContext: PropTypes.object.isRequired,
    webStoreUILayerContext: PropTypes.object.isRequired,
};

export default (props) => (
    <ThreeJSWorldContext.Consumer>
        {(threeJSWorldContextValue) => (
            <WebStoreUILayerContext.Consumer>
                {(webStoreUILayerContextValue) => (
                    <Room
                        {...props}
                        threeJSWorldContext={threeJSWorldContextValue}
                        webStoreUILayerContext={webStoreUILayerContextValue}
                    />
                )}
            </WebStoreUILayerContext.Consumer>
        )}
    </ThreeJSWorldContext.Consumer>
);

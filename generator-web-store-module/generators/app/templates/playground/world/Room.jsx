import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WebStoreUILayerContext } from 'web-store-ui-layer';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';

class Room extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        const { threeJSWorldContext, webStoreUILayerContext } = this.props;
        // marker.setThreeJSWorldContext(threeJSWorldContext);
        // marker.setWebStoreUILayerContext(webStoreUILayerContext);
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

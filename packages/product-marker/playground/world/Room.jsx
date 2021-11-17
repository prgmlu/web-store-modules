import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WebStoreUILayerContext } from 'web-store-ui-layer';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';
import ProductMarker from '../../lib/ProductMarker.js';

class Room extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        const { threeJSWorldContext, webStoreUILayerContext } = this.props;
        const productMarker = new ProductMarker();
        productMarker.setThreeJSWorldContext(threeJSWorldContext);
        productMarker.addToThreeJSWorldScene(this.scene);
        // productMarker.startIdleAnimation();
    }

    render() {
        return null;
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

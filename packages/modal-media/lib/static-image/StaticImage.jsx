import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { LoadingIcon2, defaultProps } from 'web-store-ui-library';
import { loadUIImageAsync } from 'asset-loader';


// TODO: Refactor to web-store-ui-library
class StaticImage extends Component {
    constructor(props) {
        super(props);
        this.state = { isLoading: true };

        this.loadAndSetState = this.loadAndSetState.bind(this);
    }

    componentDidMount() {
        this.loadAndSetState();
    }

    loadAndSetState() {
        if (this.props.src) {
            loadUIImageAsync(this.props.src)
                .then((image) => {
                    this.setState({
                        src: image.src,
                        isLoading: false
                    });
                })
                .catch((error) => {
                    // TODO: retry logic
                    console.error('Download image error', error);
                });
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.src !== this.props.src) {
            this.loadAndSetState();
        }
    }

    render() {
        if (this.state.isLoading) {
            return (<LoadingIcon2 />);
        }
        const { src, style, onImageLoaded, xTranslation } = this.props;
        return (
            <img
                src={src}
                style={{transform: `translate(${xTranslation}px, 0px)`, ...style}}
                onLoad={onImageLoaded}
            />
        );
    }
}

StaticImage.propTypes = {
    src: PropTypes.string,
    imageStyle: PropTypes.object,
    onImageLoaded: PropTypes.func,
    ...defaultProps
};

export default StaticImage;

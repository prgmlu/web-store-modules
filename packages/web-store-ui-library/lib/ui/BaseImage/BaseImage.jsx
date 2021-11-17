import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { loadUIImageAsync } from 'asset-loader';
import defaultProps from '../ComponentEnums';

class BaseImage extends Component {
    constructor(props) {
        super(props);
        this.loadSprite = this.loadSprite.bind(this);

        this.state = {
            src: props.src,
            loaded: false,
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.src !== this.props.src) {
            this.loadSprite(this.props.src);
        }
    }

    loadSprite(url) {
        if (!url) {
            return;
        }
        loadUIImageAsync(url)
            .then((image) => {
                this.setState({
                    src: image.src,
                    loaded: true,
                });
            })
            .catch((error) => {
                // TODO: retry logic
                console.error('Download image error', error); // eslint-disable-line no-console
            });
    }

    render() {
        if (!this.state.loaded) {
            this.loadSprite(this.props.src);
        }
        const {
            id, className, style, onImageLoaded, hidden,
        } = this.props;

        const imgStyle = { ...style };
        if (hidden) {
            imgStyle.visibility = 'hidden';
        }

        return (
            <img
                id={id}
                className={className}
                style={imgStyle}
                onLoad={onImageLoaded}
                src={this.state.src}
            />
        );
    }
}

BaseImage.propTypes = {
    src: PropTypes.string.isRequired,
    onImageLoaded: PropTypes.func,
    hidden: PropTypes.bool,
    ...defaultProps,
};

BaseImage.defaultProps = {
    hidden: false,
};

export default BaseImage;

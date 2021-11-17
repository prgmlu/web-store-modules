import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BaseImage from '../BaseImage/BaseImage';

import defaultProps from '../ComponentEnums';


class ImageButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            id, className, style, src, onImageLoaded, onClick, onHover, onUnhover, hidden,
        } = this.props;
        return (
            <div
                onClick={onClick}
                onMouseOver={onHover}
                onMouseOut={onUnhover}
            >
                <BaseImage
                    id={id}
                    className={className}
                    src={src}
                    style={style}
                    onLoad={onImageLoaded}
                    hidden={hidden}
                />
            </div>
        );
    }
}

ImageButton.propTypes = {
    src: PropTypes.string.isRequired,
    onImageLoaded: PropTypes.func,
    onClick: PropTypes.func,
    onHover: PropTypes.func,
    onUnhover: PropTypes.func,
    hidden: PropTypes.bool,
    ...defaultProps,
};

ImageButton.defaultProps = {
    hidden: false,
};

export default ImageButton;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TextWithBackground.css';
import defaultProps from '../ComponentEnums.js';

class TextWithBackground extends Component {
    render() {
        const {
            text, className, maxWidth, padding, backgroundColor, skewed, textColor, font, size, width, margin,
        } = this.props;

        const containerStyle = {
            margin,
            maxWidth,
        };
        const backgroundStyle = {
            backgroundColor,
            transform: `skewX(${skewed}deg)`,
        };
        const textStyle = {
            color: textColor,
            fontFamily: font,
            fontSize: size,
            padding: '0.5em',
        };
        const textTransformStyle = {
            padding,
            transform: `skewX(${-skewed}deg)`,
        };

        // Conditional so that old components relying on width don't get overwritten when passed new props
        if (width) { textTransformStyle.width = width; }

        const textClass = className ? `text ${className}` : 'text';

        return (
            <div className="textWithBackground" style={containerStyle}>
                <div className="textBackground" style={backgroundStyle}>
                    <div style={textTransformStyle}>
                        <a className={textClass} style={textStyle}>{text}</a>
                    </div>
                </div>
            </div>
        );
    }
}

TextWithBackground.propTypes = {
    text: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    textColor: PropTypes.string,
    font: PropTypes.string,
    size: PropTypes.string,
    skewed: PropTypes.number,
    padding: PropTypes.string,
    maxWidth: PropTypes.string,
    width: PropTypes.string,
    margin: PropTypes.string,
    ...defaultProps,
};

// Change to use enum values
TextWithBackground.defaultProps = {
    text: '',
    backgroundColor: 'black',
    textColor: 'white',
    size: '15px',
    skewed: 0,
    padding: '0.1em 0.5em',
    margin: '',
    maxWidth: '',
};

export default TextWithBackground;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import defaultProps from '../ComponentEnums';
import './Button.css';
import { isMobileDevice } from 'obsess-device-detector';

const isMobile = isMobileDevice();

class Button extends Component {
    constructor(props) {
        super(props);
        this.onMouseOver = this.onMouseOver.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);

        this.state = {
            hovering: false,
        };
    }

    onMouseOver() {
        if (this.props.hoverStyleChange) {
            this.setState({ hovering: true });
        }
    }

    onMouseLeave() {
        if (this.props.hoverStyleChange) {
            this.setState({ hovering: false });
        }
    }

    render() {
        const {
            onClick, id, style, className, padded, insetBorder, primaryColor, secondaryColor, primaryBorderWidth, secondaryBorderWidth, primaryBorderColor, secondaryBorderColor,
        } = this.props;
        const { hovering } = this.state;

        const classNames = `obsess-basic-button hoverable ${className || ''}`;
        // Using box shadows for inset border because box shadows css work better than border for rounded elements
        const hoverStyle = hovering
            ? {
                color: primaryColor,
                backgroundColor: secondaryColor,
                boxShadow: insetBorder ? `0 0 0 ${secondaryBorderWidth} ${secondaryBorderColor} inset` : '',
                border: insetBorder ? '' : `${secondaryBorderWidth} solid ${secondaryBorderColor}`,
            } : {
                color: secondaryColor,
                backgroundColor: primaryColor,
                boxShadow: insetBorder ? `0 0 0 ${primaryBorderWidth} ${primaryBorderColor} inset` : '',
                border: insetBorder ? '' : `${primaryBorderWidth} solid ${primaryBorderColor}`,
            };

        const paddingStyle = padded ? { padding: '0 1em' } : {};

        const clickHandler = isMobile ? { onTouchEnd: onClick } : { onClick };

        return (
            <button
                id={id}
                className={classNames}
                style={{ ...paddingStyle, ...hoverStyle, ...style }}
                onMouseOver={this.onMouseOver}
                onMouseLeave={this.onMouseLeave}
                {...clickHandler}
            >
                {this.props.children}
            </button>
        );
    }
}

/*
    Borders are only shown on primary/secondary if their widths are passed in to not be 0
    insetBorder refers to whether button border is inside or outside of button body.
*/
Button.propTypes = {
    hoverStyleChange: PropTypes.bool,
    onClick: PropTypes.func,
    primaryColor: PropTypes.string,
    secondaryColor: PropTypes.string,
    primaryBorderWidth: PropTypes.string,
    secondaryBorderWidth: PropTypes.string,
    primaryBorderColor: PropTypes.string,
    secondaryBorderColor: PropTypes.string,
    padded: PropTypes.bool,
    insetBorder: PropTypes.bool,
    ...defaultProps,
};

Button.defaultProps = {
    hoverStyleChange: true,
    primaryColor: '#FF3446',
    secondaryColor: '#003446',
    primaryBorderWidth: '0',
    secondaryBorderWidth: '0',
    primaryBorderColor: '#FF3446',
    secondaryBorderColor: '#003446',
    padded: true,
    insetBorder: false,
};

export default Button;

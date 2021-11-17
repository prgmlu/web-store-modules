import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Overlay.css';
import defaultProps from '../ComponentEnums';


class Overlay extends Component {
    render() {
        const {
            id, className, style, zIndex, onClick,
        } = this.props;

        const classNames = className ? `obsess-overlay ${className}` : 'obsess-overlay';

        return <div id={id || ''} className={classNames} style={{ ...style, zIndex }} onClick={onClick} onTouchEnd={onClick} />;
    }
}

Overlay.propTypes = {
    zIndex: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    ...defaultProps,
};

export default Overlay;

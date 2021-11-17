import React from 'react';
import PropTypes from 'prop-types';
import defaultProps from '../ComponentEnums';

import './ToggleArrow.css';


function ToggleArrow(props) {
    const {
        id, className, style, containerStyle, down,
    } = props;

    const classNames = `toggle-arrow pointer ${className || ''}`;

    const arrowStyle = down
        ? { transform: 'rotate(45deg)', WebkitTransform: 'rotate(45deg)', marginBottom: '0.1em' }
        : { transform: 'rotate(-135deg)', WebkitTransform: 'rotate(-135deg)', marginTop: '0.6em' };

    return (
        <span style={containerStyle}>
            <i id={id} className={classNames} style={{ ...arrowStyle, ...style }} />
        </span>
    );
}

ToggleArrow.propTypes = {
    down: PropTypes.bool,
    containerStyle: PropTypes.object,
    ...defaultProps,
};

ToggleArrow.defaultProps = {
    down: true,
    containerStyle: { padding: '0 0.35em' },
};

export default ToggleArrow;

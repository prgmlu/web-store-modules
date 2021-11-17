import React from 'react';
import PropTypes from 'prop-types';
import { ToggleArrow } from '../../../../../web-store-ui-library';


function SizeSelectorItem(props) {
    const {
        text, showArrow, arrowDown, relative,
    } = props;

    const containerStyle = relative ? { position: relative } : {};

    return (
        <div style={containerStyle} className="size-selector-item pointer" onClick={props.onClick}>
            <p>{text}</p>
            <span>{showArrow && <ToggleArrow down={arrowDown} />}</span>
        </div>
    );
}

SizeSelectorItem.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    relative: PropTypes.bool,
    showArrow: PropTypes.bool,
    arrowDown: PropTypes.bool,
};

SizeSelectorItem.defaultProps = {
    relative: false,
    showArrow: false,
};

export default SizeSelectorItem;

import React from 'react';
import PropType from 'prop-types';

import { isMobileDevice } from 'obsess-device-detector';
import BaseImage from '../BaseImage/BaseImage';
import defaultProps from '../ComponentEnums';
import './DragToRotateTooltip.css';

const isMobile = isMobileDevice();

const dragTooltipStyle = {
    position: 'absolute',
    zIndex: '1',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -30%)',
};

/**
 * Tooltip that explains how to navigate stores.
 * Will render on center of screen by default.
 * */
function DragToRotateTooltip(props) {
    const { isTemplate, welcomeMessageStyle, dragStaticCopy, mobileHandIconUrl } = props;

    let iconUrl;
    if (isMobile) {
        if (mobileHandIconUrl) {
            iconUrl = mobileHandIconUrl;
        } else {
            iconUrl = 'https://cdn.obsess-vr.com/drag-tooltip-mobile.gif';
        }
    } else {
        iconUrl = 'https://cdn.obsess-vr.com/drag-tooltip-desktop.gif';
    };

    return (
        <div id="drag-tooltip-container" className="flex-center" style={isTemplate ? null : dragTooltipStyle}>
            <BaseImage
                id="drag-tooltip-animation"
                src={iconUrl}
            />
            <span id="drag-tooltip-prompt" style={welcomeMessageStyle}>{dragStaticCopy}</span>
        </div>
    );
}

DragToRotateTooltip.propTypes = {
    isTemplate: PropType.bool,
    welcomeMessageStyle: PropType.object,
    dragStaticCopy: PropType.string,
    mobileHandIconUrl: PropType.string,
    ...defaultProps,
};

DragToRotateTooltip.defaultProps = {
    dragStaticCopy: 'Drag to explore in 3D',
    isTemplate: false,
};

export default DragToRotateTooltip;

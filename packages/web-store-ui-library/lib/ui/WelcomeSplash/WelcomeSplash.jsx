import React from 'react';
import PropType from 'prop-types';

import DragToRotateTooltip from '../DragToRotateTooltip/DragToRotateTooltip';
import defaultProps from '../ComponentEnums';
import './WelcomeSplash.css';

const WelcomeSplash = (props) => {
    const {
        welcomeText, welcomeMessageStyle, dragStaticCopy, isVisible, hideTooltip, hideWelcomeMessage, mobileHandIconUrl, children
    } = props;
    return (
        <div id="welcome-container" style={{ opacity: isVisible ? '1' : '0' }}>
            <div id="welcome-component-container" className="flex-center">
                {!hideWelcomeMessage && <span id="welcome-message" style={welcomeMessageStyle}>
                    {welcomeText}
                </span>}
                {!hideTooltip && <DragToRotateTooltip welcomeMessageStyle={welcomeMessageStyle} isTemplate dragStaticCopy={dragStaticCopy} mobileHandIconUrl={mobileHandIconUrl} />}
                {children}
            </div>
        </div>
    );
};

WelcomeSplash.propTypes = {
    welcomeText: PropType.string,
    welcomeMessageStyle: PropType.object,
    dragStaticCopy: PropType.string,
    isVisible: PropType.bool,
    hideTooltip: PropType.bool,
    hideWelcomeMessage: PropType.bool,
    mobileHandIconUrl: PropType.string,
    ...defaultProps,
};

WelcomeSplash.defaultProps = {
    isVisible: true,
};

export default WelcomeSplash;

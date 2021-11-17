import React from 'react';
import './ProgressBarFlat.css';

// https://freefrontend.com/css-progress-bars/
// https://codepen.io/internette/pen/KqyxjE

export default React.memo(({ width = '0%', fillWrapperBackground = '', fillBackground = '' }) => (
    <div className="progress-bar-flat">
        <div className="fill-wrapper" style={{ width, transition: 'width 1s', background: fillWrapperBackground }}>
            <div className="fill" style={{ background: fillBackground }} />
        </div>
    </div>
));

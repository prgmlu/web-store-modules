import React from 'react';
import '@google/model-viewer';

const ThreeViewer = ({ threeStyle, thumbnailUrl, setIsUserInteracting, gltfModel, usdzModel, arEnabled }) => {
    const onInteraction = (e) => { 
        e.stopPropagation();
        setIsUserInteracting && setIsUserInteracting(true) 
    };
    const onEnd = () => { setIsUserInteracting && setIsUserInteracting(false) };

    return (
        <div style={threeStyle} onMouseDown={onInteraction} onMouseUp={onEnd} onTouchStart={onInteraction} onTouchEnd={onEnd}>
            <model-viewer
                ar={arEnabled}
                style={{ width: '100%', height: '100%' }}
                loading="eager"
                src={gltfModel}
                ios-src={usdzModel}
                poster={thumbnailUrl}
                interaction-prompt='auto'
                camera-controls
                auto-rotate
            />
        </div>
    );
}

export default ThreeViewer;

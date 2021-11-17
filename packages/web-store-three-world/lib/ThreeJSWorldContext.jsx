import React from 'react';

export const ThreeJSWorldContext = React.createContext({
    history: null,
    scene: null,
    colliderManager: null,
    backgroundSphere: null,
    background: null,
    pushHistoryWithReset: null,
    toggleIdleAnimation: null,
    addToRenderLoop: null,
    removeFromRenderLoop: null,
    request3DSceneRender: null,
    requestImmediate3DSceneRender: null
});

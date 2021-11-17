import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';

import SnowParticleSystem from './vfx/snow/SnowParticleSystem';

/**
 * @param {number} particleCount - Amount of snow partciles in a given scene
 * @param {function} addToRenderLoop - for stores that use optimized scene manager, adds component into render loop so it can request frames independently
 * @param {string} side - determines what sides the snow will render from - options: 'all', 'back', 'front'
 */

 const SnowEffect = ({ scene, particleCount, lifetimeSeconds, addToRenderLoop, removeFromRenderLoop, side }) => {
    const snowManager = useRef();
    const effectUUID = useRef();
    const animationInterval = useRef();
    const ThreeClock = useRef(new THREE.Clock());

    useEffect(() => {
        snowManager.current = new SnowParticleSystem(particleCount, lifetimeSeconds, '#FFFFFF', side);
        snowManager.current.setScene(scene);
        snowManager.current.turnOn();

        animationInterval.current = setInterval(() => {
            snowManager.current.update(ThreeClock.current.getDelta());
        }, 1000/30);

        effectUUID.current = addToRenderLoop();
        return (() => {
            snowManager.current.turnOff();
            removeFromRenderLoop(effectUUID.current);
            clearInterval(animationInterval.current);
        })
    }, []);

    return null;
}

export default SnowEffect;

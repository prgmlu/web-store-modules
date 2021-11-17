import React, { Component } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { ColliderManager } from 'three-physics';
import ThreeJSWorldController from 'three-controller';
import BackgroundSphere from 'three-background';
import { loadTextureAsync } from 'asset-loader';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';

import defaultBackground from '../../../../assets/default360.jpg';

import VideoSphere from '../../lib/VideoSphere';

class ThreeJSWorld extends Component {
    constructor(props) {
        super(props);
        this.animate = this.animate.bind(this);
        this.windowResizeHandler = this.windowResizeHandler.bind(this);

        THREE.Cache.enabled = true;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Setup camera
        this.scene.add(this.camera);
        this.camera.position.x = 0.1; // so that camera.target !== camera.position, and keeps the orbit control working.
        this.camera.target = new THREE.Vector3(0, 0, 0);
        this.camera.rotation.y = 90 * Math.PI / 180;
        this.animate();

        this.videoSphere = new VideoSphere();
        this.videoSphere.setVideoSrc('https://s3.amazonaws.com/obsessvr-webstore-assets-public/Limor+-+video.mp4');
        this.videoSphere.addToScene(this.scene);

        // Set up background sphere, collider manager, and collider
        this.backgroundSphere = new BackgroundSphere();
        this.backgroundSphere.addToScene(this.scene);
        this.colliderManager = new ColliderManager();
        this.controller = new ThreeJSWorldController(this.renderer, this.camera, this.colliderManager);

        // load default background texture
        loadTextureAsync(defaultBackground)
            .then((texture) => {
                this.backgroundSphere.setBackgroundAsync(texture);
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console
    }

    componentDidMount() {
        window.addEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.appendChild(this.renderer.domElement);

        window.addEventListener('click', () => {
            this.videoSphere.play();
        });
        window.addEventListener('touchend', () => {
            this.videoSphere.play();
        });
    }

    componentWillUnmount() {
        this.videoSphere.pause();
        this.videoSphere.removeFromScene();
        this.videoSphere.dispose();

        window.removeEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.removeChild(this.renderer.domElement);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    windowResizeHandler() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        const { history } = this.props;
        const contextValue = {
            history,
            scene: this.scene,
            colliderManager: this.colliderManager,
            backgroundSphere: this.backgroundSphere,
        };
        return (
            <ThreeJSWorldContext.Provider value={contextValue}>
                {this.props.children}
            </ThreeJSWorldContext.Provider>
        );
    }
}

ThreeJSWorld.propTypes = {
    history: PropTypes.object,
};

export default ThreeJSWorld;

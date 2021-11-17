import React, { Component } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { ColliderManager } from 'three-physics';
import ThreeJSWorldController from 'three-controller';
import {
    BackgroundSphere, Background, BackgroundLODs, BackgroundFaces,
} from 'three-background';

import { loadTextureAsync } from 'asset-loader';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';


import defaultBackground from '../../../../assets/default360.jpg';

import SpriteSheetAnimator from '../../lib/SpriteSheetAnimation/SpriteSheetAnimator';
import RunnerSpriteSheet from '../../assets/spritesheet.png';
import ArrowSpriteSheet from '../../assets/animated-arrow.jpg';


/**
    Push new url history and sets up controller reset. Generally called on any history push that changes scene view.
    Exported as a function instead of a react component in case non react js files need access to it
 */
export function pushHistoryWithReset(history, path) {
    window.controllerNeedsReset = true;
    history.push(path);
}

/**
 * Manages the 3d world.
 *
 * Set up three.js asset caching.
 *
 * Set up three.js scene.
 *
 * Set up three.js camera.
 *
 * Set up three.js renderer.
 *
 * Start three.js render loop.
 *
 * Set up background sphere.
 *
 * Set up collider manager.
 *
 * Set up ThreeJSWorldController.
 *
 */
class ThreeJSWorld extends Component {
    constructor(props) {
        super(props);
        this.resetController = this.resetController.bind(this);
        this.onBackgroundCubeSet = this.onBackgroundCubeSet.bind(this);
        this.animate = this.animate.bind(this);
        this.windowResizeHandler = this.windowResizeHandler.bind(this);
        this.pushHistoryWithReset = this.pushHistoryWithReset.bind(this);
        this.pushHistoryWithAnimationSetup = this.pushHistoryWithAnimationSetup.bind(this);
        this.toggleIdleAnimation = this.toggleIdleAnimation.bind(this);
        this.connectController = this.connectController.bind(this);
        this.disconnectController = this.disconnectController.bind(this);
        this.setupInitialAnimation = this.setupInitialAnimation.bind(this);
        this.initialAnimation = this.initialAnimation.bind(this);

        THREE.Cache.enabled = true;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Setup camera
        this.scene.add(this.camera);
        this.camera.position.x = 0.1; // so that camera.target !== camera.position, and keeps the orbit control working.
        this.camera.target = new THREE.Vector3(0, 0, 0);
        this.camera.rotation.y = 90 * Math.PI / 180;
        this.clock = new THREE.Clock();
        this.animate();

        // Set up background sphere
        this.backgroundSphere = new BackgroundSphere();
        this.backgroundSphere.addToScene(this.scene);
        // Set up background cube
        // this.background = new Background();
        // this.background.addToScene(this.scene);

        // Set up collider manager
        this.colliderManager = new ColliderManager();

        // Set up controller
        this.controller = new ThreeJSWorldController(this.renderer, this.camera, this.colliderManager);
        this.controller.controller.enableZoom = true;
        this.controller.controller.enablePan = true;
        if (props.connectControllerImmediately) {
            this.connectController();
        }

        window.controllerNeedsReset = false;

        // Flag for auto rotation
        this.setIdleAnimation = false;
    }

    componentDidMount() {
        window.addEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.appendChild(this.renderer.domElement);

        // set up controller reset to subscribe to when the background gets set
        // not using history listen here because we want to wait for the new background to be applied before doing an reset
        this.backgroundSphere.backgroundSetSubject.subscribe(this.resetController);
        // Background cube face set
        // this.background.backgroundSetSubject.subscribe((lod, face) => { this.onBackgroundCubeSet(lod, face); });

        // load default background texture
        loadTextureAsync(defaultBackground)
            .then((texture) => {
                this.backgroundSphere.setBackgroundAsync(texture);
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console

        this.spriteSheetTexture = new THREE.TextureLoader().load(ArrowSpriteSheet);
        this.spriteSheetAnimator = new SpriteSheetAnimator(this.spriteSheetTexture, 4, 11);
        const geometry = new THREE.PlaneGeometry(10, 10, 1, 1);
        const material = new THREE.MeshBasicMaterial({ map: this.spriteSheetTexture });
        this.animationPlane = new THREE.Mesh(geometry, material);
        this.animationPlane.position.set(-10, 0, 0);
        this.animationPlane.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(90));
        this.scene.add(this.animationPlane);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.removeChild(this.renderer.domElement);

        this.backgroundSphere.backgroundSetSubject.unsubscribe(this.resetController);
        this.background.backgroundSetSubject.unsubscribe();
    }

    /** Reset controller. */
    resetController() {
        // reset controller to center
        if (window.controllerNeedsReset) {
            this.controller.reset();
            window.controllerNeedsReset = false;
        }
    }

    /** When the cubemap background is loaded at LOD2, reset the controller. */
    onBackgroundCubeSet(lod, face) {
        // When setting cube face for anything do not reset the camera unless the face that's being loaded in is the FRONT face @ LOD0
        if (face !== BackgroundFaces.FRONT && lod !== BackgroundLODs.LOD0) {
            return;
        }
        this.resetController();
    }

    /** Render loop for the three.js world. */
    animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
        if (this.setIdleAnimation) {
            this.controller.controller.update();
        }
        if (this.spriteSheetAnimator) {
            this.spriteSheetAnimator.update(this.clock.getDelta() * 1000);
        }
    }

    /** Handles resizing of the three.js canvas and camera aspect ratio when the browser window is resized. */
    windowResizeHandler() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /** Push new url history and sets up controller reset. Generally called on any history push that changes scene view */
    pushHistoryWithReset(path) {
        pushHistoryWithReset(this.props.history, path);
    }

    pushHistoryWithAnimationSetup(path) {
        history.push(path);
        this.setupInitialAnimation();
    }

    /** Handles triggering of idle animation, called in store view */
    toggleIdleAnimation(isUserFirstInteraction) {
        if (isUserFirstInteraction) {
            this.setIdleAnimation = !this.setIdleAnimation;
            this.controller.toggleAutoRotation();
        }
    }

    connectController() {
        return this.controller.connectController();
    }

    disconnectController() {
        return this.controller.disconnectController();
    }

    setupInitialAnimation() {
        return this.controller.setupInitialAnimation();
    }

    initialAnimation() {
        return this.controller.initialAnimation();
    }

    render() {
        const { history } = this.props;
        const contextValue = {
            history,
            scene: this.scene,
            colliderManager: this.colliderManager,
            backgroundSphere: this.backgroundSphere,
            background: this.background,
            pushHistoryWithReset: this.pushHistoryWithReset,
            pushHistoryWithAnimationSetup: this.pushHistoryWithAnimationSetup,
            toggleIdleAnimation: this.toggleIdleAnimation,
            connectController: this.connectController,
            disconnectController: this.disconnectController,
            setupInitialAnimation: this.setupInitialAnimation.bind(this),
            initialAnimation: this.initialAnimation,
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
    connectControllerImmediately: PropTypes.bool,
};

ThreeJSWorld.defaultProps = {
    connectControllerImmediately: true,
};

export default ThreeJSWorld;

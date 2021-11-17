import React, { Component } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { ColliderManager } from 'three-physics';
import ThreeJSWorldController from 'three-controller';
import TransitionAnimation from 'three-transition';
import {
    BackgroundSphere, Background, BackgroundLODs, BackgroundFaces, FlatBackground
} from 'three-background';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';
import uuidv1 from 'uuid/v1';
import { isMobileDevice } from 'obsess-device-detector';
import debounce from 'lodash/debounce';
import TWEEN from 'three/examples/jsm/libs/tween.module.min';

const isMobile = isMobileDevice();

const REQUEST_3D_SCENE_RENDER_DEBOUNCE_MS = 1000;

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
        this.animate = this.animate.bind(this);
        this.windowResizeHandler = this.windowResizeHandler.bind(this);
        this.pushHistoryWithReset = this.pushHistoryWithReset.bind(this);
        this.pushHistoryWithAnimationSetup = this.pushHistoryWithAnimationSetup.bind(this);
        this.toggleIdleAnimation = this.toggleIdleAnimation.bind(this);
        this.connectController = this.connectController.bind(this);
        this.disconnectController = this.disconnectController.bind(this);
        this.setupInitialAnimation = this.setupInitialAnimation.bind(this);
        this.initialAnimation = this.initialAnimation.bind(this);
        this.addToRenderLoop = this.addToRenderLoop.bind(this);
        this.removeFromRenderLoop = this.removeFromRenderLoop.bind(this);
        this.renderThreeScene = this.renderThreeScene.bind(this);
        // * IMPORTANT: we don't debounce this because it makes the texture switch more visible while switching scenes.
        this.onBackgroundCubeSet = this.onBackgroundCubeSet.bind(this);
        this.toggleMouseWheelHandler = this.toggleMouseWheelHandler.bind(this);
        this.onClick = this.onClick.bind(this);
        // * IMPORTANT: Children components of ThreeJSWorld (ProductMarker, etc) can request the scene to be re-rendered in events like after adding an object to the scene.
        // * IMPORTANT: This is so we have finer control over when the 3D scene renders and combined with the renderItems array, it helps to improve performance,
        // * IMPORTANT: by eliminating the need for the 60fps render loop.
        // * IMPORTANT: We debounce this function so that multiple render requests in a short time frame can be grouped together, lowering the frequency of repaints.
        this.request3DSceneRender = debounce(() => {
            this.renderThreeScene();
            console.log('Render: request 3D scene render');
        }, REQUEST_3D_SCENE_RENDER_DEBOUNCE_MS);

        // * IMPORTANT: This is used for rendering the 3D scene immediately, for features like hover/unhover 3d objects, this should be used.
        this.requestImmediate3DSceneRender = this.renderThreeScene;
        THREE.Cache.enabled = true;

        this.root = null;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xffffff, 1);

        this.tweenIsPlaying = false;
        this.copy = document.createElement('canvas');
        this.copyContext = this.copy.getContext('2d');
        
        // Setup camera
        this.scene.add(this.camera);
        this.camera.position.x = 0.1; // so that camera.target !== camera.position, and keeps the orbit control working.
        this.camera.target = new THREE.Vector3(0, 0, 0);
        this.camera.rotation.y = 90 * Math.PI / 180;
        this.clock = new THREE.Clock();

        this.effect = document.createElement('canvas');

        // Setup flat background
        this.flatBackgroundScene = new THREE.Scene();
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.flatBackgroundCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -2, 100, 100000);

        this.flatBackgroundScene.add(this.flatBackgroundCamera);

        const mobileWidth = (window.innerHeight / 1080) * 1920;

        const mobileDims = {
            height: this.props.mobileFlatImageDimension && this.props.mobileFlatImageDimension.height ? this.props.mobileFlatImageDimension.height : window.innerHeight,
            width: this.props.mobileFlatImageDimension && this.props.mobileFlatImageDimension.width ? this.props.mobileFlatImageDimension.width : mobileWidth
        }

        this.flatBackground = new FlatBackground(
            isMobile ? mobileDims.width : this.flatBackgroundCamera.right - this.flatBackgroundCamera.left, // width
            isMobile ? mobileDims.height : this.flatBackgroundCamera.top - this.flatBackgroundCamera.bottom  // height
        );
        this.flatBackground.addToScene(this.flatBackgroundScene);

        // Set up postprocessing
        // this.composer = new EffectComposer(this.renderer);
        // this.renderPass = new RenderPass(this.scene, this.camera)
        // this.composer.addPass(this.renderPass);
        // this.SMAAPass = new SMAAPass(window.innerWidth, window.innerHeight);
        // this.SMAAPass.renderToScreen = true;
        // this.composer.addPass(this.SMAAPass);


        // Set up background sphere
        this.backgroundSphere = new BackgroundSphere();
        this.backgroundSphere.addToScene(this.scene);
        // Set up background cube
        this.background = new Background();
        this.background.addToScene(this.scene);

        // Set up collider manager
        this.colliderManager = new ColliderManager();

        // Set up controller
        this.controller = new ThreeJSWorldController(this.renderer, this.camera, this.colliderManager, props.enableDrag);
        this.controller.controller.enableDamping = true;
        this.controller.controller.dampingFactor = 0.15;
        if (props.connectControllerImmediately) {
            this.connectController();
        }

        window.controllerNeedsReset = false;

        // Flag for auto rotation
        this.setIdleAnimation = false;

        // For dynamic frame rate, if array is empty, it means no item currently needs the render loop and we can drop the
        // frame rate for less cpu usage when appropriate.
        this.renderItems = [];
        this.animatedMarkers = [];
    }

    // * IMPORTANT: This is for cpu fan performance improvement for the OTB project.
    // * IMPORTANT: Certain objects in scenes need the render loop, we add them to a renderItems
    // * IMPORTANT: list so we can re-render when needed.
    addToRenderLoop() {
        if (isMobile) {
            return;
        }
        const uuid = uuidv1();
        this.renderItems.push(uuid);
        return uuid;
    }

    // * IMPORTANT: This is for cpu fan performance improvement for the OTB project.
    // * IMPORTANT: Remove object from renderItems list when it no longer needs to be rendered.
    removeFromRenderLoop(uuid) {
        if (isMobile) {
            return;
        }
        const index = this.renderItems.indexOf(uuid);
        if (index > -1) {
            this.renderItems.splice(index, 1);
            return true;
        }
        return false;
    }

    componentDidMount() {
        window.addEventListener('resize', this.windowResizeHandler);
        this.root = document.getElementById('app');
        this.root.appendChild(this.renderer.domElement);

        // set up controller reset to subscribe to when the background gets set
        // not using history listen here because we want to wait for the new background to be applied before doing an reset
        this.backgroundSphere.backgroundSetSubject.subscribe(this.resetController);
        // Background cube face set
        this.background.backgroundSetSubject.subscribe((lod, face) => { this.onBackgroundCubeSet(lod, face); });
        this.flatBackground.backgroundSetSubject.subscribe(this.resetController);

        // * IMPORTANT: Need this for initial cubemap renders before the user drags around (re-render happens).
        // * IMPORTANT: There is flash black screen problem without this, cause onBackgroundCubeSet is only called,
        // * IMPORTANT: every time a LOD is completely loaded, so before LOD0 loads, we get a black screen.
        if (!isMobile) {
            this.renderThreeScene();
        }

        this.animate();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.windowResizeHandler);
        this.root.removeChild(this.renderer.domElement);

        this.backgroundSphere.backgroundSetSubject.unsubscribe(this.resetController);
        this.flatBackground.backgroundSetSubject.unsubscribe(this.resetController);
        this.background.backgroundSetSubject.unsubscribe(this.resetController);
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
        // * IMPORTANT: Need this for initial cubemap renders before the user drags around (re-render happens).
        if (!isMobile) {
            this.renderThreeScene();
        }

        // When setting cube face for anything do not reset the camera unless the face that's being loaded in is the FRONT face @ LOD0
        if (face !== BackgroundFaces.FRONT && lod !== BackgroundLODs.LOD0) {
            return;
        }
        this.resetController();
    }

    /** Render three.js world current frame. */
    renderThreeScene() {
        this.renderer.autoClear = false;
        this.renderer.clear();

        TWEEN.update()

        this.renderer.render(this.flatBackgroundScene, this.flatBackgroundCamera);
        this.renderer.render(this.scene, this.camera);
    }

    /** Render loop for the three.js world. */
    animate() {
        requestAnimationFrame(this.animate);
        let delta = this.clock.getDelta();

        if (this.tweenIsPlaying) {
            TWEEN.update();
        }

        // * IMPORTANT: This is for performance improvement, the render function is heavy on cpu which causes fans to go off on
        // * IMPORTANT: lower end desktops. Since a large amount of our scenes are static, we don't need to re-render it every frame.
        // * IMPORTANT: Doing re-renders when the camera moves and when objects in the scene are dynamic (in scene videos, vfx, etc)
        // * IMPORTANT: is enough.
        // * IMPORTANT: This fix is put in specifically for the OTB project.

        let hasUpdatedSprites = false;

        if (this.animatedMarkers.length) {
            this.animatedMarkers.forEach(sprite => {
                const updated = sprite.update(delta);
                if (updated == true) {
                    hasUpdatedSprites = true;
                }
            });
        }

        if (!isMobile && (!this.controller.isMoving && this.renderItems.length === 0) && hasUpdatedSprites == false) {
            // We still need to render so onUnhover still works correctly, but we can get away with a lower framerate.
            return;
        }

        this.renderThreeScene();

        // Update function called here to enable momentum on drag for desktop + iOS
        // Side effect of this update is that the update also enables idle animation
        if (this.controller && !this.controller.animationPlaying && this.controller.controller) {
            this.controller.controller.update();
        }
    }

    /** Handles resizing of the three.js canvas and camera aspect ratio when the browser window is resized. */
    windowResizeHandler() {
        const viewSize = 20;
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.left = width / - 2 * viewSize;
        this.camera.right = width / 2 * viewSize;
        this.camera.top = height / 2 * viewSize;
        this.camera.bottom = height / - 2 * viewSize;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.renderThreeScene();
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


    onClick(setNewScene, transitionType) {
        this.transitionAnimation = new TransitionAnimation(this);
        this.transitionAnimation.startAnimation(transitionType);
        this.transitionAnimation.subscribeSceneLoad(() => {
            this.transitionAnimation = null;
        });
        setNewScene();
    }

    /** disable mouse wheel if flat image scene, called in Room.jsx */
    toggleMouseWheelHandler(isFlatImageScene) {
        const canvasMode = this.renderer.domElement;
        if (isFlatImageScene) {
            canvasMode.removeEventListener('wheel', this.controller.mouseWheelHandler);
            this.controller.controller.enableRotate = false;
            this.controller.controller.update();
        } else {
            canvasMode.addEventListener('wheel', this.controller.mouseWheelHandler, { passive: true });
            this.controller.controller.enableRotate = true;
            this.controller.controller.update();
        }
    }

    render() {
        const { history } = this.props;
        const contextValue = {
            history,
            scene: this.scene,
            renderer: this.renderer,
            flatBackgroundScene: this.flatBackgroundScene,
            colliderManager: this.colliderManager,
            backgroundSphere: this.backgroundSphere,
            background: this.background,
            flatBackground: this.flatBackground,
            animatedMarkers: this.animatedMarkers,
            pushHistoryWithReset: this.pushHistoryWithReset,
            pushHistoryWithAnimationSetup: this.pushHistoryWithAnimationSetup,
            toggleIdleAnimation: this.toggleIdleAnimation,
            controller: this.controller,
            connectController: this.connectController,
            disconnectController: this.disconnectController,
            setupInitialAnimation: this.setupInitialAnimation.bind(this),
            initialAnimation: this.initialAnimation,
            addToRenderLoop: this.addToRenderLoop,
            removeFromRenderLoop: this.removeFromRenderLoop,
            request3DSceneRender: this.request3DSceneRender,
            requestImmediate3DSceneRender: this.requestImmediate3DSceneRender,
            toggleMouseWheelHandler: this.toggleMouseWheelHandler,
            onClick: this.onClick,
            transitionAnimation: this.transitionAnimation,
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
    enableDrag: PropTypes.bool,
    mobileFlatImageDimension: PropTypes.object,
};

ThreeJSWorld.defaultProps = {
    connectControllerImmediately: true,
    enableDrag: false,
    mobileFlatImageDimension: null
};

export default ThreeJSWorld;

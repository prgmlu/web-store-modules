import * as THREE from 'three';
import { isMobileDevice, getMobileOS } from 'obsess-device-detector';
import DeviceOrientationControls from '../vendor/DeviceOrientationControls';
import OrbitControls from '../vendor/OrbitControls';

const isMobile = isMobileDevice();
const isAndroid = getMobileOS() === 'Android';

const DESKTOP_THRESHOLD = 0.005;
const IOS_THRESHOLD = 0.0001;
const ANDROID_THRESHOLD = 0.01;

const ONE_DEGREE_IN_RAD = 0.00174533; // One degree when set as offset in quaternions
const IOS_Y_OFFSET = - (ONE_DEGREE_IN_RAD * 1.5);

// Determines speed of auto rotation, full rotation of scene = 60s/multiplier, @ 60fps. Full rotation takes 60 seconds.
// NOTE: Rotate speed can be changed at ThreeJSWorld level.
const DEFAULT_AUTO_ROTATE_SPEED_MULT_ANDROID = 0.5;
const DEFAULT_AUTO_ROTATE_SPEED_MULT_IOS = 0.25;
const DEFAULT_AUTO_ROTATE_SPEED_MULT_DESKTOP = 0.5;

// moveThreshold determines what is registered as a drag per respective device
const moveThreshold = isMobile ? (!isAndroid ? IOS_THRESHOLD : ANDROID_THRESHOLD) : DESKTOP_THRESHOLD;
const minZoomFOV = 20;
const maxZoomFOV = 70;
const mobileZoomFactor = 0.2;

const initialAnimationXPosDelta = 0.25;
const initialAnimationXPosTicks = 32;

const enableCenterHighlight = false;

const orbitControlSpeed = (isMobile && !isAndroid) ? DEFAULT_AUTO_ROTATE_SPEED_MULT_IOS : DEFAULT_AUTO_ROTATE_SPEED_MULT_DESKTOP;

export default class ThreeJSWorldController {
    constructor(renderer, camera, colliderManager, enableDrag, deviceOrientationAutoRotateSpeed = DEFAULT_AUTO_ROTATE_SPEED_MULT_ANDROID, orbitAutoRotateSpeed = orbitControlSpeed) {
        this.reset = this.reset.bind(this);
        this.clearEventListeners = this.clearEventListeners.bind(this);
        this.getCameraCenterPosition = this.getCameraCenterPosition.bind(this);
        this.getMousePosition = this.getMousePosition.bind(this);
        this.getTouchPosition = this.getTouchPosition.bind(this);
        this.deviceOrientationHandler = this.deviceOrientationHandler.bind(this);
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
        this.mouseDownHandler = this.mouseDownHandler.bind(this);
        this.mouseUpHandler = this.mouseUpHandler.bind(this);
        this.mouseWheelHandler = this.mouseWheelHandler.bind(this);
        this.touchStartHandler = this.touchStartHandler.bind(this);
        this.touchMoveHandler = this.touchMoveHandler.bind(this);
        this.touchEndHandler = this.touchEndHandler.bind(this);
        this.toggleAutoRotation = this.toggleAutoRotation.bind(this);
        this.connectController = this.connectController.bind(this);
        this.setupInitialAnimation = this.setupInitialAnimation.bind(this);
        this.initialAnimation = this.initialAnimation.bind(this);

        this.renderer = renderer;
        this.camera = camera;
        this.colliderManager = colliderManager;
        this.controller = null;
        this.raycaster = new THREE.Raycaster();
        this.controllerConnected = false;

        this.isMoving = false;

        if (isMobile && isAndroid) {
            this.controller = new DeviceOrientationControls(camera, renderer.domElement, deviceOrientationAutoRotateSpeed);
            this.touchMovePosition = null;
            this.deviceOrientationEventFired = false;
        } else {
            this.controller = new OrbitControls(camera, renderer.domElement, orbitAutoRotateSpeed, isMobile, enableDrag);
            // this.controller.target = isMobile ? new THREE.Vector3(0, IOS_Y_OFFSET, 0) : new THREE.Vector3(0, 0, 0); // hack to get camera to look down in iOS, so the gap line isn't immediately visible.
            this.controller.target = new THREE.Vector3(0, isMobile ? IOS_Y_OFFSET : 0, 0);
            this.controller.enableZoom = false;
            this.controller.enablePan = false;
            this.controller.rotateSpeed = isMobile ? -0.25 : -0.5;
            this.hoveredObject = null;
            this.startDistance = null;
            this.camera.lookAt(this.controller.target);

            // limiting views for all devices using OrbitControls
            const UPPER_ANGLE_BOUND = THREE.Math.degToRad(120);
            const LOWER_ANGLE_BOUND = THREE.Math.degToRad(60);
            this.controller.maxPolarAngle = UPPER_ANGLE_BOUND
            this.controller.minPolarAngle = LOWER_ANGLE_BOUND

            this.controller.addEventListener('change', () => {
                if (this.changeTimeout) {
                    clearTimeout(this.changeTimeout);
                }
                this.isMoving = true;
                this.changeTimeout = setTimeout(() => {
                    this.isMoving = false;
                }, 100);
            });
            
            this.wheelStopTimeout = null;
            window.addEventListener('wheel', () => {
                if (this.wheelStopTimeout) {
                    clearTimeout(this.wheelStopTimeout);
                }
                this.isMoving = true;
                this.wheelStopTimeout = setTimeout(() => {
                    this.isMoving = false;
                }, 100);
            });
        }

        // Final in this case refers to the fact that it's the final orientation/position of the camera, after initial
        // animation. If no initial animation, final values are what the camera should automatically be set to
        this.cameraFinalQuaternion = this.camera.quaternion.clone();
        this.cameraFinalX = this.camera.position.x;

        this.controller.autoRotate = false;
        this.controlDownPosition = null;
        this.animationPlaying = false;

        const canvasNode = renderer.domElement;

        if (isMobile) {
            canvasNode.addEventListener('touchstart', this.touchStartHandler);
            canvasNode.addEventListener('touchmove', this.touchMoveHandler);
            canvasNode.addEventListener('touchend', this.touchEndHandler);
            window.addEventListener('deviceorientation', this.deviceOrientationHandler, false);
        } else {
            canvasNode.addEventListener('mousemove', this.mouseMoveHandler);
            canvasNode.addEventListener('mouseup', this.mouseUpHandler);
            canvasNode.addEventListener('mousedown', this.mouseDownHandler);
            canvasNode.addEventListener('wheel', this.mouseWheelHandler, { passive: true });
        }
    }

    turnOffAutoRotation(){
        if(this.controller.autoRotate === true) this.controller.autoRotate = false;
    }

    reset() {
        this.controller.reset();
        this.isMoving = false;
    }

    clearEventListeners() {
        const canvasNode = this.renderer.domElement;
        if (isMobile) {
            canvasNode.removeEventListener('touchstart', this.touchStartHandler);
            canvasNode.removeEventListener('touchmove', this.touchMoveHandler);
            canvasNode.removeEventListener('touchend', this.touchEndHandler);
        } else {
            canvasNode.removeEventListener('mousemove', this.mouseMoveHandler);
            canvasNode.removeEventListener('mouseup', this.mouseUpHandler);
            canvasNode.removeEventListener('mousedown', this.mouseDownHandler);
            canvasNode.removeEventListener('wheel', this.mouseWheelHandler);
        }
    }

    getCameraCenterPosition() {
        this.camera.updateMatrixWorld();
        const position = this.camera.position.clone();
        return position;
    }

    getMousePosition(renderer, clientX, clientY) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mousePosition = new THREE.Vector2(0, 0);
        mousePosition.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mousePosition.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        return mousePosition;
    }

    getTouchPosition(renderer, pageX, pageY) {
        const touchPosition = new THREE.Vector2(0, 0);
        touchPosition.x = (pageX / renderer.domElement.clientWidth) * 2 - 1;
        touchPosition.y = -(pageY / renderer.domElement.clientHeight) * 2 + 1;
        return touchPosition;
    }

    getHitObject(screenPos) {
        this.raycaster.setFromCamera(screenPos, this.camera);
        const hitObjects = this.raycaster.intersectObjects(this.colliderManager.getColliders());
        if (hitObjects.length > 0) {
            return hitObjects[0].object;
        }
        return null;
    }

    deviceOrientationHandler(e) {
        e.preventDefault();

        if (!this.deviceOrientationEventFired && e.type === 'deviceorientation') {
            this.deviceOrientationEventFired = true;
        }

        if (enableCenterHighlight) {
            const position = this.getCameraCenterPosition();
            const hitObject = this.getHitObject(position);

            if (!hitObject) {
                if (this.hoveredObject && this.hoveredObject.onUnhover) {
                    this.hoveredObject.onUnhover();
                }
                this.hoveredObject = null;
            } else if (hitObject !== this.hoveredObject) {
                if (this.hoveredObject && this.hoveredObject.onUnhover) {
                    this.hoveredObject.onUnhover();
                }
                this.hoveredObject = hitObject;
                if (this.hoveredObject = hitObject) {
                    this.hoveredObject.onHover();
                }
            }
        }
    }

    mouseMoveHandler(event) {
        event.preventDefault();
        const mousePos = this.getMousePosition(this.renderer, event.clientX, event.clientY);
        const hitObject = this.getHitObject(mousePos);
        if (!hitObject) {
            if (this.hoveredObject && this.hoveredObject.onUnhover) {
                this.hoveredObject.onUnhover();
            }
            this.hoveredObject = null;
        } else if (hitObject !== this.hoveredObject) {
            if (this.hoveredObject && this.hoveredObject.onUnhover) {
                this.hoveredObject.onUnhover();
            }
            this.hoveredObject = hitObject;
            if (this.hoveredObject.onHover) {
                this.hoveredObject.onHover();
            }
        }
    }

    mouseDownHandler(event) {
        event.preventDefault();
        this.turnOffAutoRotation();
        const mousePos = this.getMousePosition(this.renderer, event.clientX, event.clientY);
        this.controlDownPosition = mousePos;
    }

    mouseUpHandler(event) {
        event.preventDefault();
        const mousePos = this.getMousePosition(this.renderer, event.clientX, event.clientY);
        if (!mousePos || !this.controlDownPosition) {
            return;
        }
        if (mousePos.distanceTo(this.controlDownPosition) < moveThreshold) {
            const hitObject = this.getHitObject(mousePos);
            if (hitObject && hitObject.onClick) {
                hitObject.onClick();
            }
        }
        this.controlDownPosition = null;
    }

    mouseWheelHandler(event) {
        const fovDelta = event.deltaY;
        const { camera } = this;
        const temp = camera.fov + (fovDelta * 0.05);

        if (temp > minZoomFOV && temp < maxZoomFOV) {
            camera.fov += fovDelta * 0.05;
            camera.updateProjectionMatrix();
        }
    }

    touchStartHandler(event) {
        this.turnOffAutoRotation();
        if (event.touches.length != 1) {
            event.preventDefault();
        }

        if (event.touches.length === 2) {
            const base = Math.abs(event.touches[0].pageX - event.touches[1].pageX);
            const height = Math.abs(event.touches[0].pageY - event.touches[1].pageY);
            const dist = Math.sqrt((base ** 2) + (height ** 2));

            this.startDistance = dist;
        }

        const touchPos = this.getMousePosition(this.renderer, event.touches[0].pageX, event.touches[0].pageY);
        this.controlDownPosition = touchPos;
        this.touchMovePosition = touchPos;
    }

    touchMoveHandler(event) {
        if (event.touches.length != 1) {
            event.preventDefault();
        }

        if (event.touches.length === 2) {
            const { camera } = this;

            const base = Math.abs(event.touches[1].pageX - event.touches[0].pageX);
            const height = Math.abs(event.touches[1].pageY - event.touches[0].pageY);
            const dist = Math.sqrt((base ** 2) + (height ** 2));
            const deltaDist = this.startDistance - dist;
            const temp = camera.fov + (deltaDist * mobileZoomFactor);

            if (temp > minZoomFOV && temp < maxZoomFOV) {
                camera.fov += deltaDist * mobileZoomFactor;
                camera.updateProjectionMatrix();
            }

            this.startDistance = dist;
        }

        if (!this.deviceOrientationEventFired) {
            this.deviceOrientationHandler(event);
        }
        this.touchMovePosition = this.getMousePosition(this.renderer, event.touches[0].pageX, event.touches[0].pageY);
    }

    touchEndHandler(event) {
        if (event.touches.length != 1) {
            event.preventDefault();
        }
        if (this.touchMovePosition.distanceTo(this.controlDownPosition) < moveThreshold) {
            const hitObject = this.getHitObject(this.touchMovePosition);
            if (hitObject && hitObject.onClick) {
                hitObject.onClick();
            }
        }
        this.controlDownPosition = null;
        this.touchMovePosition = null;
        this.startDistance = null;
    }

    toggleAutoRotation() {
        this.controller.autoRotate = !this.controller.autoRotate;
    }

    /**
        Connect your controller to javascript listeners. Currently only used for DeviceOrientationControls to disable
        motion controls until after initialAnimation
     */
    connectController() {
        if (!this.controllerConnected) {
            this.controllerConnected = true;
            this.controller.connect();
        }
    }

    disconnectController() {
        if (this.controller && this.controller.dispose) {
            this.controllerConnected = false;
            this.controller.dispose();
        }
    }

    /**
       Set up the camera to be at the position to start the initial animation
     */
    setupInitialAnimation() {
        // 135 degrees on local axis corresponds to 45 degrees to the left on world axis
        this.animationPlaying = true;
        this.camera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(135));
        this.camera.position.x = this.cameraFinalX + initialAnimationXPosDelta * initialAnimationXPosTicks;
    }

    /**
        Animate from a modified camera start position/orientaiton (based on cameraStartsInitialAnimationPosition) to the
        final camera position/orientation (that corresponds to the normal camera view)
     */
    initialAnimation() {
        // TODO: Put initialAnimation methods in each possible Controls vendor file and call it from there
        return new Promise((resolve, reject) => {
            this.interval = setInterval(() => {
                if (this.camera.position.x > this.cameraFinalX) {
                    this.camera.position.x -= initialAnimationXPosDelta;
                } else {
                    this.camera.position.x = this.cameraFinalX;
                }

                this.camera.quaternion.rotateTowards(this.cameraFinalQuaternion, 0.025);

                if (this.camera.position.x === this.cameraFinalX && this.camera.quaternion.equals(this.cameraFinalQuaternion)) {
                    this.animationPlaying = false;
                    clearInterval(this.interval);
                    resolve(true);
                }
            }, 50);
        });
    }
}

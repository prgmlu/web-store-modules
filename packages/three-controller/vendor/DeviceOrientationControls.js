/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

/**
 * IMPORTANT: Some modifications are done in below code so do not replace it with original file code
 */

import * as THREE from 'three';

let FINGER_UPPER_BOUND = THREE.Math.degToRad(-30);
let FINGER_LOWER_BOUND = THREE.Math.degToRad(30);

const DRAG_INTENT_ENUMS = Object.freeze({
    'UP': 'draggingUp',
    'DOWN': 'draggingDown',
    'UNKNOWN': 'unknown'
})

// * IMPORTANT: modified from original
const DeviceOrientationControls = function (camera, domElement, autoRotateSpeed = 0.15, customInitialXOffset = 89) {
    const scope = this;
    const changeEvent = { type: 'change' };

    const setInitialAngle = THREE.Math.degToRad(90);
    let rotY = setInitialAngle; // To set initial position of image
    let rotX = 0;

    let lastRotY = 0;

    let tempX = 0;
    let tempY = setInitialAngle; // To set initial position of image

    let lastBeta = 0;

    // ERROR: Zooming on mobile logs an error from calling distanceToSquared. In our implementation of zoom on DeviceOrientationControls this has no effect on functionality and should be ignored.
    const TOUCH_INTENT = { NONE: 0, MOVE: 1, ZOOM: 2 }; // * IMPORTANT: modified from original
    let currentTouchIntent = TOUCH_INTENT.NONE; // * IMPORTANT: modified from original

    this.offset = 0; // * IMPORTANT: modified from original
    let setInitialOffset = false; // * IMPORTANT: modified from original
    let xOffset = 0; // * IMPORTANT: modified from original
    const InitialXOffset = customInitialXOffset; // * IMPORTANT: modified from original


    let centerAngle = 0;
    let upperXBound = 0;
    let lowerXBound = 0;
    let currentXRotation = 0;

    let availablePositiveXSpace = 0;
    let availableNegativeXSpace = 0;

    function getAutoRotateAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    }

    function rotateLeft(angle) {
        scope.alphaOffsetAngle = rotY -= angle;
    }

    this.camera = camera;
    this.camera.rotation.reorder('YXZ');
    this.domElement = (domElement !== undefined) ? domElement : document;

    this.enabled = false;
    this.touchMoveEnabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = setInitialAngle; // To set initial position of image
    this.betaOffsetAngle = 0;

    // Set to true to automatically rotate camera to the right
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = autoRotateSpeed;

    this.isUserInteracting = false;

    this.minFov = 20;
    this.maxFov = 100;
    this.updateAngle = true;

    const ogFOV = scope.camera.fov; // Original fov to reset to after changing stores or scenes

    const onDeviceOrientationChangeEvent = (event) => {
        if (scope.updateAngle) {
            updateInitialAngle(event);
            scope.updateAngle = false;
        }
        scope.deviceOrientation = event;
    };

    const updateInitialAngle = (event) => {
        // Offset is set here to initialize view to center on first load
        scope.offset = -event.alpha;
        scope.alphaOffsetAngle = setInitialAngle;
        scope.betaOffsetAngle = event.beta;
        tempY = setInitialAngle;
        rotY = setInitialAngle;
        
        setInitialOffset = true;
    };

    const onScreenOrientationChangeEvent = () => {
        scope.screenOrientation = window.orientation || 0;
    };

    const onTouchStartEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!scope.touchMoveEnabled) {
            return;
        }
        scope.isUserInteracting = true;

        if (scope.autoRotate) {
            scope.autoRotate = false;
        }

        if (event.touches.length >= 2) {
            currentTouchIntent = TOUCH_INTENT.ZOOM;
        }

        tempX = event.touches[0].pageX;
        tempY = event.touches[0].pageY;

        if (event.touches.length == 2) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy);
        }
    };

    // * IMPORTANT: Modified from original
    const onTouchEndEvent = (event) => {
        event.preventDefault();

        if (!scope.touchMoveEnabled) {
            return;
        }
        if (event.touches.length == 0) {
            currentTouchIntent = TOUCH_INTENT.NONE;
        }
    };

    let _touchZoomDistanceStart; let
        _touchZoomDistanceEnd;

    const onTouchMoveEvent = (event) => {
        event.preventDefault();
        if (!scope.touchMoveEnabled || !scope.enabled) {
            return;
        }

        // For moving
        if (event.touches.length === 1) {
            // * IMPORTANT: modified from original
            if (currentTouchIntent === TOUCH_INTENT.ZOOM) {
                return;
            }

            rotY += THREE.Math.degToRad((event.touches[0].pageX - tempX) / 4);
            const nextRotX = rotX + THREE.Math.degToRad((tempY - event.touches[0].pageY) / 4);

            const dragIntent = calculateUserIntent(rotX, nextRotX);
            const boundRotX = withinXBounds(nextRotX, dragIntent);

            rotX = boundRotX;

            lastRotY = rotY;

            scope.updateAlphaOffsetAngle(lastRotY);

            // Log last position
            tempX = event.touches[0].pageX;
            tempY = event.touches[0].pageY;
        } else if (event.touches.length === 2) {
            const dx = event.touches[0].pageX - event.touches[1].pageX;
            const dy = event.touches[0].pageY - event.touches[1].pageY;
            _touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy);

            const factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
            _touchZoomDistanceStart = _touchZoomDistanceEnd;
            setZoom(camera.fov * factor);
        }
    };

    const calculateUserIntent = (prevTouch, currTouch) => {
        // Calculates if a user is swiping up or down
        if (Math.sign(currTouch) === 1) {
            if (Math.abs(currTouch) > Math.abs(prevTouch)) {
                return DRAG_INTENT_ENUMS.DOWN;
            } else if (Math.abs(currTouch) < Math.abs(prevTouch)) {
                return DRAG_INTENT_ENUMS.UP;
            }
        } else {
            if (Math.abs(currTouch) > Math.abs(prevTouch)) {
                return DRAG_INTENT_ENUMS.UP;
            } else if (Math.abs(currTouch) < Math.abs(prevTouch)) {
                return DRAG_INTENT_ENUMS.DOWN;
            }
        }
        return DRAG_INTENT_ENUMS.UNKNOWN
    }

    const calculateAvailableDragSpace = (xAxisRoation) => {
        // Calculates amount of space available for a drag rotation by taking in the current x axis rotation from touch events 
        // and adding to the amount of available space in the X axis after a gyroscope movement
        let upwardsDragSpace
        let downwardsDragSpace

        if ((THREE.Math.radToDeg(availablePositiveXSpace) + xAxisRoation) < 0) {
            upwardsDragSpace = 0;
        } else {
            upwardsDragSpace = (THREE.Math.radToDeg(availablePositiveXSpace) + xAxisRoation);
        }

        if ((THREE.Math.radToDeg(availableNegativeXSpace) + xAxisRoation) > 0) {
            downwardsDragSpace = 0;
        } else {
            downwardsDragSpace = (THREE.Math.radToDeg(availableNegativeXSpace) + xAxisRoation);
        }

        return [upwardsDragSpace, downwardsDragSpace]
    }

    const withinXBounds = (touchXRotation, direction) => {
        // Evaluates if a touch is within the upper and lower X bounds
        // Returns a rotation value bound between upper and lower X bounds
        const [upperXSpace, lowerXSpace] = calculateAvailableDragSpace(touchXRotation);
        if (direction === DRAG_INTENT_ENUMS.UP && (upperXSpace <= 0)) {
            // In the case we moved to upper bound with gyroscope only, we want to prevent any further drag
            return -availablePositiveXSpace;
        } 
        if (direction === DRAG_INTENT_ENUMS.DOWN && (lowerXSpace >= 0)) {
            // In the case we moved to lower bound with gyroscope only, we want to prevent any further drag
            return -availableNegativeXSpace;
        }
        return touchXRotation;
    }

    function setZoom(fov) {
        scope.camera.fov = fov;

        if (scope.camera.fov < scope.minFov) scope.camera.fov = scope.minFov;
        if (scope.camera.fov > scope.maxFov) scope.camera.fov = scope.maxFov;

        scope.camera.updateProjectionMatrix();
    }

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
    const setCameraQuaternion = function (quaternion, alpha, beta, gamma, orient) {
        const zee = new THREE.Vector3(0, 0, 1);
        const euler = new THREE.Euler();
        const q0 = new THREE.Quaternion();
        const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        let vectorFingerY;
        const fingerQY = new THREE.Quaternion();
        const fingerQX = new THREE.Quaternion();

        if (scope.screenOrientation == 0) {
            vectorFingerY = new THREE.Vector3(1, 0, 0);
            fingerQY.setFromAxisAngle(vectorFingerY, -rotX);
        } else if (scope.screenOrientation == 180) {
            vectorFingerY = new THREE.Vector3(1, 0, 0);
            fingerQY.setFromAxisAngle(vectorFingerY, rotX);
        } else if (scope.screenOrientation == 90) {
            vectorFingerY = new THREE.Vector3(0, 1, 0);
            fingerQY.setFromAxisAngle(vectorFingerY, rotX);
        } else if (scope.screenOrientation == -90) {
            vectorFingerY = new THREE.Vector3(0, 1, 0);
            fingerQY.setFromAxisAngle(vectorFingerY, -rotX);
        }

        // * IMPORTANT: modified from original
        if (!scope.deviceOrientation.alpha) {
            let vectorFingerX;
            if (scope.screenOrientation == 0) {
                vectorFingerX = new THREE.Vector3(0, 0, 1);
                fingerQX.setFromAxisAngle(vectorFingerX, rotY);
            } else if (scope.screenOrientation == 180) {
                vectorFingerX = new THREE.Vector3(0, 0, 1);
                fingerQX.setFromAxisAngle(vectorFingerX, -rotY);
            } else if (scope.screenOrientation == 90 || scope.screenOrientation == -90) {
                vectorFingerX = new THREE.Vector3(0, 0, 1);
                fingerQX.setFromAxisAngle(vectorFingerX, rotY);
            }
        }

        // * IMPORTANT: modified from original
        q1.multiply(fingerQX);
        q1.multiply(fingerQY);

        euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        quaternion.setFromEuler(euler); // orient the device
        quaternion.multiply(q1); // camera looks out the back of the device, not the top
        quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation

        // * IMPORTANT: modified from original
        if (setInitialOffset) {
            xOffset = THREE.Math.degToRad(InitialXOffset) - beta;
            initializeAngleLimit(beta);
            setInitialOffset = false;
        }
        const q3 = new THREE.Quaternion().setFromEuler(new THREE.Euler(xOffset, 0, 0));
        quaternion.multiply(q3);

    };

    const initializeAngleLimit = (offset) => {
        // Retrieve center angle to base bounds of camera by calculating offset to center screen on 3d scene initialization
        centerAngle = offset;
        upperXBound = offset + THREE.Math.degToRad(30);
        lowerXBound = offset + THREE.Math.degToRad(-30);
    }

    this.connect = function () {
        onScreenOrientationChangeEvent(); // run once on load

        window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
        window.addEventListener('deviceorientation', this.update.bind(this), false);

        scope.domElement.addEventListener('touchstart', onTouchStartEvent, false);
        scope.domElement.addEventListener('touchmove', onTouchMoveEvent, false);
        scope.domElement.addEventListener('touchend', onTouchEndEvent, false);

        scope.enabled = true;
    };

    this.disconnect = function () {
        window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);
        window.removeEventListener('deviceorientation', this.update.bind(this), false);

        scope.domElement.removeEventListener('touchstart', onTouchStartEvent, false);
        scope.domElement.removeEventListener('touchmove', onTouchMoveEvent, false);
        scope.domElement.removeEventListener('touchend', onTouchEndEvent, false);

        scope.enabled = false;
    };

    this.update = function (ignoreUpdate) {
        if (scope.enabled === false) return;

        const alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(scope.deviceOrientation.alpha + scope.offset) + this.alphaOffsetAngle : 0; // Z
        const beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : 0; // X'
        const gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
        const orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O
        
        if (scope.deviceOrientation && scope.camera.quaternion) {
            // let q = scope.camera.quaternion.clone();
            if (setInitialOffset && beta === 0) {
                return;
            }

            const limitBeta = () => {
                // Formula for calculating bounds of gyroscope movement in the X or beta axis
                if (!setInitialOffset) {
                    if (beta >= upperXBound + rotX) {
                        return upperXBound + rotX;
                    } else if (beta <= lowerXBound + rotX) {
                        return lowerXBound + rotX;
                    }
                }
                return beta;
            }
            
            const updateTouchBounds = () => {
                availablePositiveXSpace = upperXBound - limitBeta();
                availableNegativeXSpace = lowerXBound - limitBeta(); 
                currentXRotation = limitBeta() - centerAngle;
            }
    
            updateTouchBounds();
            
            setCameraQuaternion(scope.camera.quaternion, alpha, limitBeta(), gamma, orient);
        }

        if (scope.autoRotate && !scope.isUserInteracting) {
            rotateLeft(getAutoRotateAngle());
        }

        ignoreUpdate !== true && this.dispatchEvent(changeEvent);
    };

    this.updateAlphaOffsetAngle = function (angle) {
        this.alphaOffsetAngle = angle;
        this.update();
    };

    this.updateBetaOffsetAngle = function (angle) {
        this.betaOffsetAngle = angle;
        this.update();
    };

    this.reset = function () {
        // * IMPORTANT: modified from original, if motion control is disabled on phones, this will stop recentering
        // if (scope.deviceOrientation.alpha === undefined) return;

        // setting offset here resets horizontal centering (Z)
        scope.offset = -scope.deviceOrientation.alpha;
        // * IMPORTANT: if scope.offset is NaN, the first image load produces the black screen bug
        if (!scope.offset) {
            scope.offset = 0;
        }
        setZoom(ogFOV); // Reset camera back to original zoom

        rotY = THREE.Math.degToRad(90);
        scope.updateAlphaOffsetAngle(rotY);
    };

    this.dispose = function () {
        this.disconnect();
    };
};

// * IMPORTANT: modified from original
DeviceOrientationControls.prototype = Object.create(THREE.EventDispatcher.prototype);
DeviceOrientationControls.prototype.constructor = DeviceOrientationControls;

// * IMPORTANT: modified from original
export default DeviceOrientationControls;

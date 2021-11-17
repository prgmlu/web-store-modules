import * as THREE from 'three';

/**
 * 360 Video Sphere
 */
export default class VideoSphere {
    constructor() {
        this.dispose = this.dispose.bind(this);
        this.setVideoSrc = this.setVideoSrc.bind(this);
        this.addToScene = this.addToScene.bind(this);
        this.removeFromScene = this.removeFromScene.bind(this);
        this.setTransform = this.setTransform.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.onVideoFinishPlaying = this.onVideoFinishPlaying.bind(this);
        this.isPlaying = this.isPlaying.bind(this);

        this.videoElement = document.createElement('video');
        this.videoElement.crossOrigin = 'anonymous';
        this.videoElement.setAttribute('webkit-playsinline', '');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.addEventListener('ended', this.onVideoFinishPlaying, false);

        this.texture = null;
        const geometry = new THREE.SphereGeometry(0, 60, 40);
        geometry.scale(10, 10, 10);
        const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
        this.sphere = new THREE.Mesh(geometry, material);

        this.onVideoEnd = null;
    }

    /**
     * Pause the video, remove from scene,
     * clean up the video dom element,
     * clean up the sphere geometry and texture.
     */
    dispose() {
        if (this.isPlaying()) {
            this.pause();
        }
        if (this.scene) {
            this.removeFromScene();
        }
        this.videoElement.removeAttribute('src');
        this.videoElement.load();
        this.videoElement = null;
        this.sphere.material.dispose();
        this.texture.dispose();
        this.sphere.geometry.dispose();
        this.texture = null;
        this.sphere = null;
        this.scene = null;
    }

    /**
     * Set the video source to the video dom element,
     * and use the video dom element for the new THREE.VideoTexture.
     * @param {string} src - video source
     */
    setVideoSrc(src) {
        if (typeof src !== 'string') {
            console.error(`Cannot set video src to non string type ${typeof src}, src:${src}`); // eslint-disable-line no-console
            return;
        }
        if (this.texture) {
            this.texture.dispose();
        }
        if (!this.isPlaying()) {
            this.videoElement.pause();
        }
        this.videoElement.src = src;
        this.videoElement.load();
        this.texture = new THREE.VideoTexture(this.videoElement);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;
        this.texture.format = THREE.RGBFormat;

        this.sphere.material.map = this.texture;
        this.sphere.material.needsUpdate = true;
    }

    /**
     * Add this video sphere to the three.js scene.
     * @param {THREE.Scene} scene - Three.js scene
     */
    addToScene(scene) {
        scene.add(this.sphere);
        this.scene = scene;
    }

    /**
     * Remove this video sphere from it's three.js scene.
     */
    removeFromScene() {
        if (!this.scene) {
            console.warn('Cannot remove VideoSphere from scene null'); // eslint-disable-line no-console
            return;
        }
        this.pause();
        this.scene.remove(this.sphere);
        this.scene = null;
    }

    /** Set the 3D transform of this video sphere. */
    setTransform(transform) {
        this.sphere.matrix = transform;
        this.sphere.matrix.decompose(
            this.sphere.position,
            this.sphere.quaternion,
            this.sphere.scale,
        );
    }

    /** Play the video */
    play() {
        if (this.isPlaying()) {
            return;
        }
        // TODO: this ticks error on mobile if the video isn't completely loaded
        // TODO: (loading bar on top of the browser still going).
        this.videoElement.play()
            .then(() => {
                console.log('Playing video'); // eslint-disable-line no-console
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console
    }

    /** Pause the video */
    pause() {
        if (!this.isPlaying()) {
            return;
        }
        this.videoElement.pause();
    }

    /** Event handler for when the video ends. */
    onVideoFinishPlaying() {
        if (this.onVideoEnd) {
            this.onVideoEnd();
        }
    }

    /**
     * Get is the video playing.
     * @returns {Boolean} - Is the video playing
     */
    isPlaying() {
        return !this.videoElement.paused;
    }

    /** Set this video sphere's visibility. */
    setVisibility(isVisible) {
        this.sphere.visible = isVisible;
    }
}

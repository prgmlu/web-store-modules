import { InteractableObjectComponent } from 'three-interactable-object';
import VideoSphere from './VideoSphere';

/**
 * BasicVideoSphereComponent
 */
export default class BasicVideoSphereComponent extends InteractableObjectComponent {
    /**
     * @param {string} videoSrc - Video source
     */
    constructor(videoSrc) {
        super();
        this.dispose = this.dispose.bind(this);
        this.addToScene = this.addToScene.bind(this);

        if (!videoSrc) {
            throw new Error('Cannot create VideoSphereComponent without a valid video src');
        }
        if (typeof videoSrc !== 'string') {
            throw new Error(`Cannot set video src to non string type ${typeof videoSrc}, src:${videoSrc}`);
        }
        this.videoSphere = new VideoSphere();
        this.videoSphere.setVideoSrc(videoSrc);
    }

    /** Dispose the video sphere properly. */
    dispose() {
        this.videoSphere.removeFromScene();
        this.videoSphere.dispose();
    }

    /**
     * Add the video sphere to the scene.
     * @param {THREE.Scene} scene - Three.js scene
     */
    addToScene(scene) {
        this.videoSphere.addToScene(scene);
    }
}

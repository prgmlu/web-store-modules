import * as THREE from 'three';
import Subject from './Subject';

export default class BackgroundSphere {
    constructor() {
        this.addToScene = this.addToScene.bind(this);
        this.removeFromScene = this.removeFromScene.bind(this);
        this.setBackgroundAsync = this.setBackgroundAsync.bind(this);

        const backgroundGeometry = new THREE.SphereGeometry(0, 60, 40);
        const backgroundMaterial = new THREE.MeshBasicMaterial();
        backgroundGeometry.scale(-20, 20, 20);
        this.background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
        this.background.visible = false;

        this.backgroundSetSubject = new Subject();
    }

    addToScene(scene) {
        if (this.scene) {
            console.error('This BackgroundSphere is already attached to a scene, remove from the current scene to add to another scene!'); // eslint-disable-line no-console
            return;
        }
        this.scene = scene;
        this.scene.add(this.background);
    }

    removeFromScene() {
        if (!this.scene) {
            console.error('Can\'t remove BackgroundSphere that is not attached to a scene!'); // eslint-disable-line no-console
            return;
        }
        this.scene.remove(this.background);
        this.scene = null;
    }

    setBackgroundAsync(texture) {
        return new Promise((resolve, reject) => {
            this.background.material.map = texture;
            this.background.material.needsUpdate = true;
            this.background.visible = true;
            this.backgroundSetSubject.notifyAll();
            return resolve();
        });
    }
}

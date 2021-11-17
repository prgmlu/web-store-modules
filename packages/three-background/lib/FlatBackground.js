import * as THREE from 'three';
import Subject from './Subject';

export default class FlatBackground {
    constructor(width, height) {
        console.log(width, height)
        this.backgroundMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height, 0),
            new THREE.MeshBasicMaterial()
        );

        this.backgroundMesh.material.depthTest = false;
        this.backgroundMesh.material.depthWrite = false;

        this.backgroundMesh.visible = false;

        this.backgroundSetSubject = new Subject();
    }

    addToScene = (scene) => {
        if (this.scene) {
            console.error('This FlatBackground is already attached to a scene, remove from the current scene to add to another scene!'); // eslint-disable-line no-console
            return;
        }
        this.scene = scene;
        this.scene.add(this.backgroundMesh);
    }

    removeFromScene = () => {
        if (!this.scene) {
            console.error(`Can't remove FlatBackground that is not attached to a scene!`); // eslint-disable-line no-console
            return;
        }
        this.scene.remove(this.backgroundMesh);
        this.scene = null;
    }

    setBackgroundAsync = (texture) => {
        return new Promise((resolve, reject) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            this.backgroundMesh.material.map = texture;
            this.backgroundMesh.material.needsUpdate = true;
            this.backgroundMesh.visible = true;
            this.backgroundSetSubject.notifyAll();
            return resolve();
        });
    }
}

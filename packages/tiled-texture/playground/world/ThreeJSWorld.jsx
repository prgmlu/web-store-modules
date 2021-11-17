import React, { Component } from 'react';
import * as THREE from 'three';
import PropTypes from 'prop-types';
import { ColliderManager } from 'three-physics';
import ThreeJSWorldController from 'three-controller';
import { isMobileDevice } from 'obsess-device-detector';
import { loadTextureAsync } from 'asset-loader';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';

import getTiledPlaneMaterial from '../../lib/TiledPlaneMaterial';

const isMobile = isMobileDevice();

const s3_bucket_base = 'https://s3.amazonaws.com/obsess-test-image';

class ThreeJSWorld extends Component {
    constructor(props) {
        super(props);
        this.animate = this.animate.bind(this);
        this.windowResizeHandler = this.windowResizeHandler.bind(this);
        this.getStackedPlaneMeshGroup = this.getStackedPlaneMeshGroup.bind(this);

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

        // Set up background sphere, collider manager, and collider
        this.colliderManager = new ColliderManager();
        this.controller = new ThreeJSWorldController(this.renderer, this.camera, this.colliderManager);

        // so we can pan
        this.controller.controller.enablePan = true;
        this.controller.controller.enableZoom = true;
    }

    componentDidMount() {
        window.addEventListener('resize', this.windowResizeHandler);
        const root = document.getElementById('app');
        root.appendChild(this.renderer.domElement);

        // https://s3.amazonaws.com/obsess-test-image/2k/2k_back_0_0.jpg
        function makeImageUrls(face) {
            const urls = [];
            for (let i = 0; i < 16; i++) {
                const row = Math.floor(i / 4);
                const column = i % 4;
                const url = `${s3_bucket_base}/2k/2k_${face}_${row}_${column}.jpg`;
                urls.push(url);
            }
            return urls;
        }
        const frontUrls = makeImageUrls('front');
        const backUrls = makeImageUrls('back');
        const topUrls = makeImageUrls('top');
        const bottomUrls = makeImageUrls('bottom');
        const leftUrls = makeImageUrls('left');
        const rightUrls = makeImageUrls('right');

        const frontPromises = frontUrls.map((image) => loadTextureAsync(image, (texture) => texture.minFilter = THREE.NearestFilter));
        const backPromises = backUrls.map((image) => loadTextureAsync(image, (texture) => texture.minFilter = THREE.NearestFilter));
        const topPromises = topUrls.map((image) => loadTextureAsync(image, (texture) => texture.minFilter = THREE.NearestFilter));
        const bottomPromises = bottomUrls.map((image) => loadTextureAsync(image, (texture) => texture.minFilter = THREE.NearestFilter));
        const leftPromises = leftUrls.map((image) => loadTextureAsync(image, (texture) => texture.minFilter = THREE.NearestFilter));
        const rightPromises = rightUrls.map((image) => loadTextureAsync(image, (texture) => texture.minFilter = THREE.NearestFilter));

        if (isMobile) {
            function setCubeFaceAsync(texturePromises, onTextureLoaded) {
                Promise.all(
                    texturePromises,
                )
                    .then((textures) => {
                        const bottomMaterial = getTiledPlaneMaterial(2, 4, textures.slice(0, 8));
                        const topMaterial = getTiledPlaneMaterial(2, 4, textures.slice(8));
                        onTextureLoaded(bottomMaterial, topMaterial);
                    })
                    .catch(console.error); // eslint-disable-line no-console
            }

            // front
            setCubeFaceAsync(frontPromises, (bottomMaterial, topMaterial) => {
                const frontGroup = this.getStackedPlaneMeshGroup(bottomMaterial, topMaterial);
                frontGroup.position.add(new THREE.Vector3(-10, 0, 0));
                frontGroup.rotateY(Math.PI / 2);
                this.scene.add(frontGroup);
            });

            // back
            setCubeFaceAsync(backPromises, (bottomMaterial, topMaterial) => {
                const backGroup = this.getStackedPlaneMeshGroup(bottomMaterial, topMaterial);
                backGroup.position.add(new THREE.Vector3(10, 0, 0));
                backGroup.rotateY(-Math.PI / 2);
                this.scene.add(backGroup);
            });

            // top
            setCubeFaceAsync(topPromises, (bottomMaterial, topMaterial) => {
                const topGroup = this.getStackedPlaneMeshGroup(bottomMaterial, topMaterial);
                topGroup.position.add(new THREE.Vector3(0, 10, 0));
                topGroup.rotateY(Math.PI);
                topGroup.rotateX(Math.PI / 2);
                this.scene.add(topGroup);
            });

            // bottom
            setCubeFaceAsync(bottomPromises, (bottomMaterial, topMaterial) => {
                const bottomGroup = this.getStackedPlaneMeshGroup(bottomMaterial, topMaterial);
                bottomGroup.position.add(new THREE.Vector3(0, -10, 0));
                bottomGroup.rotateY(Math.PI);
                bottomGroup.rotateX(-Math.PI / 2);
                this.scene.add(bottomGroup);
            });

            // left
            setCubeFaceAsync(leftPromises, (bottomMaterial, topMaterial) => {
                const leftGroup = this.getStackedPlaneMeshGroup(bottomMaterial, topMaterial);
                leftGroup.position.add(new THREE.Vector3(0, 0, 10));
                leftGroup.rotateY(Math.PI);
                this.scene.add(leftGroup);
            });

            // right
            setCubeFaceAsync(rightPromises, (bottomMaterial, topMaterial) => {
                const rightGroup = this.getStackedPlaneMeshGroup(bottomMaterial, topMaterial);
                rightGroup.position.add(new THREE.Vector3(0, 0, -10));
                this.scene.add(rightGroup);
            });
        } else {
            function getMaterialsAsync(texturePromises) {
                return new Promise((resolve, reject) => {
                    Promise.all(
                        texturePromises,
                    )
                        .then((textures) => {
                            const materials = getTiledPlaneMaterial(4, 4, textures);
                            resolve(materials);
                        })
                        .catch(reject);
                });
            }

            Promise.all(
                [
                    getMaterialsAsync(frontPromises),
                    getMaterialsAsync(backPromises),
                    getMaterialsAsync(topPromises),
                    getMaterialsAsync(backPromises),
                    getMaterialsAsync(leftPromises),
                    getMaterialsAsync(rightPromises),
                ],
            )
                .then((materials) => {
                    const cubeGeometry = new THREE.BoxBufferGeometry(-20, 20, 20);
                    const cube = new THREE.Mesh(cubeGeometry, materials);
                    this.scene.add(cube);
                })
                .catch(console.error); // eslint-disable-line no-console
        }
    }

    getStackedPlaneMeshGroup(materialBottom, materialTop) {
        const geometry1 = new THREE.PlaneBufferGeometry(20, 10);
        const geometry2 = new THREE.PlaneBufferGeometry(20, 10);
        const mesh1 = new THREE.Mesh(geometry1, materialBottom);
        const mesh2 = new THREE.Mesh(geometry2, materialTop);
        mesh1.position.set(0, -5, 0);
        mesh2.position.set(0, 5, 0);
        const group = new THREE.Group();
        group.add(mesh1);
        group.add(mesh2);
        return group;
    }

    componentWillUnmount() {
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

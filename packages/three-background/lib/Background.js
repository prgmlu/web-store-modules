/**
 * LOD 0 512:
 *  single 512x512 texture per face
 * LOD 1 1k:
 *  2x2 grid per face made of 512x512 textures
 * LOD 2 2k:
 *  4x4 grid per face made of 512x512 textures
 * LOD 3 4k:
 *  8x8 grid per face made of 512x512 textures
 */

import * as THREE from 'three';
import { getTiledPlaneMaterial, getMaxTextureImageUnits } from 'tiled-texture';
import Subject from './Subject';
import BackgroundLODs from './BackgroundLODs';
import { getNewCubeFaceMeshGroup, getBackgroundCube, updateFaceMeshTransform } from './MeshFactory';

export default class Background {
    constructor() {
        this.addToScene = this.addToScene.bind(this);
        this.removeFromScene = this.removeFromScene.bind(this);

        this.setBackgroundFaceAsync = this.setBackgroundFaceAsync.bind(this);
        this.updateCubeFaceMesh = this.updateCubeFaceMesh.bind(this);
        this.updateCubeFaceTextures = this.updateCubeFaceTextures.bind(this);
        this.updateMeshTexture = this.updateMeshTexture.bind(this);

        this.backgroundSetSubject = new Subject();

        this.backgroundGroup = getBackgroundCube(1, 1);
        this.backgroundGroup.visible = false;
    }

    addToScene(scene) {
        if (this.scene) {
            console.error('This background is already attached to a scene, remove from the current scene to add to another scene!'); // eslint-disable-line no-console
            return;
        }
        this.scene = scene;
        this.scene.add(this.backgroundGroup);
    }

    removeFromScene() {
        if (!this.scene) {
            console.error('Can\'t remove background that is not attached to a scene!'); // eslint-disable-line no-console
            return;
        }
        // * IMPORTANT: must remove all nested groups
        this.backgroundGroup.children.forEach((faceGroup) => {
            this.scene.remove(faceGroup);
        });
        this.scene.remove(this.backgroundGroup);
        this.scene = null;
    }

    setBackgroundFaceAsync(lod, face, textures) {
        return new Promise((resolve, reject) => {
            switch (lod) {
                case BackgroundLODs.LOD0:
                    this.updateCubeFaceMesh(face, 1, 1, 1, textures);
                    break;
                case BackgroundLODs.LOD1:
                    this.updateCubeFaceMesh(face, 1, 2, 2, textures);
                    break;
                case BackgroundLODs.LOD2:
                    if (getMaxTextureImageUnits() < 16) {
                        this.updateCubeFaceMesh(face, 2, 2, 4, textures);
                    } else {
                        this.updateCubeFaceMesh(face, 1, 4, 4, textures);
                    }
                    break;
                case BackgroundLODs.LOD3:
                    // 4k: we use 8 strips of 8x1 tile meshes and just ignore devices with 16 texture image units for simplicity
                    // 8x8 tiles
                    this.updateCubeFaceMesh(face, 8, 1, 8, textures);
                    break;
                default:
                    reject(`Current version have no support for Background LOD: ${lod}!`);
                    break;
            }

            this.backgroundSetSubject.notifyAll(lod, face);
            return resolve();
        });
    }

    updateCubeFaceMesh(face, targetMeshCount, tileCountX, tileCountY, textures) {
        // update face texture, create new mesh group and switch out old mesh group if needed
        const currentFaceMeshGroup = this.backgroundGroup.children[face];
        this.backgroundGroup.visible = true;
        const currentMeshCount = currentFaceMeshGroup.children.length || 1; // single mesh are not THREE.Group, so they don't have any children
        if (currentMeshCount === targetMeshCount) {
            this.updateCubeFaceTextures(currentFaceMeshGroup, tileCountX, tileCountY, textures, currentMeshCount === 1);
        } else {
            // * IMPORTANT: currently we only support 1x1 single mesh, 2x1 mesh group (2 meshes stack on top of eachother), and 8x1 mesh group (8 meshes stack on top of eachother).
            // create new mesh group
            const meshGroup = getNewCubeFaceMeshGroup(targetMeshCount, 1);
            const meshCount = meshGroup.children.length || 1; // single mesh are not THREE.Group, so they don't have any children
            this.updateCubeFaceTextures(meshGroup, tileCountX, tileCountY, textures, meshCount === 1);

            // set new face position
            updateFaceMeshTransform(meshGroup, face);

            // swap out old face with new face in backgroundGroup
            this.backgroundGroup.children[face] = meshGroup;

            // swap out old face with new face in scene
            this.scene.remove(currentFaceMeshGroup);
            this.scene.add(meshGroup);

            // clean up old face
            function cleanupMesh(mesh) {
                mesh.geometry.dispose();
                mesh.material.dispose();
                if (mesh.material.disposeTextures) {
                    mesh.material.disposeTextures();
                } else if (mesh.material.map) {
                    mesh.material.map.dispose();
                }
                mesh = undefined;
            }
            if (currentMeshCount === 1) {
                cleanupMesh(currentFaceMeshGroup);
            } else {
                currentFaceMeshGroup.children.forEach((mesh) => {
                    cleanupMesh(mesh);
                });
            }
        }
    }

    updateCubeFaceTextures(meshGroup, tileCountX, tileCountY, textures, isSingleMesh) {
        if (isSingleMesh) {
            // meshGroup is a single mesh, meaning it's a THREE.Mesh and not Three.Group
            this.updateMeshTexture(meshGroup, tileCountX, tileCountY, textures);
        } else {
            // meshGroup is THREE.Group, meaning the actual meshes are in meshGroup.children
            const texturesPerMesh = Math.floor(textures.length / meshGroup.children.length);
            meshGroup.children.forEach((mesh, index) => {
                const startIndex = index * texturesPerMesh;
                const endIndex = (index + 1) * texturesPerMesh;
                this.updateMeshTexture(mesh, tileCountX, tileCountY, textures.slice(startIndex, endIndex));
            });
        }
    }

    updateMeshTexture(mesh, tileCountX, tileCountY, textures) {
        if (tileCountX === 1 && tileCountY === 1) {
            let pendingCleanupMaterial = null;

            // check if current material is THREE.MeshBasicMaterial or TiledPlaneMaterial
            if (!mesh.material.map) {
                pendingCleanupMaterial = mesh.material;
                mesh.material = new THREE.MeshBasicMaterial();
            }

            // single texture plane THREE.MeshBasicMaterial
            mesh.material.map = textures[0];
            mesh.material.needsUpdate = true;

            // cleanup old material
            if (pendingCleanupMaterial) {
                pendingCleanupMaterial.dispose();
                pendingCleanupMaterial.disposeTextures; // no null check here, because we know this is a TiledPlaneMaterial
            }
        } else {
            // tiled plane material TiledPlaneMaterial
            const material = getTiledPlaneMaterial(tileCountX, tileCountY, textures);

            // clean up old material
            mesh.material.dispose();
            if (mesh.material.disposeTextures) {
                mesh.material.disposeTextures();
            } else if (mesh.material.map) {
                mesh.material.map.dispose();
            }

            mesh.material = material;
        }
    }
}

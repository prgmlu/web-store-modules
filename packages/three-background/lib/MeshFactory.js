import * as THREE from 'three';
import BackgroundFaces from './BackgroundFaces';

export function getNewCubeFaceMeshGroup(rows, columns) {
    const emptyMaterial = new THREE.MeshBasicMaterial();
    if (rows === 1 && columns === 1) {
        const plane = new THREE.PlaneBufferGeometry(20, 20);
        const mesh = new THREE.Mesh(plane, emptyMaterial);

        mesh.rows = 1;
        mesh.columns = 1;

        // TODO: make this a THREE.Group as well?
        return mesh;
    } if (rows === 2 && columns === 1) {
        const bottomPlane = new THREE.PlaneBufferGeometry(20, 10);
        const topPlane = new THREE.PlaneBufferGeometry(20, 10);
        const bottomMesh = new THREE.Mesh(bottomPlane, emptyMaterial);
        const topMesh = new THREE.Mesh(topPlane);
        bottomMesh.position.set(0, -5, 0);
        topMesh.position.set(0, 5, 0);
        const planeMeshGroup = new THREE.Group();
        planeMeshGroup.add(bottomMesh, topMesh);

        planeMeshGroup.rows = 2;
        planeMeshGroup.columns = 1;

        return planeMeshGroup;
    } if (rows === 8 && columns === 1) {
        const heightPerPlane = 2.5; // 20 / 8
        const halfHeightPerPlane = 1.25; // 2.5 / 2
        const bottomEdgePosY = 0 - heightPerPlane * (rows / 2);
        const planeMeshGroup = new THREE.Group();
        for (let i = 0; i < rows; ++i) {
            const plane = new THREE.PlaneBufferGeometry(20, heightPerPlane);
            const mesh = new THREE.Mesh(plane, emptyMaterial);
            mesh.position.set(0, bottomEdgePosY + halfHeightPerPlane + heightPerPlane * i, 0);
            planeMeshGroup.add(mesh);
        }

        planeMeshGroup.rows = 8;
        planeMeshGroup.columns = 1;

        return planeMeshGroup;
    }

    console.error(`Invalid rows and columns combination ${rows}x${columns}. Valid rows and columns combinations are 1x1, 2x1 and 8x1.`); // eslint-disable-line no-console
    return null;
}

// px: left
// nx: right
// py: top
// ny: bottom
// pz: back
// nz: front
export function getBackgroundCube(rowsPerPlane, columnsPerPlane) {
    // left
    const leftGroup = getNewCubeFaceMeshGroup(rowsPerPlane, columnsPerPlane);
    updateFaceMeshTransform(leftGroup, BackgroundFaces.LEFT);
    // leftGroup.position.add(new THREE.Vector3(0, 0, 10));
    // leftGroup.rotateY(Math.PI);

    // right
    const rightGroup = getNewCubeFaceMeshGroup(rowsPerPlane, columnsPerPlane);
    updateFaceMeshTransform(rightGroup, BackgroundFaces.RIGHT);
    // rightGroup.position.add(new THREE.Vector3(0, 0, -10));

    // top
    const topGroup = getNewCubeFaceMeshGroup(rowsPerPlane, columnsPerPlane);
    updateFaceMeshTransform(topGroup, BackgroundFaces.TOP);
    // topGroup.position.add(new THREE.Vector3(0, 10, 0));
    // topGroup.rotateX(Math.PI / 2);

    // bottom
    const bottomGroup = getNewCubeFaceMeshGroup(rowsPerPlane, columnsPerPlane);
    updateFaceMeshTransform(bottomGroup, BackgroundFaces.BOTTOM);
    // bottomGroup.position.add(new THREE.Vector3(0, -10, 0));
    // bottomGroup.rotateX(-Math.PI / 2);

    // back
    const backGroup = getNewCubeFaceMeshGroup(rowsPerPlane, columnsPerPlane);
    updateFaceMeshTransform(backGroup, BackgroundFaces.BACK);
    // backGroup.position.add(new THREE.Vector3(10, 0, 0));
    // backGroup.rotateY(-Math.PI / 2);

    // front
    const frontGroup = getNewCubeFaceMeshGroup(rowsPerPlane, columnsPerPlane);
    updateFaceMeshTransform(frontGroup, BackgroundFaces.FRONT);
    // frontGroup.position.add(new THREE.Vector3(-10, 0, 0));
    // frontGroup.rotateY(Math.PI / 2);

    const cubeGroup = new THREE.Group();
    cubeGroup.add(leftGroup, rightGroup, topGroup, bottomGroup, backGroup, frontGroup);
    return cubeGroup;
}

export function updateFaceMeshTransform(mesh, face) {
    switch (face) {
        case BackgroundFaces.LEFT:
            mesh.position.add(new THREE.Vector3(0, 0, 10));
            mesh.rotateY(Math.PI);
            break;
        case BackgroundFaces.RIGHT:
            mesh.position.add(new THREE.Vector3(0, 0, -10));
            break;
        case BackgroundFaces.TOP:
            mesh.position.add(new THREE.Vector3(0, 10, 0));
            mesh.rotateX(Math.PI / 2);
            break;
        case BackgroundFaces.BOTTOM:
            mesh.position.add(new THREE.Vector3(0, -10, 0));
            mesh.rotateX(-Math.PI / 2);
            break;
        case BackgroundFaces.BACK:
            mesh.position.add(new THREE.Vector3(10, 0, 0));
            mesh.rotateY(-Math.PI / 2);
            break;
        case BackgroundFaces.FRONT:
            mesh.position.add(new THREE.Vector3(-10, 0, 0));
            mesh.rotateY(Math.PI / 2);
            break;
        default:
            break;
    }
}

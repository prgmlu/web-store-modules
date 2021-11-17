import * as THREE from 'three';

/**
 * Base Collider class.
 * @param {THREE.Geometry} threeGeometry - the geometry of the collider
 * @param {THREE.Material} threeMaterial - the material of the collider, usually THREE.MeshBasicMaterial
 * @param {function} onHover - callback for when the collider is hovered
 * @param {function} onUnhover - callback for when the collider is unhovered
 * @param {function} onClick - callback for when the collider is clicked
 */
export default class Collider extends THREE.Mesh {
    constructor(threeGeometry, threeMaterial, onHover, onUnhover, onClick) {
        super(threeGeometry, threeMaterial);
        this.setTransform = this.setTransform.bind(this);
        this.dispose = this.dispose.bind(this);

        // make the material invisible so we don't see the collider
        this.material.visible = false;

        this.onHover = null;
        this.onUnhover = null;
        this.onClick = null;
        if (typeof (onHover) === 'function') {
            this.onHover = onHover;
        } else {
            console.error('Collider onHover must be a function!'); // eslint-disable-line no-console
        }
        if (typeof (onUnhover) === 'function') {
            this.onUnhover = onUnhover;
        } else {
            console.error('Collider onUnhover must be a function!'); // eslint-disable-line no-console
        }
        if (typeof (onClick) === 'function') {
            this.onClick = onClick;
        } else {
            console.error('Collider onClick must be a function!'); // eslint-disable-line no-console
        }
    }

    /**
     * Set the collider's transform.
     * @param {THREE.Matrix4} matrix4x4 - a 4 by 4 transform matrix
     */
    setTransform(matrix4x4) {
        this.matrix = matrix4x4;
        this.matrix.decompose(this.position, this.quaternion, this.scale);
    }

    /** Set the visibility of the collider, mostly for debugging purposes. */
    setVisibility(isVisible) {
        this.material.visible = isVisible;
    }

    /** Clean up the collider, call this before deleting the collider. */
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        delete this.setTransform;
        delete this.setVisibility;
        delete this.onHover;
        delete this.onUnhover;
        delete this.onClick;
    }
}

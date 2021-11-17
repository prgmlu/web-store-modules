import * as THREE from 'three';
import Collider from './Collider';

/**
 * BoxCollider class.
 * @param {number} width - collider width
 * @param {number} height - collider height
 * @param {number} depth - collider depth
 * @param {function} onHover - callback for when the collider is hovered
 * @param {function} onUnhover - callback for when the collider is unhovered
 * @param {function} onClick - callback for when the collider is clicked
 */
export default class BoxCollider extends Collider {
    constructor(width, height, depth, onHover, onUnhover, onClick) {
        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        const colliderMaterial = new THREE.MeshBasicMaterial({ color: '#19c100' });
        colliderMaterial.wireframe = true;
        super(boxGeometry, colliderMaterial, onHover, onUnhover, onClick);
    }
}

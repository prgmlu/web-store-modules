/**
 * ColliderManager class.
 * Manages and organizes colliders in the three.js world.
 */
export default class ColliderManager {
    constructor() {
        this.addCollider = this.addCollider.bind(this);
        this.removeCollider = this.removeCollider.bind(this);
        this.count = this.count.bind(this);
        this.getColliders = this.getColliders.bind(this);
        this.colliders = [];
    }

    /**
     * Add this collider to this ColliderManager.
     * @param {Collider} collider - the collider to add to this ColliderManger
     */
    addCollider(collider) {
        this.colliders.push(collider);
    }

    /**
     * Remove this collider from this ColliderManager.
     * @param {Collider} collider - the collider to remove from this ColliderManger
     */
    removeCollider(collider) {
        const index = this.colliders.indexOf(collider);
        if (index > -1) {
            this.colliders.splice(index, 1);
        } else {
            console.log(`Can't remove collider with uuid: ${collider.uuid}`); // eslint-disable-line no-console
        }
    }

    /**
     *  Get the collider count that is managed by this ColliderManager.
     * @returns {number} - the count of the colliders managed by this ColliderManager
     */
    count() {
        return this.colliders.length;
    }

    /**
     * Get all the colliders that is managed by this ColliderManager.
     * @returns {Array} - an array of colliders managed by this ColliderManager.
    */
    getColliders() {
        return this.colliders;
    }
}

// * Important: ES6 don't support interface, so we use an inheritance implementation.
// * If interface is introduced in future versions of js, we should refactor this into an interface.

/**
 * Base InteractableObjectComponent class
 */
export default class InteractableObjectComponent {
    constructor() {
        this.start = this.start.bind(this);
        this.onHover = this.onHover.bind(this);
        this.onUnhover = this.onUnhover.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setOwner = this.setOwner.bind(this);
        this.removeOwner = this.removeOwner.bind(this);
        this.onDestroy = this.onDestroy.bind(this);

        this.owner = null;
    }

    /** Called when the owner interactable object is added to scene. */
    start() {}

    /** Called when the owner component before component is destroyed (removed from scene, owner destroyed) */
    onDestroy() {}

    /** Called when the owner InteractableObject is hovered */
    onHover() {}

    /** Called when the owner InteractableObject is unhovered */
    onUnhover() {}

    /** Called when the owner InteractableObject is clicked */
    onClick() {}

    /**
     * Set the owner InteractableObject of this InteractableObjectComponent
     * @param {InteractableObject} owner - an InteractableObject
     */
    setOwner(owner) {
        this.owner = owner;
    }

    /** Set this InteractableObjectComponent to have no owner */
    removeOwner() {
        this.owner = null;
    }
}

import * as THREE from 'three';
import { BoxCollider } from 'three-physics';
import InteractableObjectComponent from './InteractableObjectComponent';

/**
 * Base InteractableObject class
 */
export default class InteractableObject {
    constructor() {
        this.onHover = this.onHover.bind(this);
        this.onUnhover = this.onUnhover.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setVisualObject = this.setVisualObject.bind(this);
        this.setTransform = this.setTransform.bind(this);
        this.setColliderTransform = this.setColliderTransform.bind(this);
        this.addToThreeJSWorldScene = this.addToThreeJSWorldScene.bind(this);
        this.removeFromScene = this.removeFromScene.bind(this);
        this.setThreeJSWorldContext = this.setThreeJSWorldContext.bind(this);
        this.getThreeJSWorldContext = this.getThreeJSWorldContext.bind(this);
        this.setWebStoreUILayerContext = this.setWebStoreUILayerContext.bind(this);
        this.getWebStoreUILayerContext = this.getWebStoreUILayerContext.bind(this);
        this.attachComponent = this.attachComponent.bind(this);
        this.removeComponent = this.removeComponent.bind(this);
        this.getComponentsOfType = this.getComponentsOfType.bind(this);
        this.dispose = this.dispose.bind(this);

        this.visualObject = null;
        this.collider = new BoxCollider(1, 1, 1, this.onHover, this.onUnhover, this.onClick);
        this.scene = null;
        this.colliderManager = null;

        this.threeJSWorldContext = null;
        this.webStoreUILayerContext = null;

        this.components = [];
    }

    /**
     * Call all the onHover function on the components attached to this InteractableObject.
     * Call when the collider attached to this InteractableObject is hovered.
     */
    onHover() {
        this.components.map((component) => {
            if (component.onHover) {
                component.onHover();
            }
        });
    }

    /**
     * Call all the onUnhover function on the components attached to this InteractableObject.
     * Call when the collider attached to this InteractableObject is unhovered.
     */
    onUnhover() {
        this.components.map((component) => {
            if (component.onUnhover) {
                component.onUnhover();
            }
        });
    }

    /**
     * Call all the onClick function on the components attached to this InteractableObject.
     * Call when the collider attached to this InteractableObject is clicked.
     */
    onClick() {
        this.components.map((component) => {
            if (component.onClick) {
                component.onClick();
            }
        });
    }

    /**
     * Set the visiualObject attached to this InteractableObject.
     * @param {THREE.Object3D} visualObject - the visual representation of this InteractableObject, usually a THREE.Sprite
     */
    // TODO: To make this more generic, we can refactor the visual object into a component as well.
    setVisualObject(visualObject) {
        if (!visualObject) {
            this.visualObject = null;
            return;
        }
        if (!(visualObject instanceof THREE.Object3D)) {
            console.error('Can\'t set visual object to a non THREE.Object3D type!'); // eslint-disable-line no-console
            return;
        }
        this.visualObject = visualObject;
    }

    /**
     * Set the transform of the visualObject attached to this InteractableObject.
     * @param {Array} transformArray - a 16 cell array representing the 4x4 matrix transform of the visualObject attached to this InteractableObject.
     */
    setTransform(transformArray) {
        if (!this.visualObject) {
            console.error('Can\'t set transform on an interactable object without a visual object!'); // eslint-disable-line no-console
            return;
        }

        const { visualObject } = this;
        const matrix4x4 = new THREE.Matrix4();
        matrix4x4.fromArray(transformArray);
        visualObject.matrix = matrix4x4;
        visualObject.matrix.decompose(visualObject.position, visualObject.quaternion, visualObject.scale);
    }

    /**
     * Set the transform of the collider attached to this InteractableObject.
     * @param {Array} transformArray - a 16 cell array representing the 4x4 matrix transform of the collider attached to this InteractableObject.
     */
    setColliderTransform(colliderTransformArray) {
        const matrix4x4 = new THREE.Matrix4();
        matrix4x4.fromArray(colliderTransformArray);
        this.collider.setTransform(matrix4x4);
    }

    /**
     * Add this InteractableObject to the scene specified in the threeJSWorldContext.
     */
    // TODO: there should be a way to add this InteractableObject to a scene in case a threeJSWorldContext don't exist.
    addToThreeJSWorldScene() {
        if (!this.threeJSWorldContext) {
            console.error('ThreeJSWorldContext not set!'); // eslint-disable-line no-console
            return;
        }

        this.scene = this.threeJSWorldContext.scene;
        // We don't want to add a null visual object to scene.
        if (this.visualObject) {
            this.scene.add(this.visualObject);
        }
        // TODO: Object should be able to exist without being interactable, meaning cases where there's no colliderManager.
        // TODO: Create a base object class, and make InteractableObject inherit from it or make the collider into a real component and can be attached to the base object
        // TODO: we probably never have to make it this^ generic.
        this.colliderManager = this.threeJSWorldContext.colliderManager;
        this.scene.add(this.collider);
        this.colliderManager.addCollider(this.collider);

        this.components.forEach((component) => component.start());
    }

    /**
     * Remove this InteractableObject from the scene it's in.
     */
    removeFromScene() {
        if (!this.scene) {
            console.error('Can not remove interactable object that\'s not in any scene!'); // eslint-disable-line no-console
        }

        if (this.visualObject) {
            this.scene.remove(this.visualObject);
        }
        this.scene.remove(this.collider);
        this.colliderManager.removeCollider(this.collider);
        this.scene = null;
        this.colliderManager = null;
    }

    /**
     * Set the threeJSWorldContext on this InteractableObject.
     * @param {Object} threeJSWorldContext - { react-router-history, THREE.Scene, ColliderManager, backgroundSphere }
     */
    setThreeJSWorldContext(threeJSWorldContext) {
        if (this.threeJSWorldContext) {
            console.log('Setting new threeJSWorldContext on InteractableObject.'); // eslint-disable-line no-console
        }

        if (this.scene) {
            console.log('Setting new threeJSWorldContext on InteractableObject, removing from old context scene.'); // eslint-disable-line no-console
            this.removeFromScene();
        }

        this.threeJSWorldContext = threeJSWorldContext;
    }

    /**
     * Get the threeJSWorldContext of this InteractableObject.
     * @returns {Object} threeJSWorldContext - { react-router-history, THREE.Scene, ColliderManager, backgroundSphere }
     */
    getThreeJSWorldContext() {
        if (!this.threeJSWorldContext) {
            console.error('ThreeJSWorldContext don\'t exist on this InteractableObject!'); // eslint-disable-line no-console
            return null;
        }
        return this.threeJSWorldContext;
    }

    /**
     * Set the webStoreUILayer on this InteractableObject.
     * Used for rendering react Dynamic UIs.
     * @param {Object} webStoreUILayer - { addDynamicUI, removeDynamicUI }
     */
    setWebStoreUILayerContext(webStoreUILayer) {
        this.webStoreUILayerContext = webStoreUILayer;
    }

    /**
     * Get the webStoreUILayer of this InteractableObject.
     * @returns {Object} webStoreUILayer - { addDynamicUI, removeDynamicUI }
     */
    getWebStoreUILayerContext() {
        if (!this.webStoreUILayerContext) {
            console.error('WebStoreUILayerContext don\'t exist on this InteractableObject!'); // eslint-disable-line no-console
            return null;
        }
        return this.webStoreUILayerContext;
    }

    /**
     * Attach this InteractableObjectComponent to this InteractableObject
     * @param {InteractableObjectComponent} component - an InteractableObjectComponent
     */
    attachComponent(component) {
        if (!(component instanceof InteractableObjectComponent)) {
            console.error('Can\'t attach object of non InteractableObjectComponent type to an InteractableObject!'); // eslint-disable-line no-console
            return;
        }
        component.setOwner(this);
        this.components.push(component);
    }

    /**
     * Remove this InteractableObjectComponent from this InteractableObject
     * @param {InteractableObjectComponent} component - an InteractableObjectComponent
     */
    removeComponent(component) {
        if (!(component instanceof InteractableObjectComponent)) {
            console.error('Can\'t remove object of non InteractableObjectComponent type from an InteractableObject!'); // eslint-disable-line no-console
            return;
        }
        const index = this.components.indexOf(component);
        if (index === -1) {
            console.error(`Interactable Object has no InteractableObjectComponent ${component}`); // eslint-disable-line no-console
            return;
        }
        component.removeOwner();
        this.components.splice(index, 1);
        component.onDestroy();
    }

    /**
     * Get all the InteractableObjectComponent of type that is attached to this InteractableObject
     * @param {InteractableObjectComponent} type - the type of the component to search for
     * @returns {Array} - an array of InteractableObjectComponent of type
     */
    getComponentsOfType(type) {
        if (!(type.prototype instanceof InteractableObjectComponent)) {
            console.error(`Can't get type ${type.name}of non InteractableObjectComponent!`); // eslint-disable-line no-console
            return;
        }
        const results = this.components.filter((component) => component instanceof type);
        return results;
    }

    /** Clean up this InteractableObject, call before delete. */
    dispose() {
        if (this.scene) {
            this.removeFromScene();
        }
        this.collider.dispose();
        if (this.visualObject.material) {
            this.visualObject.material.dispose();
        }
        /** Runs dispose function in each component to clean up subscriber logic */
        this.components.forEach((component) => {
            component.removeOwner();
            component.onDestroy();
        });
        for (const key in this) {
            delete this[key];
        }
    }
}

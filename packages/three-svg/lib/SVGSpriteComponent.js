import { InteractableObjectComponent } from 'three-interactable-object';
import SVGSprite from './SVGSprite';

// This component controls the interaction of the SVGSprite
// We can further break this down to smaller components but I don't think it's necessary at the moment
// because this is how all of the sprites behave and it only controls the color interactions right now.
export default class SVGSpriteComponent extends InteractableObjectComponent {
    constructor() {
        super();
        this.setSVGString = this.setSVGString.bind(this);
        this.setPrimaryColor = this.setPrimaryColor.bind(this);
        this.setSecondaryColor = this.setSecondaryColor.bind(this);
        this.setColor = this.setColor.bind(this);

        this.svgString = '';
        this.primaryColor = 'black';
        this.secondaryColor = 'gray';
        // * IMPORTANT: This needs to be white on init, because by default the svg value that have modifiable fill colors are white.
        this.color = 'white';
        // * IMPORTANT: This needs to be 0 on init, because by default the svg value that have modifiable transform x is 0.
        this.rotationX = 0;

        this.svgSprite = new SVGSprite();
    }

    setSVGString(svgString) {
        this.svgString = svgString;
        this.svgSprite.setSVGString(svgString);
        this.setColor(this.primaryColor);
    }

    setPrimaryColor(color) {
        this.primaryColor = color;
    }

    setSecondaryColor(color) {
        this.secondaryColor = color;
    }

    setColor(color) {
        if (!this.svgString) {
            console.error(`SVG string not set on SVGSpriteComponent: ${this}`); // eslint-disable-line no-console
            return;
        }
        const regexString = this.color.replace(/\(|\)/g, '\\$&');
        const coloredSVGString = this.svgString.replace(new RegExp(`fill="${regexString}"`, 'g'), `fill=\"${color}\"`);
        this.svgString = coloredSVGString;
        this.svgSprite.setSVGString(this.svgString);
        this.color = color;
    }

    setRotationX(rotX) {
        if (!this.svgString) {
            console.error(`SVG string not set on SVGSpriteComponent: ${this}`); // eslint-disable-line no-console
            return;
        }
        const rotatedSVGString = this.svgString.replace(`rotate(${this.rotationX} 256 256)`, `rotate(${rotX} 256 256)`);
        this.svgString = rotatedSVGString;
        this.svgSprite.setSVGString(this.svgString);
        this.rotationX = rotX;
    }

    onHover() {
        if (this.color === this.secondaryColor) {
            return;
        }
        this.setColor(this.secondaryColor);
    }

    onUnhover() {
        if (this.color === this.primaryColor) {
            return;
        }
        this.setColor(this.primaryColor);
    }

    onClick() {
    }

    setOwner(owner) {
        super.setOwner(owner);
        const svgSpriteComponents = this.owner.getComponentsOfType(SVGSpriteComponent);
        if (svgSpriteComponents && svgSpriteComponents.length > 0) {
            throw new Error('Interactable Object can only have a single SVGSpriteComponent attached!');
        }
        this.owner.setVisualObject(this.svgSprite);
        if (this.owner.scene) {
            this.owner.scene.add(this.owner.visualObject);
        }
    }

    removeOwner() {
        if (!this.owner) {
            console.error('Can\'t remove a SVGSpriteComponent that is not attached to an Interactable Object'); // eslint-disable-line no-console
            return;
        }
        if (this.owner.scene) {
            this.owner.scene.remove(this.visualObject);
        }
        this.owner.setVisualObject(null);
        super.removeOwner();
    }
}

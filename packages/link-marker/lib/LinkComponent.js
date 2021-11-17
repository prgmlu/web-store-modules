import { InteractableObjectComponent } from 'three-interactable-object';

export default class LinkComponent extends InteractableObjectComponent {
    constructor(sendAnalytics) {
        super();
        this.setTargetLink = this.setTargetLink.bind(this);

        this.targetLink = null;
        this.sendAnalytics = sendAnalytics;
    }

    setTargetLink(link) {
        if (typeof link !== 'string') {
            console.error(`Can't set navigation target to non-string type ${typeof link}`); // eslint-disable-line no-console
            return;
        }
        this.targetLink = link;
    }

    onClick() {
        if (!this.targetLink) {
            console.error('Target link not set on InteractableObject!'); // eslint-disable-line no-console
            return;
        }
        // * IMPORTANT: we don't have a separate analytics component
        // * because we need to trigger the analytics before history.push,
        // * IMPORTANT: the marker gets destroyed after history.push is called.
        if (this.sendAnalytics) {
            this.sendAnalytics(this.targetLink);
        }
        window.open(this.targetLink);
    }
}

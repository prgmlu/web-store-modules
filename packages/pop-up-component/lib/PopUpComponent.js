import { InteractableObjectComponent } from 'three-interactable-object';

import uuidv1 from 'uuid/v1';

export default class PopUpComponent extends InteractableObjectComponent {
    constructor(componentToRender, renderProps) {
        super();
        this.onModalClose = this.onModalClose.bind(this);

        this.uuid = uuidv1();
        this.componentToRender = componentToRender;
        this.renderProps = renderProps;
        this.renderProps.onClose = this.onModalClose;
    }

    onClick() {
        const webStoreUILayerContext = this.owner.getWebStoreUILayerContext();
        if (!webStoreUILayerContext) {
            console.error(`WebstoreUILayerContext not set on InteractableObject ${this.owner}`); // eslint-disable-line no-console
        }
        webStoreUILayerContext.addDynamicUI(this.uuid, this.componentToRender, this.renderProps);
    }

    onModalClose() {
        const webStoreUILayerContext = this.owner.getWebStoreUILayerContext();
        if (!webStoreUILayerContext) {
            console.error(`WebstoreUILayerContext not set on InteractableObject ${this.owner}`); // eslint-disable-line no-console
        }
        webStoreUILayerContext.removeDynamicUI(this.uuid);
    }
}

import React, { Component } from 'react';
import { WebStoreUILayerContext } from './WebStoreUILayerContext';

export default class WebStoreUILayer extends Component {
    constructor() {
        super();
        this.addDynamicUI = this.addDynamicUI.bind(this);
        this.removeDynamicUI = this.removeDynamicUI.bind(this);

        const dynamicUIs = new Map();
        this.state = {
            dynamicUIs,
        };
    }

    addDynamicUI(uuid, uiType, uiProps) {
        const { dynamicUIs } = this.state;
        if (dynamicUIs.has(uuid)) {
            console.error(`Dynamic UI with uuid ${uuid} already exist!`); // eslint-disable-line no-console
            return;
        }
        const uiData = {
            uuid,
            type: uiType,
            props: uiProps,
        };
        dynamicUIs.set(uuid, uiData);
        this.setState({ dynamicUIs });
    }

    removeDynamicUI(uuid) {
        const { dynamicUIs } = this.state;
        const deleted = dynamicUIs.delete(uuid);
        if (!deleted) {
            console.log(`Delete dynamic ui with uuid ${uuid} failed because it doesn't exist or deletion failure`); // eslint-disable-line no-console
        }
        this.setState({ dynamicUIs });
    }

    render() {
        const contextValue = {
            addDynamicUI: this.addDynamicUI,
            removeDynamicUI: this.removeDynamicUI,
        };
        const { dynamicUIs } = this.state;
        const dynamicUIValues = dynamicUIs.values();
        const dynamicUIRender = Array.from(dynamicUIValues).map((uiData) => {
            const UIType = uiData.type;
            const uiProps = uiData.props;
            return <UIType key={uiData.uuid} {...uiProps} />;
        });
        return (
            <WebStoreUILayerContext.Provider value={contextValue}>
                {dynamicUIRender}
                {this.props.children}
            </WebStoreUILayerContext.Provider>
        );
    }
}

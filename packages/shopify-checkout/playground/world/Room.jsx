import React, { useState, useEffect } from 'react';
import { WebStoreUILayerContext } from 'web-store-ui-layer';
import { ThreeJSWorldContext } from './ThreeJSWorldContext';
import useShopifyCheckout from '../../lib/useShopifyCheckout';

const testDomain = 'obsess-testing-noemie.myshopify.com';
const testToken = 'c3d2f920dbf1b7ba77e3339d28861670';
const exampleVariantId = 'Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zMzIzOTYzNjI3OTQyOQ==';
const storeId = 'SAMPLESTOREID';

const Room = () => {
    const [
        checkout,
        exampleLineItemId,
        handleAddToCart, // essential
        handleRemoveItemFromCart, // essential
        handleCheckoutRedirect, // essential
    ] = useShopifyCheckout(testDomain, testToken, storeId);

    return (
        <div className="shopify-checkout-wrapper">
            <div className="checkout-item example-item">{`checkoutId: ${checkout.id}`}</div>
            <div className="checkout-item example-item">{`exampleVariantId: ${exampleVariantId}`}</div>
            <div className="checkout-item" onClick={() => handleAddToCart(exampleVariantId)}>ADD TO CART</div>
            <div className="checkout-item example-item">{`exampleLineItemId: ${exampleLineItemId}`}</div>
            <div className="checkout-item" onClick={() => handleRemoveItemFromCart(exampleLineItemId)}>REMOVE FROM CART</div>
            <div className="checkout-item" onClick={() => handleCheckoutRedirect()}> CHECKOUT</div>
        </div>
    );
};

export default (props) => (
    <ThreeJSWorldContext.Consumer>
        {(threeJSWorldContextValue) => (
            <WebStoreUILayerContext.Consumer>
                {(webStoreUILayerContextValue) => (
                    <Room
                        {...props}
                        threeJSWorldContext={threeJSWorldContextValue}
                        webStoreUILayerContext={webStoreUILayerContextValue}
                    />
                )}
            </WebStoreUILayerContext.Consumer>
        )}
    </ThreeJSWorldContext.Consumer>
);

import React, { useState, useEffect } from 'react';
import ShopifyInstance from './ShopifyCheckout';

const useShopifyCheckout = (domain, storeFrontApiToken, storeId) => {
    const [checkout, setCheckout] = useState({});
    const [storeProducts, setStoreProducts] = useState([]);
    const [exampleLineItemId, setExampleLineItemId] = useState('no items');
    const shopify = new ShopifyInstance(domain, storeFrontApiToken);

    // initial setup of the cart for the user when they land on the site:
    // retrieve current cartId in storage; if none is found - make a new one
    // if found -> use existing checkoutId
    // clear storage when checking out

    useEffect(() => {
        if (localStorage.getItem(storeId)) {
            const existingCheckoutId = localStorage.getItem(storeId);
            const getExistingCart = () => shopify.createCart(true, existingCheckoutId).then((cart) => {
                setCheckout(cart);
            });
            getExistingCart();
        } else {
            const getNewCart = () => shopify.createCart().then((cart) => {
                setCheckout(cart);
            });
            getNewCart();
        }

        const getInventory = () => shopify.getAllProducts().then((products) => {
            setStoreProducts(products);
        });
        getInventory();
    }, []);

    useEffect(() => {
        if (!localStorage.getItem(storeId) && checkout.id) {
            localStorage.setItem(storeId, checkout.id);
        }
        if (checkout.lineItems && checkout.lineItems.length >= 1) {
            setExampleLineItemId(checkout.lineItems[0].id);
        } else {
            setExampleLineItemId('No items placed');
        }
    }, [checkout, storeProducts, exampleLineItemId]);

    const handleAddToCart = (variantId, quantity) => {
        const updateCheckoutCart = () => shopify.addItemToCart(checkout.id, variantId, quantity).then((cart) => {
            setCheckout(cart);
        });
        updateCheckoutCart();
    };

    const handleRemoveItemFromCart = (lineItemId) => {
        const updateCheckoutCart = () => shopify.removeItemFromCart(checkout.id, lineItemId).then((cart) => {
            setCheckout(cart);
        });
        updateCheckoutCart();
    };

    const handleCheckoutRedirect = () => {
        localStorage.removeItem(storeId);
        window.open(checkout.webUrl, '_blank');
    };


    return [
        checkout,
        exampleLineItemId,
        handleAddToCart,
        handleRemoveItemFromCart,
        handleCheckoutRedirect,
    ];
};

export default useShopifyCheckout;

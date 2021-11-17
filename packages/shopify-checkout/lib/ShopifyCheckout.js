import Client from 'shopify-buy';

export default class ShopifyInstance {
    constructor(domain, storefrontAccessToken) {
        this.client = Client.buildClient({
            domain,
            storefrontAccessToken,
        });
    }

    async createCart(existing = false, checkoutId = undefined) {
        try {
            if (existing) {
                const existingCart = await this.client.checkout.fetch(checkoutId);
                return existingCart;
            }
            const newCart = await this.client.checkout.create();
            return newCart;
        } catch (error) {
            console.log(error);
        }
    }

    async addItemToCart(checkoutId, variantId, quantity = 1) {
        const item = [{ variantId, quantity: parseInt(quantity, 10) }];
        try {
            const updatedCheckoutCart = await this.client.checkout.addLineItems(checkoutId, item);
            return updatedCheckoutCart;
        } catch (error) {
            console.log(error);
        }
    }

    async removeItemFromCart(checkoutId, lineItemId) {
        try {
            const updatedCheckoutCart = await this.client.checkout.removeLineItems(checkoutId, [lineItemId]);
            return updatedCheckoutCart;
        } catch (error) {
            console.log(error);
        }
    }

    async getAllProducts() {
        try {
            const allProducts = await this.client.product.fetchAll();
            return allProducts;
        } catch (error) {
            console.log(error);
        }
    }
}

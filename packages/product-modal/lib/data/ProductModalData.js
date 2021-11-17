const globalProductDataMap = new Map();
const brandSkuDataMap = new Map();

export function getProductInfoAsyncObsessAPI(sku, apiUrl, storeId, productDataMap = globalProductDataMap) {
    return new Promise((resolve, reject) => {
        const cachedProductData = productDataMap.get(sku);
        if (cachedProductData) {
            resolve(cachedProductData);
        } else {
            const fetchUrl = `${apiUrl}store/product?store_id=${storeId}&product_id=${encodeURIComponent(sku)}`;
            fetch(fetchUrl)
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    }
                    throw new Error(`Fetch product info failed with code ${response.status}`);
                })
                .then((responseJson) => {
                    if (productDataMap.get(sku)) {
                        console.log('Product data fetch finished before this fetch'); // eslint-disable-line no-console
                    } else {
                        productDataMap.set(sku, responseJson);
                    }
                    resolve(responseJson);
                })
                .catch((error) => reject(error));
        }
    });
}

export function getLocalizedProductInfoAsyncObsessAPI(sku, locale, apiUrl, storeId, productDataMap = globalProductDataMap) {
    return new Promise((resolve, reject) => {
        const cachedProductData = productDataMap.get(sku);
        if (cachedProductData) {
            resolve(cachedProductData);
        } else {
            const fetchUrl = `${apiUrl}store/product/i18n?store_id=${storeId}&product_id=${encodeURIComponent(sku)}&locale=${locale}`;
            fetch(fetchUrl)
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    }
                    throw new Error(`Fetch product info failed with code ${response.status}`);
                })
                .then((responseJson) => {
                    if (productDataMap.get(sku)) {
                        console.log('Product data fetch finished before this fetch'); // eslint-disable-line no-console
                    } else {
                        productDataMap.set(sku, responseJson);
                    }
                    resolve(responseJson);
                })
                .catch((error) => reject(error));
        }
    });
}

export function getProductInfoAsyncBrandSKU(brand, sku, apiUrl, productDataMap = brandSkuDataMap) {
    return new Promise((resolve, reject) => {
        const cachedProductData = productDataMap.get(`${brand}_${sku}`);
        if (cachedProductData) {
            resolve(cachedProductData);
        } else {
            const fetchUrl = `${apiUrl}brand/product?brand=${encodeURIComponent(brand)}&sku=${encodeURIComponent(sku)}`;
            fetch(fetchUrl)
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    }
                    throw new Error(`Fetch product info failed with code ${response.status}`);
                })
                .then((responseJson) => {
                    if (productDataMap.get(`${brand}_${sku}`)) {
                        console.log('Product data fetch finished before this fetch'); // eslint-disable-line no-console
                    } else {
                        productDataMap.set(`${brand}_${sku}`, responseJson);
                    }
                    resolve(responseJson);
                })
                .catch((error) => reject(error));
        }
    });
}

export function fetchMultipleProductInfoObsessAPI(fetchUrl) {
    return new Promise((resolve, reject) => {
        fetch(fetchUrl)
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
                throw new Error(`Fetch product infos failed with code ${response.status}`);
            })
            .then((responseJson) => resolve(responseJson))
            .catch((error) => reject(error));
    });
}

export function getAllProductInfosObsessAPI(apiUrl, storeId) {
    const fetchUrl = `${apiUrl}store/products?store_id=${storeId}`;
    return fetchMultipleProductInfoObsessAPI(fetchUrl);
}

export function getSelectedProductInfosObsessAPI(skus, apiUrl, storeId) {
    const skuParams = `&product_id=${skus.join('&product_id=')}`;
    const fetchUrl = `${apiUrl}store/products?store_id=${storeId}${skuParams}`;
    return fetchMultipleProductInfoObsessAPI(fetchUrl);
}

export function getGroupProductInfosObsessAPI(groupId, apiUrl, storeId) {
    const skuParams = `&group_id=${groupId}`;
    const fetchUrl = `${apiUrl}store/products?store_id=${storeId}${skuParams}`;
    return fetchMultipleProductInfoObsessAPI(fetchUrl);
}

export function getLocalizedGroupProductInfosObsessAPI(groupId, apiUrl, storeId, locale) {
    const skuParams = `store_id=${storeId}&group_id=${groupId}&locale=${locale}`;
    const fetchUrl = `${apiUrl}store/products/i18n?${skuParams}`;
    return fetchMultipleProductInfoObsessAPI(fetchUrl);
}

export function getProductInfoWithIdAsync(id, endPointType, apiUrl = null, storeId = null) {
    switch (endPointType) {
        case ENDPOINTTYPE.OBSESSAPI:
        default:
            if (!apiUrl || !storeId) {
                throw new Error('apiUrl or storeId missing');
            }
            return getProductInfoAsyncObsessAPI(id, apiUrl, storeId);
    }
}

export function getSpinImageSrcsBySkuAsync(sku, apiUrl, storeId) {
    return new Promise((resolve, reject) => {
        getProductInfoWithIdAsync(sku, ENDPOINTTYPE.OBSESSAPI, apiUrl, storeId)
            .then((productData) => {
                const spinImageObjects = productData.spin_images;
                const spinImageSrcs = spinImageObjects.map((imageObject) => constructUrl(imageObject));
                resolve(spinImageSrcs);
            })
            .catch((error) => {
                console.error(error); // eslint-disable-line no-console
                reject(new Error('Spin image data with sku doesn`t exist! SKU:', sku));
            });
    });
}

export class ProductDataFetcher {
    constructor(apiUrl, storeId) {
        this.apiUrl = apiUrl;
        this.storeId = storeId;

        this.productDataMap = new Map();
    }

    getProductInfoAsyncObsessAPI(sku) {
        return getProductInfoWithIdAsync(sku, this.apiUrl, this.storeId, this.productDataMap);
    }

    _fetchMultipleProductInfoObsessAPI(fetchUrl) {
        return fetchMultipleProductInfoObsessAPI(fetchUrl);
    }

    getAllProductInfosObsessAPI() {
        const fetchUrl = `${this.apiUrl}store/products?store_id=${this.storeId}`;
        return this._fetchMultipleProductInfoObsessAPI(fetchUrl);
    }

    getSelectedProductInfosObsessAPI(skus) {
        const skuParams = `&product_id=${skus.join('&product_id=')}`;
        const fetchUrl = `${this.apiUrl}store/products?store_id=${this.storeId}${skuParams}`;
        return this._fetchMultipleProductInfoObsessAPI(fetchUrl);
    }

    getGroupProductInfosObsessAPI(groupId) {
        const skuParams = `&group_id=${groupId}`;
        const fetchUrl = `${this.apiUrl}store/products?store_id=${this.storeId}${skuParams}`;
        return this._fetchMultipleProductInfoObsessAPI(fetchUrl);
    }

    getProductInfoWithIdAsync(id, endPointType) {
        return getProductInfoWithIdAsync(id, endPointType, this.apiUrl, this.storeId);
    }

    getSpinImageSrcsBySkuAsync(sku) {
        return getSpinImageSrcsBySkuAsync(sku, this.apiUrl, this.storeId);
    }
}

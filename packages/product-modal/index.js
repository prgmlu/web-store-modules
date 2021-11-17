import '../css-helpers/css-helpers.css';

import {
    ProductDataFetcher,
    getProductInfoWithIdAsync,
    getProductInfoAsyncBrandSKU,
    getSpinImageSrcsBySkuAsync,
    getAllProductInfosObsessAPI,
    fetchMultipleProductInfoObsessAPI,
    getGroupProductInfosObsessAPI,
    getProductInfoAsyncObsessAPI,
    getLocalizedProductInfoAsyncObsessAPI,
    getSelectedProductInfosObsessAPI,
    getLocalizedGroupProductInfosObsessAPI,
} from './lib/data/ProductModalData';

export { default as ProductModal } from './lib/ui/ProductModal/ProductModal';

export const productData = {
    getProductInfoAsyncObsessAPI,
    getLocalizedProductInfoAsyncObsessAPI,
    getProductInfoAsyncBrandSKU,
    fetchMultipleProductInfoObsessAPI,
    getAllProductInfosObsessAPI,
    getSelectedProductInfosObsessAPI,
    getGroupProductInfosObsessAPI,
    getLocalizedGroupProductInfosObsessAPI,
    getProductInfoWithIdAsync,
    getSpinImageSrcsBySkuAsync,
};

export { default as ColorSelector } from './lib/ui/ProductModal/ColorSelector/ColorSelector';

export { ProductDataFetcher };

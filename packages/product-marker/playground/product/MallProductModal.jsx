import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isMobileDevice } from 'obsess-device-detector';
import { ProductModal, productData } from 'product-modal';
import { constructUrl } from 'url-constructor';
import { loadUIImageAsync } from 'asset-loader';
import MallProductHeader from './MallProductHeader';
import MallProductBody from './MallProductBody';
import MallProductBuy from './MallProductBuy';


const isMobile = isMobileDevice();
const betaS3 = 'obsess-cms-beta';
const reactRoot = document.getElementById('obsessvr-webstore-react-embed-root');

class MallProductModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sku: this.props.sku,
            productInfo: null,

            isLoading: true,
            thumbnailUrl: null,
            spinUrls: null,
            modalImageType: ProductModal.Image.ImageTypes.STATIC,
        };

        this.fetchRetries = 0;
        this.maxFetchRetries = 5;

        this.fetchProductInfo = this.fetchProductInfo.bind(this);
        this.constructSpinImageUrls = this.constructSpinImageUrls.bind(this);
    }

    componentDidMount() {
        const { sku, apiUrl, storeId } = this.props;
        this.fetchProductInfo(sku, apiUrl, storeId);
    }

    fetchProductInfo(sku, apiUrl, storeId) {
        // return productData.getProductInfoAsyncObsessAPI(sku, apiUrl, storeId);
        productData.getProductInfoAsyncObsessAPI(sku, apiUrl, storeId)
            .then((fetchedProductInfo) => {
                let productUrl = fetchedProductInfo.url;
                if (productUrl !== null && typeof (productUrl) === 'object') {
                    productUrl = constructUrl(productUrl, betaS3);
                }
                const productInfo = {
                    [ProductModal.ContentTypes.BRAND]: fetchedProductInfo.brand,
                    [ProductModal.ContentTypes.TITLE]: fetchedProductInfo.name,
                    [ProductModal.ContentTypes.DESCRIPTION]: fetchedProductInfo.description,
                    [ProductModal.ContentTypes.COLOR]: fetchedProductInfo.color,
                    [ProductModal.ContentTypes.PRICE]: fetchedProductInfo.price,
                    [ProductModal.ContentTypes.URL]: productUrl,
                    [ProductModal.ContentTypes.URL_NAME]: fetchedProductInfo.url_name,
                    [ProductModal.ContentTypes.GROUP]: fetchedProductInfo.group_id,
                };

                const spinObjects = fetchedProductInfo.spin_images;
                if (spinObjects && Object.values(spinObjects).some((pov) => pov)) {
                    const spinUrls = this.constructSpinImageUrls(spinObjects);

                    this.setState({
                        modalImageType: ProductModal.Image.ImageTypes.SPIN, productInfo, spinUrls, sku,
                    });

                    const firstSpinImageObject = spinImageObjects.mid[0];
                    const firstSpinImageUrl = constructUrl(firstSpinImageObject, betaS3);
                    return loadUIImageAsync(firstSpinImageUrl);
                }
                this.setState({ productInfo, modalImageType: ProductModal.Image.ImageTypes.STATIC });

                const thumbnailObject = fetchedProductInfo.thumbnail;
                const thumbnailUrl = constructUrl(thumbnailObject, betaS3);
                return loadUIImageAsync(thumbnailUrl);
            })
            .then((image) => {
                if (image) {
                    this.setState({ isLoading: false, thumbnailUrl: image.src });
                }
            })
            .catch((error) => {
                console.error('fetch product info error', error); // eslint-disable-line no-console
                if (this.fetchRetries < this.maxFetchRetries) {
                    setTimeout((() => {
                        this.fetchRetries += 1;
                        this.fetchProductInfo();
                    }), 500);
                }
            });
    }

    constructSpinImageUrls(spinObjs) {
        const result = {};

        Object.entries(spinObjs).forEach(([pov, urlObjs]) => {
            result[pov] = [];
            if (urlObjs) {
                urlObjs.forEach((urlObj) => {
                    const url = constructUrl(urlObj, betaS3);
                    loadUIImageAsync(url);
                    result[pov].push(url);
                });
            }
        });
        return result;
    }

    render() {
        const { onClose } = this.props;
        const {
            sku, productInfo, isLoading, thumbnailUrl, modalImageType, spinUrls,
        } = this.state;

        const buyUrl = productInfo ? productInfo[ProductModal.ContentTypes.URL] : null;
        const buyUrlName = productInfo ? productInfo[ProductModal.ContentTypes.URL_NAME] : null;

        const header = <MallProductHeader productInfo={productInfo} />;
        const body = <MallProductBody sku={sku} type={modalImageType} thumbnailUrl={thumbnailUrl} spinUrls={spinUrls} />;
        const buy = <MallProductBuy url={buyUrl} urlName={buyUrlName} />;

        let width; let height; let closeContainerStyle; let closeIconStyle; let backgroundColor; let
            maxHeight;
        if (isMobile) {
            width = reactRoot.offsetWidth;
            height = reactRoot.offsetHeight;
            closeContainerStyle = {
                position: 'absolute', top: '0.7em', right: '0.7em', backgroundColor: 'rgba(0, 0, 0, 0)',
            };
            closeIconStyle = { width: '2.8em', float: 'right' };
            backgroundColor = 'rgba(0, 0, 0, 0)';
            maxHeight = reactRoot.offsetHeight;
        } else {
            width = '30em';
            height = null;
            closeContainerStyle = undefined;
            closeIconStyle = undefined;
            backgroundColor = '#fff';
            maxHeight = reactRoot.offsetHeight * 0.75;
        }

        return (
            <ProductModal
                animationType="blur"
                primaryColor="black"
                backgroundColor={backgroundColor}
                onClose={onClose}
                closeContainerStyle={closeContainerStyle}
                closeIconStyle={closeIconStyle}

                header={header}
                body={body}
                buy={buy}

                isLoading={isLoading}
                padded={false}
                width={width}
                height={height}
                maxHeight={maxHeight}
            />
        );
    }
}

MallProductModal.propTypes = {
    sku: PropTypes.string,
    apiUrl: PropTypes.string,
    storeId: PropTypes.string,
    onClose: PropTypes.func,
};

export default MallProductModal;

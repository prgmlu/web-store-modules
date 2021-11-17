import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Modal, TextWithBackground } from 'web-store-ui-library';
import { isMobileDevice } from 'obsess-device-detector';
import ColorSelector from './ColorSelector/ColorSelector';
import SizeSelector from "./SizeSelector/SizeSelector";
import { ProductModalImage } from 'modal-media';
import { ContentTypes } from './ProductModalEnums';
import { constructUrl } from "../../../../url-constructor";
import { loadUIImageAsync } from "asset-loader";
import './ProductModal.css';

const isMobile = isMobileDevice();

/*
    Product Modal sizing is based on the following rules:

    1. Product Modal is always at a fixed height of props.height
    2. Buy Button Wrapper aligned at the bottom is set to a static height
    3. Remaining space in product modal is dedicated to header & body, contained in productModalContent
    4. Header takes size precedence and will make no attempts to shrink its contents vertically (hence flex-no-shrink)
    5. Body takes up what space is left after Buy & Header. The body must be sized relative to remaining space rather
       than the size of its contents, so flex-1 makes sure that the flex basis is 0, making it an absolute flex. flex-1
       also takes care of flex-growth/shrink. Because this container is sized relative to remaining modal space instead
       of its contents, images in the body can use height: 100%, width: 100%, and object-fit: contain to correctly size
       to body container
 */
class ProductModal extends Component {
    static ColorSelector = ColorSelector;
    static SizeSelector = SizeSelector;
    static Image = ProductModalImage;
    static ContentTypes = ContentTypes;

    constructor(props) {
        super(props);

        this.state = {
            hidePinchTip: !!sessionStorage.getItem('hidePinchTip')
        };

        this.hideOnPinch = this.hideOnPinch.bind(this);
    }

    static getEnumeratedProductInfo(productInfo, s3Bucket) {
        return {
            [ContentTypes.SKU]: productInfo.sku,
            [ContentTypes.BRAND]: productInfo.brand,
            [ContentTypes.TITLE]: productInfo.name,
            [ContentTypes.DESCRIPTION]: productInfo.description,
            [ContentTypes.COLOR]: productInfo.color,
            [ContentTypes.PRICE]: productInfo.price,
            [ContentTypes.SALE_PRICE]: productInfo.sale_price,
            [ContentTypes.SIZE]: productInfo.size,
            [ContentTypes.URL]: productInfo.url ? constructUrl(productInfo.url, s3Bucket) : productInfo.url,
            [ContentTypes.URL_NAME]: productInfo.url_name,
            [ContentTypes.ADD_TO_CART_URL]: productInfo.add_to_cart_url,
            [ContentTypes.THUMBNAIL]: productInfo.thumbnail,
            [ContentTypes.DOWNSIZED_THUMBNAIL]: productInfo.downsized_thumbnail,
            [ContentTypes.SPIN_IMAGES]: productInfo.spin_images,
            [ContentTypes.DOWNSIZED_SPIN_IMAGES]: productInfo.downsized_spin_images,
            [ContentTypes.GROUP]: productInfo.group_id,
            [ContentTypes.COLOR_IMAGE_FILE]: productInfo.color_image_file ? constructUrl(productInfo.color_image_file, s3Bucket) : productInfo.color_image_file,
            [ContentTypes.SOLD_OUT]: productInfo.sold_out,
            [ContentTypes.SOLD_OUT_TEXT]: productInfo.sold_out_text,
            [ContentTypes.CUSTOM_FIELD]: productInfo.custom_field
        };
    }

    componentDidMount() {
        // We use native DOM manipulation here because the react onTouchMove event listener isn't preventing defaults
        if (!this.state.hidePinchTip && this.props.isMall) {
            setTimeout(() => {
                this.setState({ hidePinchTip: true })
                // if a user doesn't pinch to zoom in within two seconds, hide pinch tooltip for rest of the session, this is to prevent spamming the user with this tooltip
                if (!sessionStorage.getItem('hidePinchTip')) {
                    sessionStorage.setItem('hidePinchTip', true)
                }
            }, 2000);
            document.addEventListener('touchmove', e => { this.hideOnPinch(e) }, { passive: false });
        }
    }

    componentWillUnmount() {
        if (this.props.isMall) {
            document.removeEventListener('touchmove', e => { this.hideOnPinch(e) }, { passive: false });
        }
    }

    // Convert sorted spinUrlObjects into spin urls in same order
    static constructSpinImageUrls(spinObjs, s3Bucket, loadImage = true) {
        const result = { low: [], mid: [], high: [] };

        Object.entries(spinObjs).forEach(([pov, urlObjs]) => {
            if (urlObjs) {
                result[pov] = urlObjs.map((urlObj) => {
                    const url = constructUrl(urlObj, s3Bucket);
                    if (loadImage) {
                        loadUIImageAsync(url);
                    }
                    return url;
                });
            }
        });
        return result;
    }

    hideOnPinch(e) {
        if (!this.state.hidePinchTip && e.touches.length === 2) {
            sessionStorage.setItem('hidePinchTip', true)
            this.setState({ hidePinchTip: true });
            e.preventDefault();
        } else if (e.touches.length > 1) {
            e.preventDefault();
        }
    }

    render() {
        const { header, body, buy, isLoading, headerStyle, bodyStyle, buyStyle, width, height, maxHeight, minHeight, isMall, ...modalProps } = this.props;

        const bodyRender = isLoading ? null : body;

        const productModalContainerStyle = { width, maxHeight, minHeight };

        if (height) {
            productModalContainerStyle.height = height;
        }

        const pinchTextProps = {
            className: 'italic',
            size: '16px',
            padding: '0.5em',
            width: '12em'
        };

        const pinchToZoomRender = isMobile && isMall && !this.state.hidePinchTip && (
            <div id='pinch-container'>
                <TextWithBackground text='PINCH TO ZOOM' {...pinchTextProps} />
            </div>
        );

        return (
            <Modal {...modalProps}>
                <div id="productModalContainer" className='flex' style={productModalContainerStyle}>
                    <div id="productModalContent" className="flex flex-1">
                        <div id="productModalHeaderWrapper" className="flex-no-shrink" style={headerStyle}>
                            {header}
                        </div>

                        <div id="productModalBodyWrapper" className="flex-center flex-1" style={bodyStyle}>
                            {bodyRender}
                        </div>
                    </div>

                    {pinchToZoomRender}

                    <div id="buyButtonWrapper" className='align-bottom flex-center flex-no-shrink' style={buyStyle}>
                        {buy}
                    </div>
                </div>
            </Modal>
        );
    }
}

ProductModal.propTypes = {
    header: PropTypes.object,
    body: PropTypes.object,
    buy: PropTypes.object,

    headerStyle: PropTypes.object,
    bodyStyle: PropTypes.object,
    buyStyle: PropTypes.object,

    isLoading: PropTypes.bool,
    width: PropTypes.string,
    height: PropTypes.string,
    maxHeight: PropTypes.string,
    minHeight: PropTypes.string,

    isMall: PropTypes.bool,

    ...Modal.modalPropTypes
};

ProductModal.defaultProps = {
    headerStyle: { padding: '1em 1em 0' },
    bodyStyle: { padding: '1em' },
    buyStyle: null,

    isLoading: false,
    width: '30em',

    isMall: false
};

export default ProductModal;

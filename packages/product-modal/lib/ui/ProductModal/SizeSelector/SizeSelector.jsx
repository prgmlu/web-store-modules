import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ProductModal from '../ProductModal';
import SizeSelectorItem from './SizeSelectorItem';
import './SizeSelector.css';


function SizeSelector(props) {
    const {
        fetchProductInfo, groupProducts, size, sku, fontStyle,
    } = props;
    const [selectorOpen, setSelectorOpen] = useState(false);

    const toggleSelector = () => setSelectorOpen(!selectorOpen);

    const fetchWithSku = (sku) => {
        fetchProductInfo(sku);
        toggleSelector();
    };

    return (
        <div id="size-selector-column" className="flex-center" style={fontStyle}>
            <SizeSelectorItem text={size} sku={sku} onClick={toggleSelector} showArrow arrowDown={!selectorOpen} />

            <div id="size-selector-items" className="flex-center">
                <SizeSelectorItem text={size} sku={sku} relative onClick={toggleSelector} showArrow arrowDown={!selectorOpen} />
                {selectorOpen && groupProducts.map((product, index) => (
                    product[ProductModal.ContentTypes.SIZE] !== size) && (
                    <SizeSelectorItem
                        key={index}
                        relative
                        onClick={() => fetchWithSku(product[ProductModal.ContentTypes.SKU])}
                        text={product[ProductModal.ContentTypes.SIZE]}
                    />
                ))}
            </div>
        </div>
    );
}

SizeSelector.propTypes = {
    groupProducts: PropTypes.array.isRequired,
    fontStyle: PropTypes.object,
    size: PropTypes.string.isRequired,
    sku: PropTypes.string.isRequired,
    fetchProductInfo: PropTypes.func.isRequired,
};

export default SizeSelector;

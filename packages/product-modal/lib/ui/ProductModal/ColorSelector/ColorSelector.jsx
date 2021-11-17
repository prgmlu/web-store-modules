import React, { useState, useEffect, createRef } from 'react';
import PropTypes from 'prop-types';
import ColorSelectorCircle from './ColorSelectorCircle.jsx';

import { ContentTypes } from '../ProductModalEnums';
import './ColorSelector.css';

let scrollInterval;

const ColorSelector = ({ fetchProductInfo, analytics, colorCircles, groupProducts, productSKU, onColorSelectorLoaded, colorFontStyle, toggleDropdown, activeColorUrl, color }) => {
    const [colorsVisible, setColorsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState();
    const [translateX, setTranslateX] = useState(0);
    const [leftArrowVisible, setLeftArrowVisible] = useState(false);
    const [rightArrowVisible, setRightArrowVisible] = useState(groupProducts.length > 4 ? true : false);
    const scrollRef = createRef();

    useEffect(() => {
        scrollToIndex()
    }, [])

    const changeActiveColor = (e, productName, color, sku, index) => {
        if (analytics) {
            analytics(productName, color, sku);
        }
        setCurrentIndex(index);
        fetchProductInfo(sku);
    }

    const handleScroll = (e) => {
        if (groupProducts.length <= 4) {
            return;
        }

        const scrollbar = scrollRef.current;
        const scrollLeft = scrollbar.scrollLeft;
        const scrollWidth = scrollbar.scrollWidth - scrollbar.clientWidth;
        const percentage = (scrollLeft / scrollWidth) * 100;

        if (percentage <= 0) {
            setLeftArrowVisible(false);
        } else if (percentage >= 90) {
            setRightArrowVisible(false);
            setLeftArrowVisible(true);
        } else {
            // Seems redundant but will prevent event handler from constantly setting arrows to visible
            if (!leftArrowVisible) {
                setLeftArrowVisible(true);
            }
            if (!rightArrowVisible) {
                setRightArrowVisible(true);
            }
        }
    }

    const scrollStart = (e, direction) => {
        const scrollbar = scrollRef.current;
        const scrollWidth = scrollbar.scrollWidth - scrollbar.clientWidth;

        const scrollStep = 5;
        const scrollTimer = 25;
        setSideScroll(true, scrollbar, direction, scrollStep, scrollWidth, scrollTimer);
    }

    const scrollEnd = (e) => {
        setSideScroll(false);
    }

    const setSideScroll = (intervalStart, ref, direction, step, width, timer) => {
        if (intervalStart) {
            scrollInterval = setInterval(() => {
                if (direction === 'right') {
                    ref.scrollLeft += step;
                } else {
                    ref.scrollLeft -= step;
                }

                if (ref.scrollLeft >= width) {
                    clearInterval(scrollInterval)
                } else if (ref.scrollLeft <= 0) {
                    clearInterval(scrollInterval)
                }

            }, timer);
        } else {
            clearInterval(scrollInterval);
        }
    }

    const scrollToIndex = () => {
        if (scrollRef) {
            const scrollbar = scrollRef.current;
            const currentIndex = groupProducts.findIndex(x => x[ContentTypes.SKU] === productSKU)
            if (currentIndex > 3) {
                const steps = currentIndex - 3;
                const scrollStep = 110 * steps;
                scrollbar.scrollLeft += scrollStep;
            }
        }
    }

    const renderColorSelector = () => {
        return (
            <React.Fragment>
                <div id='color-selector-flex-container' onLoad={onColorSelectorLoaded} style={{ display: !colorsVisible ? 'none' : 'flex', justifyContent: groupProducts.length < 4 ? 'center' : '' }} onScroll={handleScroll} ref={scrollRef}>
                    {
                        groupProducts.map((product, index) => {
                            const productName = product[ContentTypes.TITLE];
                            const src = product[ContentTypes.COLOR_IMAGE_FILE];
                            const sku = product[ContentTypes.SKU];
                            const color = product[ContentTypes.COLOR];
                            return (
                                <ColorSelectorCircle
                                    colorsVisible={colorsVisible}
                                    color={color}
                                    sku={sku}
                                    productSKU={productSKU}
                                    src={src}
                                    productName={productName}
                                    index={index}
                                    key={index}
                                    changeActiveColor={changeActiveColor}
                                    colorCircles={colorCircles}
                                    setCurrentIndex={setCurrentIndex}
                                    translateX={translateX}
                                />
                            )
                        })
                    }
                    <div
                        className='color-selector-left-arrow'
                        style={{ visibility: leftArrowVisible ? 'visible' : 'hidden' }}
                        onMouseDown={(e) => { scrollStart(e, 'left') }}
                        onMouseUp={scrollEnd}
                        onTouchStart={(e) => { scrollStart(e, 'left') }}
                        onTouchEnd={scrollEnd}
                    >
                        {'<'}
                    </div>
                    <div
                        className='color-selector-right-arrow'
                        style={{ visibility: rightArrowVisible ? 'visible' : 'hidden' }}
                        onMouseDown={(e) => { scrollStart(e, 'right') }}
                        onMouseUp={scrollEnd}
                        onTouchStart={(e) => { scrollStart(e, 'right') }}
                        onTouchEnd={scrollEnd}
                    >
                        {'>'}
                    </div>
                </div>
            </React.Fragment>
        );
    }

    const dropdownArrowClass = colorsVisible ? 'arrow arrow-up' : 'arrow arrow-down';

    const renderDropdownArrow = toggleDropdown ?
        <div>
            <img id={colorCircles ? "active-circle" : "active-square"} src={activeColorUrl} />
            <span id="dropdownArrowContainer" className="pointer">
                <i id="dropdownArrow" className={dropdownArrowClass} />
            </span>
        </div> : null;

    return (
        <React.Fragment>
            <div className="color-selector-drop-down-container">
                <div id="active-square-font" style={colorFontStyle} className="obsessvr-regularFont">
                    {color}
                    {renderDropdownArrow}
                </div>
            </div>
            {renderColorSelector()}
        </React.Fragment>
    );
}

ColorSelector.propTypes = {
    productSKU: PropTypes.string,
    color: PropTypes.string,
    colorCircles: PropTypes.bool,
    activeColorUrl: PropTypes.string,
    colorFontStyle: PropTypes.object,
    fetchProductInfo: PropTypes.func,
    groupProducts: PropTypes.array,
    toggleDropdown: PropTypes.bool,
    onColorSelectorLoaded: PropTypes.func,
    analytics: PropTypes.func
};

ColorSelector.defaultProps = {
    color: '-',
    colorCircles: false,
    toggleDropdown: false
}

export default ColorSelector;


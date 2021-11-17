import React, {useState, useEffect} from 'react';

const colorBorderStyle = {
    outline: "2px double #000000",
    border: "4px solid #ffffff",
};

const roundBorderStyle = {
    boxShadow: "0 0 0 2pt #000000",
    border: "4px solid rgba(255, 255, 255, 0)",
    borderRadius: '100%'
}

const ColorSelectorCircle = ({ colorsVisible, color, sku, src, productSKU, productName, index, changeActiveColor, colorCircles, setCurrentIndex, translateX }) => {
    useEffect(() => {
        if (sku === productSKU) {
            setCurrentIndex(index);
        }
    }, [])

    return (
        <div key={sku} className='color-selector-options' style={{visibility: colorsVisible ? 'visible' : 'hidden', transform: `translateX(${translateX}px)`}}>
            <img
                data-color={color}
                data-sku={sku}
                data-index={index}
                className="color-circle pointer flex-center"
                src={src}
                style={sku === productSKU ? colorCircles ? roundBorderStyle : colorBorderStyle : null}
    
                onClick={(e) => {
                    changeActiveColor(e, productName, color, sku, index);
                }}
            />
        </div>
    )
}

export default ColorSelectorCircle;
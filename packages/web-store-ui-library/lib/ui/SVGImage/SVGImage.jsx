import React, { Component } from 'react';
import PropType from 'prop-types';
import defaultProps from '../ComponentEnums.js';

class SVGImage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            parsedSvg: null,
        };

        fetch(props.src)
            .then((response) => response.text())
            .then((svgString) => {
                const parser = new DOMParser();
                const parsedSvg = parser.parseFromString(svgString, 'image/svg+xml');
                this.setState({ parsedSvg });
            })
            .catch((error) => console.error(error)); // eslint-disable-line no-console
    }

    render() {
        const { parsedSvg } = this.state;
        if (!parsedSvg) {
            return (<></>);
        }

        const {
            svgId, width, height, viewbox, color, className, fill, style,
        } = this.props;
        const svg = svgId ? parsedSvg.getElementById(svgId) : parsedSvg.getElementsByTagName('svg')[0];

        if (width) { svg.setAttribute('width', width); }
        if (height) { svg.setAttribute('height', height); }
        if (viewbox) { svg.setAttribute('viewbox', viewbox); }
        let iconSVGString = svg.outerHTML;
        if (color) {
            iconSVGString = iconSVGString.replace(new RegExp('fill="white"', 'g'), `fill=\"${color}\"`);
        }
        // Use dangerouslySetInnerHTML to set SVG HTML in div container
        // dangerouslySetInnerHTML works here as data is received directly from CDN with no user input creating a need for sanitization
        return (
            <div className={className} style={{ fill, ...style }} dangerouslySetInnerHTML={{ __html: iconSVGString }} />
        );
    }
}

SVGImage.propTypes = {
    src: PropType.string.isRequired,
    svgId: PropType.string,
    color: PropType.string,
    width: PropType.number,
    height: PropType.number,
    viewbox: PropType.string,
    fill: PropType.string,
    ...defaultProps,
};

export default SVGImage;

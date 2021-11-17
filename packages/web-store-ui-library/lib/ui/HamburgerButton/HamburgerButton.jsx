import React, { Component } from 'react';
import PropType from 'prop-types';

import defaultProps from '../ComponentEnums';
import './HamburgerButton.css';

class HamburgerButton extends Component {
    constructor(props) {
        super(props);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    onButtonClick() {
        const { onClick } = this.props;
        if (onClick) {
            onClick();
        }
    }

    render() {
        const { isOpen, hamburgerBarColor } = this.props;
        const style = {
            backgroundColor: hamburgerBarColor || '#333',
        };
        return (
            <div className={isOpen ? 'hamburgerButtonCross hamburgerButtonContainer' : 'hamburgerButtonContainer'} onClick={this.onButtonClick}>
                <div className="hamburgerButtonbar1" style={style} />
                <div className="hamburgerButtonbar2" style={style} />
                <div className="hamburgerButtonbar3" style={style} />
            </div>
        );
    }
}

HamburgerButton.propTypes = {
    isOpen: PropType.bool.isRequired,
    onClick: PropType.func,
    hamburgerBarColor: PropType.string,
    ...defaultProps,
};

export default HamburgerButton;

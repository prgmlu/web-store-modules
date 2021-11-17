import React, { Component } from 'react';
import PropTypes from 'prop-types';

const style = {
    position: 'absolute',
    zIndex: '2',
};

class TestUI extends Component {
    render() {
        const { p1, p2 } = this.props;
        return (
            <div style={style}>
                1
                2
                3
                4
                5
                65asdfasdfasdfsadfasd
                {p1}
                {p2}
            </div>
        );
    }
}

TestUI.propTypes = {
    p1: PropTypes.string,
    p2: PropTypes.string,
};

export default TestUI;

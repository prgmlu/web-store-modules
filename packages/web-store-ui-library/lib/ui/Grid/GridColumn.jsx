import React, { Component } from 'react';
import PropTypes from 'prop-types';

import defaultProps from '../ComponentEnums';


class GridColumn extends Component {
    render() {
        const {
            id, className, style, columns, centered, children,
        } = this.props;

        const columnStyle = { ...style, gridColumn: `span ${columns}` };
        if (centered) {
            columnStyle.display = 'flex';
            columnStyle.alignItems = 'center';
            columnStyle.justifyContent = 'center';
        }

        return (
            <div id={id || ''} className={className || ''} style={columnStyle}>
                {children}
            </div>
        );
    }
}

GridColumn.propTypes = {
    columns: PropTypes.number,
    centered: PropTypes.bool,
    ...defaultProps,
};

GridColumn.defaultProps = {
    columns: 1,
    centered: false,
};

export default GridColumn;

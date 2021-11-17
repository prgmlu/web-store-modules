import React, { Component } from 'react';
import PropTypes from 'prop-types';

import defaultProps from '../ComponentEnums';
import GridColumn from './GridColumn';


const ColumnEnums = Object.freeze({
    GRID_WIDTH: 16
});


class Grid extends Component {
    static Column = GridColumn;

    render() {
        const gridWidth = ColumnEnums.GRID_WIDTH;
        const { columns, id, className, style, hidden, backgroundColor, gridRowGap, gridColumnGap } = this.props;

        // Make sure that invalid column numbers (e.g. 80 columns) get changed into something renderable
        const mod = columns % gridWidth;
        const realColumns = mod === 0 ? gridWidth : mod;

        const gridClassName = className ? `${className} grid-container` : 'grid-container';

        const containerStyle = {
            display: hidden ? 'none' : 'grid',
            gridTemplateColumns: `repeat(${realColumns}, 1fr)`,
            gridRowGap,
            gridColumnGap
        };

        if (backgroundColor) {
            containerStyle.backgroundColor = backgroundColor;
        }

        return (
            <div id={id} className={gridClassName} style={{...style, ...containerStyle}}>
                {this.props.children}
            </div>
        )
    }
}

Grid.propTypes = {
    columns: PropTypes.number,
    hidden: PropTypes.bool,
    backgroundColor: PropTypes.string,
    gridRowGap: PropTypes.string,
    gridColumnGap: PropTypes.string,
    ...defaultProps
};

Grid.defaultProps = {
    columns: ColumnEnums.GRID_WIDTH,
    gridRowGap: '0',
    gridColumnGap: '0',
    hidden: false
};

export default Grid;
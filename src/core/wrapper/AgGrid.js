
import { forwardRef } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';
import { PAGE_SIZE } from '../constants/paging'

const AgGrid = forwardRef(({
  rowData,
  columns,
  onGridReady,
  onSelectionChanged,
  className,
  suppressRowClickSelection = true,
  ...restProps
}, ref) =>
(
  <div className={className} style={{ height: restProps.height, width: restProps.width }}>
    {
      columns &&
      <AgGridReact
        {...restProps}
        {
        ...(restProps.pagination && {
          rowModelType: 'infinite',
          paginationPageSize: PAGE_SIZE,
          cacheBlockSize: PAGE_SIZE
        })
        }
        ref={ref}
        suppressRowClickSelection={suppressRowClickSelection}
        headerHeight={50}
        tooltipShowDelay={0}
        rowData={rowData}
        onGridReady={onGridReady}
        onSelectionChanged={onSelectionChanged}
        sideBar={{
          toolPanels: [
            {
              id: 'columns',
              labelDefault: 'Columns',
              labelKey: 'columns',
              iconKey: 'columns',
              toolPanel: 'agColumnsToolPanel',
              toolPanelParams: {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivots: true,
                suppressPivotMode: true,
                suppressColumnFilter: true,
                suppressColumnSelectAll: true,
                suppressColumnExpandAll: true
              }
            }
          ]
        }}
      >
        {columns.map((column) => (
          <AgGridColumn {...column} key={`${column.field}_ag_cell`} />
        ))}
      </AgGridReact>
    }
  </div >
));

AgGrid.propTypes = {
  rowData: PropTypes.array,
  columns: PropTypes.array,
  onGridReady: PropTypes.func,
  onSelectionChanged: PropTypes.func,
  className: PropTypes.string
};

export default AgGrid;
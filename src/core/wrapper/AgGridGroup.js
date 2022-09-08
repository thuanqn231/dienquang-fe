
import { forwardRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';

const AgGridGroup = forwardRef(({
  rowData,
  columns,
  onGridReady,
  onSelectionChanged,
  className,
  frameworkComponents,
  ...restProps
}, ref) =>
(
  <div className={className} style={{ height: restProps.height, width: restProps.width }}>
    {
      columns &&
      <AgGridReact
        {...restProps}
        ref={ref}
        suppressRowClickSelection
        headerHeight={45}
        tooltipShowDelay={0}
        rowData={rowData}
        onGridReady={onGridReady}
        frameworkComponents= {frameworkComponents}
        columnDefs={columns}
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
      />
    }
  </div >
));

AgGridGroup.propTypes = {
  rowData: PropTypes.array,
  columns: PropTypes.array,
  onGridReady: PropTypes.func,
  onSelectionChanged: PropTypes.func,
  className: PropTypes.string,
  frameworkComponents: PropTypes.any
};

export default AgGridGroup;
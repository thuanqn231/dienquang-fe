import { Link as RouterLink } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
// material
import { styled } from '@material-ui/core/styles';
import { Button, Typography, Container } from '@material-ui/core';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
// components
import Page from '../../components/Page';

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------

export default function TestAGGrid() {
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef(null);

  useEffect(() => {
    fetch('https://www.ag-grid.com/example-assets/row-data.json')
      .then((result) => result.json())
      .then((rowData) => setRowData(rowData));
  }, []);

  const onButtonClick = (e) => {
    const selectedNodes = gridRef.current.api.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    const selectedDataStringPresentation = selectedData.map((node) => `${node.make} ${node.model}`).join(', ');
    alert(`Selected nodes: ${selectedDataStringPresentation}`);
  };

  return (
    <Page title="Maintenance | Điện Quang">
      <Container sx={{ textAlign: 'center' }}>
        <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
          <button onClick={onButtonClick}>Get selected rows</button>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            rowSelection="multiple"
            groupSelectsChildren
            autoGroupColumnDef={{
              headerName: 'Model',
              field: 'model',
              cellRenderer: 'agGroupCellRenderer',
              cellRendererParams: {
                checkbox: true
              }
            }}
          >
            <AgGridColumn field="make" sortable filter checkboxSelection />
            <AgGridColumn field="model" sortable filter rowGroup />
            <AgGridColumn field="price" sortable filter />
          </AgGridReact>
        </div>
      </Container>
    </Page>
  );
}

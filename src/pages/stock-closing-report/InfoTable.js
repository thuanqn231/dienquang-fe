import { Button, Card, Stack } from '@material-ui/core';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// components

import AgGrid from '../../core/wrapper/AgGrid';

import useLocales from '../../hooks/useLocales';
// hooks

import useSettings from '../../hooks/useSettings';
// redux

// utils
import { getGridConfig } from '../../utils/pageConfig';

// ----------------------------------------------------------------------

InfoTable.propTypes = {
  onCancel: PropTypes.func,

  pageCode: PropTypes.string,
  tableCode: PropTypes.string,

  currentData: PropTypes.array,
  sumData: PropTypes.string
};

export default function InfoTable({ onCancel, pageCode, tableCode, currentData, sumData }) {
  const { translate, currentLang } = useLocales();
  const { themeAgGridClass } = useSettings();

  const [rowData, setRowData] = useState(null);
  const [gridApi, setGridApi] = useState(null);

  const [columns, setColumns] = useState(null);

  const lineStockArray = [
    'grToWH-closing',
    'exceptGR-closing',
    'giToLine-closing',
    'exceptGI-closing',
    'adjustIncrease-closing',
    'adjustDecrease-closing'
  ];

  const sameTotal1 = [
    'exceptGR-closing',
    'giToLine-closing',
    'grToWH-closing',
    'exceptGI-closing',
    'adjustIncrease-closing'
  ];

  const sameTotal2 = ['adjustDecrease-closing'];

  useEffect(() => {
    const tableConfigs = getGridConfig([], pageCode, tableCode);

    const cols = tableConfigs.length - 1;
    if (lineStockArray.includes(tableCode)) {
      tableConfigs
        .filter((column) => ['pk.factoryName'].includes(column.field))
        .forEach((newColumn) => {
          newColumn.colSpan = (params) => colSpanStockDetail(params.data.pk.factoryName, cols);
        });
      tableConfigs.forEach((newColumn) => {
        const currentClass = newColumn.cellClass;
        newColumn.cellClass = (params) => formatCellClass(params.data.pk.factoryName, currentClass);
      });
    }

    setColumns(tableConfigs);
  }, [tableCode]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang, tableCode]);
  useEffect(() => {
    if (currentData && gridApi) {
      if (lineStockArray.includes(tableCode)) {
        updateData(currentData);
        gridApi.setPinnedBottomRowData(calculateFooterData(currentData, tableCode, sumData));
      }
    }
    updateData(currentData);
  }, [currentData, gridApi]);

  const updateData = (data) => {
    setRowData(data);
  };

  function colSpanStockDetail(value, num) {
    if (value === 'SUM') {
      return num;
    }
    return 1;
  }

  function formatCellClass(value, currentClass) {
    if (value === 'SUM') {
      return `${currentClass} ag-colspan-cell`;
    }
    return currentClass;
  }

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  const calculateFooterData = (data, tableCode, sum) => {
    const result = [];
    if (sameTotal1.includes(tableCode)) {
      result.push({
        pk: {
          factoryName: 'SUM'
        },
        stockQtyChange: sum,
        ...data
      });
    } else if (sameTotal2.includes(tableCode)) {
      result.push({
        pk: {
          factoryName: 'SUM'
        },
        quantity: sum,
        ...data
      });
    }
    return result;
  };

  return (
    <>
      <Card sx={{ pb: 1, height: '40vh', minHeight: { xs: '40vh' } }}>
        <AgGrid
          columns={columns}
          rowData={rowData}
          className={themeAgGridClass}
          onGridReady={onGridReady}
          rowSelection="single"
          width="100%"
          height="85%"
        />
        <Stack direction="row" justifyContent="right" display="flex" alignItems="center" sx={{ py: 1 }}>
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel} sx={{ mr: 1 }}>
            {translate(`button.close`)}
          </Button>
        </Stack>
      </Card>
    </>
  );
}

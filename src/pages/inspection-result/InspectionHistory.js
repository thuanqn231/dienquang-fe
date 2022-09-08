import { Button, Card, Stack } from '@material-ui/core';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// components
import { DialogDragable } from '../../components/animate';

import AgGrid from '../../core/wrapper/AgGrid';

import useLocales from '../../hooks/useLocales';
// hooks

import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
// redux

// utils
import { getGridConfig } from '../../utils/pageConfig';
import { fDateTime } from '../../utils/formatTime';

// ----------------------------------------------------------------------
import InspectionDownload from './InspectionDownload';
import { QcResultRenderer } from './CellRenderer';

InspectionHistory.propTypes = {
  isEdit: PropTypes.bool,
  selectedGrId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  inspectionHistoryData: PropTypes.array
};

const tableCode = 'inspectionHistory';

export default function InspectionHistory({ onCancel, pageCode, inspectionHistoryData }) {
  const { translate, currentLang } = useLocales();
  const { themeAgGridClass } = useSettings();
  const [isView, setIsView] = useState(false);
  const { userGridConfig, updateAgGridConfig, funcPermission } = useAuth();
  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, [userGridConfig]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);
  useEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);

    tableConfigs
      .filter((column) => ['inspectionTime', 'lastInspectionTime'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => fDateTime(params.value);
      });
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);
  }, [userGridConfig]);

  useEffect(() => {
    if (inspectionHistoryData) {
      updateData(
        inspectionHistoryData.map((inspection) => ({
          ...inspection,
          attachment: inspection?.attachedFiles ? 'Y' : 'N'
        }))
      );
    }
  }, [inspectionHistoryData]);

  const updateData = (data) => {
    setRowData(data);
  };

  const handleCloseDownloadPage = () => {
    setIsView(false);
  };

  const onGridReady = () => {
    onLoadProductionOrderData();
  };
  const onCellClicked = async (gridApi) => {
    if (gridApi.column.colId === 'attachment') {
      if (gridApi.data.attachedFiles) {
        setIsView(true);
        const data = {
          attachedFiles: gridApi.data.attachedFiles.map((att) => ({
            ...att,
            name: att.fileName
          })),
          attachedFilePks: gridApi.data.attachedFilePks.map((att) => ({
            ...att,
            attach: `${att.factoryCode}-${att.id}`
          }))
        };
        setCurrentData(data);
      }
    }
  };

  const onLoadProductionOrderData = async () => {
    setSelectedRowId(null);
    const response = [];
    updateData(response);
  };

  return (
    <>
      <Card sx={{ pb: 1, height: '40vh', minHeight: { xs: '40vh' } }}>
        <AgGrid
          columns={columns}
          rowData={rowData}
          className={themeAgGridClass}
          onGridReady={onGridReady}
          onCellClicked={onCellClicked}
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
      <DialogDragable title={translate(`typo.download`)} maxWidth="xl" open={isView} onClose={handleCloseDownloadPage}>
        <InspectionDownload isView={isView} currentData={currentData} onCancel={handleCloseDownloadPage} />
      </DialogDragable>
    </>
  );
}

import { Card } from '@material-ui/core';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { query } from '../../core/api';
import AgGrid from '../../core/wrapper/AgGrid';
import useAuth from '../../hooks/useAuth';
// hooks
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';
// utils
import { getGridConfig } from '../../utils/pageConfig';
import { getProductionDetail } from './helper';

// ----------------------------------------------------------------------

const pageCode = 'menu.production.productionManagement.fmb.production.overallProductionStatus';
const tableCode = 'productionStatusDetail';

DetailProduction.propTypes = {
    date: PropTypes.string,
    modelCode: PropTypes.string,
    columnId: PropTypes.string,
    factoryCode: PropTypes.string
};

export default function DetailProduction({ date, line, columnId, factoryCode }) {
    const { userGridConfig, commonDropdown: { factoryDropdownAll } } = useAuth();
    const { translate, currentLang } = useLocales();
    const { themeAgGridClass } = useSettings();
    const [rowData, setRowData] = useState(null);
    const [columns, setColumns] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);

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
        if (gridApi && gridColumnApi) {
            onLoadData();
        }
    }, [gridApi, gridColumnApi]);

    const onGridReady = (params) => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const onLoadData = async () => {
        gridColumnApi.setColumnsVisible(['actualStartTime', 'actualEndTime', 'actualQty', 'balQty', 'defectQty', 'targetQty', 'topModel.parentCode.code', 'topModel.parentCode.name'], columnId !== 'eff');
        const productionDetail = await getProductionDetail({
            from: date,
            to: date,
            aprStatus: 'D018003',
            factoryCode,
            linePks: line
        });
        const {data} = productionDetail;
        if(!isEmpty(data)) {
            data.forEach((plan) => {
                plan.spanTime = plan.planQty * plan.tactTime
            })
        }
        updateData(data);
    };

    const updateData = (data) => {
        setRowData(data);
    };

    return (
        <Card
            sx={{
                p: 1,
                borderRadius: '0px',
                display: 'flex',
                height: '80vh',
                minHeight: { xs: '80vh' }
            }}
        >
            <AgGrid
                columns={columns}
                rowData={rowData}
                className={themeAgGridClass}
                onGridReady={onGridReady}
                width='100%'
                height='100%'
            />
        </Card>
    );
}

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

// ----------------------------------------------------------------------

const pageCode = 'menu.production.productionManagement.productionResult.grGiResult.grResult';
const tableCode = 'grStockDetail';

DetailStuffing.propTypes = {
    date: PropTypes.string,
    modelCode: PropTypes.string,
    columnId: PropTypes.string
};

export default function DetailStuffing({ date, modelCode, columnId }) {
    console.log("date", date);
    console.log("modelCode", modelCode);
    console.log("columnId", columnId);
    // const { userGridConfig, commonDropdown: { factoryDropdownAll } } = useAuth();
    // const { translate, currentLang } = useLocales();
    // const { themeAgGridClass } = useSettings();
    // const [rowData, setRowData] = useState(null);
    // const [columns, setColumns] = useState(null);
    // const [gridApi, setGridApi] = useState(null);
    // const [gridColumnApi, setGridColumnApi] = useState(null);

    // useEffect(() => {
    //     const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    //     tableConfigs.forEach((column) => {
    //         column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    //     });
    //     setColumns(tableConfigs);
    // }, [userGridConfig]);

    // useEffect(() => {
    //     if (columns) {
    //         const tableConfigs = [...columns];
    //         tableConfigs.forEach((column) => {
    //             column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    //         });
    //         setColumns(tableConfigs);
    //     }
    // }, [currentLang]);

    // useEffect(() => {
    //     if (gridApi && gridColumnApi) {
    //         onLoadData();
    //     }
    // }, [gridApi, gridColumnApi]);

    // const onGridReady = (params) => {
    //     setGridApi(params.api);
    //     setGridColumnApi(params.columnApi);
    // };

    // const getFactoryPks = (factoryCode) => {
    //     const factoryPks = factoryDropdownAll.find((factory) => factory.code === factoryCode)?.value;
    //     if (factoryPks) {
    //         return factoryPks;
    //     }
    //     return '';
    // };

    // const onLoadDataGrGi = async () => {
    //     const data = [];
    //     const factoryPks = getFactoryPks(detailParams?.factoryCode);
    //     const response = await query({
    //         url: '/v1/detail-stock/search',
    //         featureCode: 'user.create',
    //         params: {
    //             pageName: action,
    //             ...detailParams,
    //             exactMaterialCode: true,
    //             factoryPks
    //         }
    //     }).catch((error) => {
    //         console.error(error);
    //     });
    //     if (!isEmpty(response?.data)) {
    //         response.data.forEach((row) => {
    //             const temp = {
    //                 ...row,
    //                 sumStockQty: row.stockQty
    //             };
    //             data.push(temp);
    //         });
    //     }
    //     return data;
    // }

    // const onLoadDataStock = async () => {
    //     const factoryPks = getFactoryPks(detailParams?.factoryCode);
    //     const response = await query({
    //         url: '/v1/stock-movement/search-adjustment',
    //         featureCode: 'user.create',
    //         params: {
    //             ...detailParams,
    //             labelDisplay: true,
    //             pageName: 'stock',
    //             exactMaterialCode: true,
    //             factoryPks
    //         }
    //     }).catch((error) => {
    //         console.error(error);
    //     });
    //     return response?.data || [];
    // }

    // const onLoadData = async () => {
    //     if (gridColumnApi) {
    //         gridColumnApi.setColumnsVisible(['operationType.name', 'stockMovementHistoryTime'], action !== 'stock');
    //     }
    //     if (gridApi) {
    //         gridApi.setPinnedBottomRowData([{
    //             row_index: 'SUM',
    //             pk: {
    //                 factoryName: 'SUM'
    //             },
    //             sumStockQty: totalStock
    //         }]);
    //     }
    //     const response = action === 'stock' ? await onLoadDataStock() : await onLoadDataGrGi();
    //     updateData(response);
    // };

    // const updateData = (data) => {
    //     setRowData(data);
    // };

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
            detail
            {/* <AgGrid
                columns={columns}
                rowData={rowData}
                className={themeAgGridClass}
                onGridReady={onGridReady}
                width='100%'
                height='100%'
            /> */}
        </Card>
    );
}

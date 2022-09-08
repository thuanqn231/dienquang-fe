import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  DialogActions,
  Grid,
  Stack,
  TextField,
  Typography,
  List,
  ListItem
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/styles';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
import AgGrid from '../../core/wrapper/AgGrid';
// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import useLocales from '../../hooks/useLocales';

// redux
import { useSelector } from '../../redux/store';
// utils
import { getGridConfig } from '../../utils/pageConfig';
import { getSafeValue } from '../../utils/formatString';
import { fDate, fDateTime } from '../../utils/formatTime';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';

// ----------------------------------------------------------------------

ProductionOrderDetail.propTypes = {
  isEdit: PropTypes.bool,

  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  onCreateGrSuccess: PropTypes.func,
  detailData: PropTypes.object
};

const useStyles = makeStyles((theme) =>
  createStyles({
    normalButton: {
      border: 'solid 2px white'
    },
    activeButton: {
      border: 'solid 2px white',
      backgroundColor: theme.palette.grey[400]
    }
  })
);

const curDateTime = fDate(new Date());

export default function ProductionOrderDetail({ pageCode, detailData }) {
  const classes = useStyles();
  const { userGridConfig, updateAgGridConfig, funcPermission, user } = useAuth();
  const { themeAgGridClass } = useSettings();

  const { commonDropdown } = useAuth();

  const [rowData, setRowData] = useState(null);
  const [columns, setColumns] = useState(null);

  const [tableCode, setTableCode] = useState('productionOrderSummary');

  const { translate, currentLang } = useLocales();

  useEffect(() => {
    const tableConfigs = getGridConfig(userGridConfig, pageCode, tableCode);
    tableConfigs
      .filter((column) => ['productionTime'].includes(column.field))
      .forEach((newColumn) => {
        newColumn.valueFormatter = (params) => fDateTime(params.value);
      });
    tableConfigs.forEach((column) => {
      column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
    });
    setColumns(tableConfigs);

    query({
      url: `/v1/productionOrder/production-detail?poNo=${detailData.prodOrderNo}&lineCode=${detailData.line?.code}&factoryCode=${values.factory}`,
      featureCode: 'user.create'
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          const { data } = res;
          if (!isEmpty(data)) {
            if (tableCode === 'productionOrderSummary') {
              setRowData(data.summary);
            }
            if (tableCode === 'productionOrderDetail') {
              setRowData(data.details);
            }
          }
        }
      })
      .catch((err) => console.error(err));
  }, [tableCode, userGridConfig]);

  useEffect(() => {
    if (columns) {
      const tableConfigs = [...columns];
      tableConfigs.forEach((column) => {
        column.headerName = translate(`data_grid.${tableCode}.${column.field}`);
      });
      setColumns(tableConfigs);
    }
  }, [currentLang]);

  const handleClick = (e) => {
    const _tableCode = e?.target?.getAttribute('id');
    setTableCode(_tableCode);
  };

  const updateData = (data) => {
    setRowData(data);
  };

  const onGridReady = () => {
    onLoadProductionOrderData();
  };

  const onLoadProductionOrderData = async () => {
    const response = [];
    updateData(response);
  };

  const ProductionOrderSchema = Yup.object().shape({
    factory: Yup.string(),
    planDate: Yup.string(),
    planId: Yup.string(),
    prodOrderNo: Yup.string(),
    modelId: Yup.string(),
    modelCode: Yup.string(),
    modelDesc: Yup.string(),
    modelName: Yup.string(),
    modelVer: Yup.string(),
    planQty: Yup.number()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: detailData?.pk.factoryCode || '',
      planDate: detailData?.planDate || fDate(curDateTime),
      planId: detailData?.planId || '',
      prodOrderNo: detailData?.prodOrderNo || '',
      modelId: detailData?.topModel?.parentCode?.materialId || '',
      modelCode: detailData?.topModel?.parentCode?.code || '',
      modelDesc: detailData?.topModel?.parentCode?.description || '',
      modelName: detailData?.topModel?.parentCode?.name || '',
      modelVer: detailData?.topModel?.bomVersionParent || '',
      planQty: detailData?.planQty || 0
    },
    validationSchema: ProductionOrderSchema
  });

  const {
    errors,
    touched,
    values,

    handleSubmit,
    getFieldProps
  } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Card sx={{ pb: 1 }}>
          <Typography variant="subtitle1" sx={{ pl: 1 }}>
            {translate(`typo.purchase_G/R_plan_detail`)}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card sx={{ px: 1, py: 1 }}>
                <Stack spacing={1.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <Dropdown
                      {...getFieldProps('factory')}
                      id="factory"
                      name="factory"
                      label="Factory"
                      size="small"
                      disabled
                      options={commonDropdown.factoryDropdown}
                      errorMessage={touched.factory && errors.factory}
                    />

                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan Date"
                      size="small"
                      disabled
                      {...getFieldProps('planDate')}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan Id"
                      size="small"
                      disabled
                      {...getFieldProps('planId')}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Prod Order No"
                      size="small"
                      disabled
                      {...getFieldProps('prodOrderNo')}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model ID"
                      size="small"
                      disabled
                      {...getFieldProps('modelId')}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Code"
                      size="small"
                      disabled
                      {...getFieldProps('modelCode')}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Desc."
                      size="small"
                      disabled
                      {...getFieldProps('modelDesc')}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Name"
                      size="small"
                      disabled
                      {...getFieldProps('modelName')}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Model Version"
                      size="small"
                      disabled
                      {...getFieldProps('modelVer')}
                    />
                    <TextField
                      autoComplete="off"
                      fullWidth
                      label="Plan Qty"
                      size="small"
                      disabled
                      {...getFieldProps('planQty')}
                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ pb: 1, height: '30vh', minHeight: { xs: '30vh' } }}>
          <Stack direction={{ xs: 'row' }}>
            <Button
              id="productionOrderSummary"
              onClick={handleClick}
              variant="contained"
              size="small"
              className={tableCode === 'productionOrderSummary' ? classes.activeButton : classes.normalButton}
            >
              Summary
            </Button>
            <Button
              id="productionOrderDetail"
              onClick={handleClick}
              variant="contained"
              size="small"
              className={tableCode === 'productionOrderDetail' ? classes.activeButton : classes.normalButton}
            >
              Detail
            </Button>
          </Stack>
          <AgGrid
            columns={columns}
            rowData={rowData}
            className={themeAgGridClass}
            onGridReady={onGridReady}
            rowSelection="single"
            width="100%"
            height="85%"
          />
        </Card>
      </Form>
    </FormikProvider>
  );
}

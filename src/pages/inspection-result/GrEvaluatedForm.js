import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import moment from 'moment';
import ReactDOMServer from 'react-dom/server';
import { isEmpty } from 'lodash';
import { useSnackbar } from 'notistack5';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
import { fDate, fDateTime } from '../../utils/formatTime';

// components
import { DialogAnimate } from '../../components/animate';
import { mutate, query } from '../../core/api';
import { Dropdown, DthDatePicker } from '../../core/wrapper';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { getSafeValue, getFactoryAndIdByPk } from '../../utils/formatString';

import ApprovalCreate from '../approval/ApprovalCreate';
import UploadMultiImage from '../../components/upload/UploadMultiImageFiles';

import { DocumentRequestTypeEnum, RequestParameterTypeEnum } from '../approval/constants';

// ----------------------------------------------------------------------

GrEvaluatedForm.propTypes = {
  selectedPicId: PropTypes.string,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func,
  pageCode: PropTypes.string,
  isOpenActionModal: PropTypes.bool,
  currentLossPicData: PropTypes.object,
  notificationGridData: PropTypes.array,
  grEvaluatedData: PropTypes.object,
  inspectionType: PropTypes.string,
  selectedInspectionResult: PropTypes.string,
  isOpenEvaluate: PropTypes.bool,
  modalEvaluation: PropTypes.string,
  currentType: PropTypes.string
};

export default function GrEvaluatedForm({
  isOpenEvaluate,
  onCancel,
  onLoadData,
  grEvaluatedData,
  modalEvaluation,
  currentType
}) {
  const { user } = useAuth();
  const { commonDropdown } = useAuth();
  const { translate, currentLang } = useLocales();
  const qcResultDropdown = commonDropdown.commonCodes
    .filter((common) => common.groupId === 'D024000')
    .map((qcResult) => ({
      value: qcResult.code,
      label: qcResult.name
    }));

  const actionResultDropdown = commonDropdown.commonCodes
    .filter((common) => common.groupId === 'D047000')
    .map((action) => ({
      value: action.code,
      label: action.name
    }));
  const [isUpdate, setIsUpdate] = useState(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openCompose, setOpenCompose] = useState(false);
  const [successEvaluatePk, setSuccessEvaluatePk] = useState(null);
  const [approvalEditor, setApprovalEditor] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [approvalFiles, setApprovalFiles] = useState([]);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [approvalRequestParameters, setApprovalRequestParameters] = useState([]);
  const [approvalAttachedIds, setApprovalAttachedIds] = useState([]);
  const [approvalAttachedPks, setApprovalAttachedPks] = useState([]);
  const [_attachedFilesPk, setAttachedFilesPk] = useState([]);
  const [_attachedFilesId, setAttachedFilesId] = useState([]);
  const [isFileAlreadyUploaded, setIsFileAlreadyUploaded] = useState(false);
  const [curNgQty, setCurNgQty] = useState(null);
  const [curQcResult, setQcResult] = useState(null);

  useEffect(() => {
    let _files = [];
    if (grEvaluatedData && isOpenEvaluate) {
      if (grEvaluatedData.attachedFiles) {
        _files = grEvaluatedData.attachedFiles;

        const attachedFilesPk = grEvaluatedData.attachedFiles.map((file) => file.factoryPk);

        const attachedFilesId = attachedFilesPk.map((file) => {
          const { factoryCode, id } = getFactoryAndIdByPk(file);
          return id;
        });

        setAttachedFilesId(attachedFilesId);

        setAttachedFilesPk(attachedFilesPk);
      }

      setAcceptedFiles(_files);
    }
  }, [grEvaluatedData, isOpenEvaluate]);

  useEffect(() => {
    const difference = acceptedFiles.filter((file) => files.every((curFile) => curFile.name !== file.name));
    setFiles([...files, ...difference]);
  }, [acceptedFiles]);

  useLayoutEffect(() => {
    if (isUpdate) {
      setIsUpdate(isUpdate);
    }
  }, [isUpdate]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleRemoveAll = () => {
    setFiles([]);
    setAcceptedFiles([]);
    setApprovalFiles([]);
    setAttachedFilesId([]);
    setAttachedFilesPk([]);
  };

  const handleRemove = (file) => {
    const filteredItems = files?.filter((_file) => _file !== file);
    setFiles(filteredItems);
    const filteredIds = _attachedFilesId.filter((_file) => _file !== file?.pk?.id);
    setAttachedFilesId(filteredIds);
    const filteredPks = _attachedFilesPk.filter((_file) => _file !== file?.factoryPk);
    setAttachedFilesPk(filteredPks);
  };

  const handleDeleteRecord = async () => {
    await mutate({
      url: `/v1/inspection/${successEvaluatePk}`,
      method: 'delete',
      featureCode: 'user.delete'
    });
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setAcceptedFiles(
        acceptedFiles
          .filter(
            (file) =>
              (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg') &&
              file.size < 1048576
          )
          .map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file)
            })
          )
      );
    },
    [setAcceptedFiles]
  );

  const onSubmitApprovalSuccess = async (approvalId) => {
    onCancel();
    onLoadData();
  };

  const MsgPopup = (msg, type) => {
    enqueueSnackbar(msg, {
      variant: type,
      action: (key) => (
        <MIconButton size="small" onClick={() => closeSnackbar(key)}>
          <Icon icon={closeFill} />
        </MIconButton>
      )
    });
  };
  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const generateEvaluationGrHtml = () =>
    ReactDOMServer.renderToStaticMarkup(
      <div>
        <p>Dear Sirs/Madams,</p>
        <p>Please refer and approve the Evaluation for GR No with details below:</p>
        <table key="bom-html-generate" style={{ borderCollapse: 'collapse', width: '100%' }} border="1">
          <thead>
            <tr style={{ backgroundColor: 'yellowgreen' }}>
              <th>{translate(`label.factory`)}</th>
              <th>{translate(`label.materialCode`)}</th>
              <th>{translate(`label.type`)}</th>
              <th>{translate(`label.orderNo`)}</th>
              <th>{translate(`label.material_description`)}</th>
              <th>{translate(`label.materialId`)}</th>
              <th>{translate(`label.planDate`)}</th>
              <th>{translate(`label.grNo`)}</th>
              <th>{translate(`label.planQty`)}</th>
              <th>{translate(`label.ngQty`)}</th>

              <th>{translate(`label.sampleQty`)}</th>
              <th>{translate(`label.qcResult`)}</th>
              <th>{translate(`label.action`)}</th>
              <th>{translate(`label.sortedQty`)}</th>
              <th>{translate(`label.remark`)}</th>
            </tr>
          </thead>
          <tbody>
            <tr key={grEvaluatedData?.goodReceiptPlan?.factoryPk}>
              <td>{grEvaluatedData?.goodReceiptPlan?.pk?.factoryName}</td>
              <td>{values?.materialCode}</td>
              <td>{values?.type}</td>
              <td>{values?.orderNo}</td>
              <td>{values?.materialDescription}</td>
              <td>{values?.materialId}</td>
              <td>{values?.planDate}</td>
              <td>{values?.grNo}</td>
              <td>{values?.planQty}</td>
              <td>{values?.ngQty}</td>
              <td>{values?.sampleQty}</td>

              <td>{qcResultDropdown.filter((qc) => qc.value === values?.qcResult)[0].label}</td>
              <td>{actionResultDropdown.filter((action) => action.value === values?.action)[0].label}</td>

              <td>{values?.sortedQty}</td>
              <td>{values?.remark}</td>
            </tr>
          </tbody>
        </table>
        <p>Thanks and Best Regards.</p>
      </div>
    );

  const onClickRaiseApproval = async (pk) => {
    setOpenCompose(true);
    const editorValue = await generateEvaluationGrHtml();

    setApprovalEditor(editorValue);
    setIsApproved(true);
    setApprovalRequestParameters([
      {
        type: RequestParameterTypeEnum.INTERNAL_ENTITY_ID,
        value: pk
      }
    ]);
  };

  const handleUploadFiles = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const accessToken = window.localStorage.getItem('accessToken');
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];
    try {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      axios.defaults.headers.common.FeatureCode = `code.create`;
      await axios({
        method: 'post',
        url: '/v1/file-storage/upload-multiple',
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        },
        data: formData
      })
        .then((res) => {
          if (res.data.httpStatusCode === 200) {
            isUploadFileSuccess = true;
            uploadFileMessage = res.statusMessage;
            attachedFileIds = res.data.data.map((file) => file.pk.id);
            attachedFilePks = res.data.data.map((file) => file.factoryPk);
          }
        })
        .catch((error) => {
          uploadFileMessage = error;
          console.error(error);
        });
    } catch (error) {
      uploadFileMessage = error;
      console.error(error);
    }
    return {
      isUploadFileSuccess,
      uploadFileMessage,
      attachedFileIds,
      attachedFilePks
    };
  };

  const handleChangeAction = (action) => {
    switch (action) {
      case 'D047001':
        setFieldValue('qcResult', 'D024001');
        break;
      case 'D047002':
        setFieldValue('qcResult', 'D024003');
        break;
      case '':
        setFieldValue('qcResult', 'D024002');
        break;
      default:
        setFieldValue('qcResult', 'D024002');
        break;
    }
  };

  const onValuateGr = async (_isUpdate) => {
    setSubmitting(true);
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];

    if (!isEmpty(files)) {
      const uploadFile = await handleUploadFiles();
      isUploadFileSuccess = uploadFile.isUploadFileSuccess;
      uploadFileMessage = uploadFile.uploadFileMessage;
      attachedFileIds = uploadFile.attachedFileIds;
      attachedFilePks = uploadFile.attachedFilePks;
    }
    const inspection = {
      goodReceiptPlan: {
        factoryPk: grEvaluatedData?.goodReceiptPlan?.factoryPk
      },
      qty: values?.planQty,
      ngQty: values?.ngQty,
      sampleQty: values?.sampleQty,
      remark: values?.remark,
      qcResult: {
        code: values?.qcResult
      },

      pic: {
        factoryPk: user.id
      },

      attachedFileIds: grEvaluatedData.attachedFiles ? [...attachedFileIds, ..._attachedFilesId] : attachedFileIds,
      attachedFilePks: grEvaluatedData.attachedFiles ? [...attachedFilePks, ..._attachedFilesPk] : attachedFilePks
    };
    if (values?.ngQty > 0) {
      inspection.action = {
        code: values?.action
      };

      if (values.action === 'D047001') {
        inspection.sortedQty = values?.sortedQty;
      }
    }

    if (_isUpdate === 'create') {
      mutate({
        url: '/v1/inspection/create',
        featureCode: 'user.create',
        data: {
          inspectionGRPlanResult: {
            inspectionType: modalEvaluation,
            ...inspection
          }
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;

            if (data?.action?.code === 'D047002' || data?.qcResult?.code === 'D024002') {
              handleCloseConfirmModal();
              onCancel();
              MsgPopup(
                `${translate(`common.grNo`)} - ${values.grNo} ${translate(`message.evaluate_success`)}`,
                'success'
              );
              onLoadData();
            } else {
              if (!isEmpty(data.attachedFileIds) && !isEmpty(data.attachedFilePks)) {
                setApprovalAttachedIds(data.attachedFileIds);
                setApprovalAttachedPks(data.attachedFilePks);

                setIsFileAlreadyUploaded(true);
              }
              setSuccessEvaluatePk(data.factoryPk);
              onClickRaiseApproval(data.factoryPk);
            }
          }
        })
        .catch((error) => {
          console.error(error);
          setErrors(error);
          handleCloseConfirmModal();
        });
    }
    if (_isUpdate === 'update') {
      mutate({
        url: '/v1/inspection/create',
        featureCode: 'user.create',
        data: {
          inspectionType: modalEvaluation,
          inspection
        }
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            const { data } = res;

            if (data?.action?.code === 'D047002' || data?.qcResult?.code === 'D024002') {
              handleCloseConfirmModal();
              onCancel();
              MsgPopup(
                `${translate(`common.grNo`)} - ${values.grNo} ${translate(`message.evaluate_success`)}`,
                'success'
              );

              onLoadData();
            } else {
              if (!isEmpty(data.attachedFileIds) && !isEmpty(data.attachedFilePks)) {
                setApprovalAttachedIds(data.attachedFileIds);
                setApprovalAttachedPks(data.attachedFilePks);
                setIsFileAlreadyUploaded(true);
              }
              setSuccessEvaluatePk(data.factoryPk);
              onClickRaiseApproval(data.factoryPk);
            }
          }
        })
        .catch((error) => {
          console.error(error);
          setErrors(error);
        });
    }
  };

  const onCheckGr = () => {
    query({
      url: '/v1/inspection/check-crud-gr',
      featureCode: 'user.create',
      params: {
        grNo: values.grNo,
        poNo: values.orderNo
      }
    })
      .then((res) => {
        if (res.httpStatusCode === 200) {
          let _isUpdate = null;
          const { data } = res;
          if (data === false) {
            _isUpdate = 'create';
            if (values.ngQty > 0 && values.action === 'D047001') {
              onValuateGr(_isUpdate);
            } else {
              setIsUpdate('create');
              handleOpenConfirmModal();
            }
          }
          if (data === true) {
            _isUpdate = 'create';
            if (values.ngQty > 0 && values.action === 'D047001') {
              onValuateGr(_isUpdate);
            } else {
              setIsUpdate('update');
              handleOpenConfirmModal();
            }
          }
        }
      })
      .catch((errors) => {
        setSubmitting(false);
        setErrors(errors);
      });
  };
  const GrEvaluatedSchema = Yup.object().shape({
    factory: Yup.string(),
    materialCode: Yup.string(),
    type: Yup.string(),
    orderNo: Yup.string(),
    materialDescription: Yup.string(),
    materialId: Yup.string(),
    grNo: Yup.string(),
    processType: Yup.string(),
    lineCode: Yup.string(),
    planDate: Yup.string(),
    planQty: Yup.number(),
    ngQty: Yup.number()

      .required('NG Quantity is required')
      .test('Is Valid ?', 'NG quantity must be equal to or greater than 0', (value) => value >= 0),
    sampleQty: Yup.number()
      .required('NG Sample is required')
      .test(
        'Is Valid ?',
        'Sample quantity must be greater than NG quantity and less than or equal to plan quantity',
        (value) => value > 0 && value >= values.ngQty && value <= values.planQty
      ),
    qcResult: Yup.string(),
    action: Yup.string().when('ngQty', (ngQty) => {
      if (ngQty > 0) {
        return Yup.string().required('Action is required');
      }
      if (ngQty === 0) {
        return Yup.string().test('Is Valid?', 'Action must be empty when NG quantity is 0', (value) => {
          let action = '';
          if (value) {
            action = value.trim();
          }

          return action === '';
        });
      }
      return Yup.string();
    }),
    sortedQty: Yup.number().when(['ngQty', 'action'], (ngQty, action) => {
      if (ngQty > 0 && action === 'D047001') {
        return Yup.number()
          .required('Sorted quantity is required')
          .test('Is Valid?', 'Sorted quantity must be less than plan quantity', (value) => value < values.planQty);
      }
      if (ngQty === 0) {
        return Yup.string().test('Is Valid?', 'Sorted quantity must be empty', (value) => {
          let sortedQty = '';
          if (value) {
            sortedQty = value.trim();
          }

          return sortedQty === '';
        });
      }

      if (action === 'D047002') {
        return Yup.string().test('Is Valid?', 'Sorted quantity must be empty', (value) => {
          let sortedQty = '';
          if (value) {
            sortedQty = value.trim();
          }

          return sortedQty === '';
        });
      }

      return Yup.string();
    }),
    remark: Yup.string().when('ngQty', (ngQty) => {
      if (ngQty > 0) {
        return Yup.string().required('Remark is required');
      }
    })
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: grEvaluatedData?.goodReceiptPlan?.pk?.factoryCode,
      materialCode: grEvaluatedData?.goodReceiptPlan?.material?.code || '',
      type: grEvaluatedData?.goodReceiptPlan?.goodReceiptPlanType || '',
      orderNo: grEvaluatedData?.goodReceiptPlan?.orderNo || '',
      materialDescription: grEvaluatedData?.goodReceiptPlan?.material?.description || '',
      materialId: grEvaluatedData?.goodReceiptPlan?.material?.materialId || '',
      grNo: grEvaluatedData?.goodReceiptPlan?.grNo || '',
      processType: grEvaluatedData?.goodReceiptPlan?.line?.processType?.code || '',
      lineCode: grEvaluatedData?.goodReceiptPlan?.line?.code || '',
      planDate: grEvaluatedData?.goodReceiptPlan?.planDate || '',
      planQty: grEvaluatedData?.goodReceiptPlan?.planQty,
      ngQty: grEvaluatedData?.ngQty || 0,
      sampleQty: grEvaluatedData?.sampleQty || 0,
      qcResult: grEvaluatedData?.qcResult?.code || 'D024002',
      action: grEvaluatedData?.action?.code || '',
      sortedQty: grEvaluatedData?.sortedQty || '',
      remark: currentType === 'update' ? grEvaluatedData?.remark : ''
    },
    validationSchema: GrEvaluatedSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        validateForm();
        onCheckGr();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const {
    errors,
    touched,
    values,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    handleChange,
    setFieldValue,
    resetForm,
    validateForm,
    setSubmitting,
    setErrors
  } = formik;

  return (
    <>
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
                        label={translate(`label.factory`)}
                        size="small"
                        options={commonDropdown.factoryDropdown}
                        disabled
                        errorMessage={touched.factory && errors.factory}
                      />
                      <TextField
                        {...getFieldProps('materialCode')}
                        error={Boolean(touched.materialCode && errors.materialCode)}
                        helperText={touched.materialCode && errors.materialCode}
                        label={translate(`label.materialCode`)}
                        variant="outlined"
                        disabled
                        fullWidth
                        size="small"
                      />
                      <TextField
                        {...getFieldProps('type')}
                        error={Boolean(touched.type && errors.type)}
                        helperText={touched.type && errors.type}
                        label={translate(`label.type`)}
                        variant="outlined"
                        fullWidth
                        disabled
                        size="small"
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label={translate(`label.orderNo`)}
                        size="small"
                        disabled
                        {...getFieldProps('orderNo')}
                        error={Boolean(touched.orderNo && errors.orderNo)}
                        helperText={touched.orderNo && errors.orderNo}
                      />
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label={translate(`label.material_description`)}
                        size="small"
                        disabled
                        {...getFieldProps('materialDescription')}
                        error={Boolean(touched.materialDescription && errors.materialDescription)}
                        helperText={touched.materialDescription && errors.materialDescription}
                      />
                      <TextField
                        autoComplete="off"
                        fullWidth
                        label={translate(`label.materialId`)}
                        size="small"
                        disabled
                        {...getFieldProps('materialId')}
                        error={Boolean(touched.materialId && errors.materialId)}
                        helperText={touched.materialId && errors.materialId}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <TextField
                        {...getFieldProps('grNo')}
                        label={translate(`label.grNo`)}
                        size="small"
                        disabled
                        fullWidth
                        errorMessage={touched.giType && errors.giType}
                      />
                      <TextField
                        {...getFieldProps('processType')}
                        label={translate(`label.processType`)}
                        size="small"
                        fullWidth
                        disabled
                        errorMessage={touched.giType && errors.giType}
                      />
                      <TextField
                        {...getFieldProps('lineCode')}
                        label={translate(`label.lineCode`)}
                        size="small"
                        fullWidth
                        disabled
                        errorMessage={touched.giType && errors.giType}
                      />
                      <TextField
                        name="planDate"
                        label={translate(`label.planDate`)}
                        size="small"
                        disabled
                        {...getFieldProps('planDate')}
                        sx={{ my: 1 }}
                        fullWidth
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <TextField
                        {...getFieldProps('planQty')}
                        label={translate(`label.planQty`)}
                        size="small"
                        fullWidth
                        errorMessage={touched.planQty && errors.planQty}
                        disabled
                      />
                      <TextField
                        label={translate(`label.ngQty`)}
                        size="small"
                        fullWidth
                        required
                        onChange={(e) => {
                          const curNgQty = e?.target?.value;
                          setCurNgQty(curNgQty);
                          setFieldValue('ngQty', curNgQty);
                        }}
                        {...getFieldProps('ngQty')}
                        error={Boolean(touched.ngQty && errors.ngQty)}
                        helperText={touched.ngQty && errors.ngQty}
                      />
                      <TextField
                        label={translate(`label.sampleQty`)}
                        autoComplete="off"
                        size="small"
                        fullWidth
                        required
                        onChange={handleChange}
                        {...getFieldProps('sampleQty')}
                        error={Boolean(touched.sampleQty && errors.sampleQty)}
                        helperText={touched.sampleQty && errors.sampleQty}
                      />
                      <Dropdown
                        label={translate(`label.qcResult`)}
                        size="small"
                        disabled
                        onChange={handleChange}
                        {...getFieldProps('qcResult')}
                        options={qcResultDropdown}
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                      <Dropdown
                        label={translate(`label.action`)}
                        size="small"
                        required
                        {...getFieldProps('action')}
                        onChange={(e) => {
                          setFieldValue('action', e?.target?.value);
                          handleChangeAction(e?.target?.value);
                        }}
                        options={actionResultDropdown}
                        errorMessage={touched.action && errors.action}
                      />
                      <TextField
                        id="sortedQty"
                        name="sortedQty"
                        label={translate(`label.sortedQty`)}
                        autoComplete="off"
                        size="small"
                        fullWidth
                        onChange={handleChange}
                        {...getFieldProps('sortedQty')}
                        error={Boolean(touched.sortedQty && errors.sortedQty)}
                        helperText={touched.sortedQty && errors.sortedQty}
                      />
                    </Stack>
                    <Stack>
                      <TextField
                        id="remark"
                        name="remark"
                        label={translate(`label.remark`)}
                        size="small"
                        fullWidth
                        {...getFieldProps('remark')}
                        onChange={handleChange}
                        error={Boolean(touched.remark && errors.remark)}
                        helperText={touched.remark && errors.remark}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <Stack sx={{ px: 1, py: 2 }} spacing={{ xs: 2, sm: 1 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography sx={{ mb: 2 }} variant="h6">
                        {translate(`typo.file_attachment`)}
                      </Typography>
                    </Stack>
                    <UploadMultiImage
                      accept=".jpeg, .jpg, .png"
                      sx={{ mb: 2 }}
                      showPreview={false}
                      files={files}
                      onDrop={handleDropMultiFile}
                      onRemove={handleRemove}
                      onRemoveAll={handleRemoveAll}
                    />
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </Card>

          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
              {translate('button.cancel')}
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loadingIndicator={translate(`loading.loading`)}
              loading={isSubmitting}
            >
              {translate(`button.evaluate`)}
            </LoadingButton>
          </DialogActions>
          <DialogAnimate
            title={translate(`typo.confirm`)}
            maxWidth="sm"
            open={isOpenConfirmModal}
            onClose={handleCloseConfirmModal}
          >
            <Typography variant="subtitle1" align="center">
              {translate(`typo.do_you_want_to_confirm`)}
            </Typography>
            <DialogActions>
              <Box sx={{ flexGrow: 1 }} />
              <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
                {translate(`button.cancel`)}
              </Button>
              <LoadingButton
                type="button"
                variant="contained"
                onClick={() => {
                  onValuateGr(isUpdate);
                }}
                loadingIndicator={translate(`loading.processing`)}
                loading={isSubmitting}
              >
                {translate(`button.confirm`)}
              </LoadingButton>
            </DialogActions>
          </DialogAnimate>
        </Form>
      </FormikProvider>
      {isApproved && (
        <ApprovalCreate
          documentRequestType={DocumentRequestTypeEnum.INSPECTION_RESULT}
          isOpenCompose={openCompose}
          onCloseCompose={() => {
            setOpenCompose(false);
            setSubmitting(false);
          }}
          requestParameters={approvalRequestParameters}
          approvalFiles={files}
          approvalAttachedIds={approvalAttachedIds}
          approvalAttachedPks={approvalAttachedPks}
          isFileAlreadyUploaded={isFileAlreadyUploaded}
          defaultTitle={`${moment().format('YYYY-MM-DD')} ${translate(`title.approval_evaluation`)} - ${values.grNo}`}
          defaultEditor={approvalEditor}
          onSubmitSuccess={onSubmitApprovalSuccess}
          handleDeleteRecord={handleDeleteRecord}
        />
      )}
    </>
  );
}

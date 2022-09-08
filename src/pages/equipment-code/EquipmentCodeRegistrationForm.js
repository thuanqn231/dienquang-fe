import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import axios from 'axios';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import UploadMultiImage from '../../components/upload/UploadMultiImageFiles';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { useSelector } from '../../redux/store';
import { isNullPk } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

EquipmentGroupRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function EquipmentGroupRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { commonDropdown } = useAuth();
  const { translate } = useLocales();
  const { commonCodes } = commonDropdown;
  const { bizPartnerCodeDropdown } = useSelector((state) => state.bizPartnerManagement);
  const [files, setFiles] = useState([]);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currFiles, setCurrFiles] = useState([])
  const [currentFactory, setCurrentFactory] = useState((isEdit && currentData?.factory) || '');

  useEffect(() => {
    let _files = [];
    if ((isEdit) && currentData?.attachedFiles) {
      _files = currentData.attachedFiles;
      setCurrFiles(_files)
    }
    setAcceptedFiles(_files);
  }, [currentData])

  useEffect(() => {
   const difference = acceptedFiles.filter(file => files.every(curFile => curFile.name !== file.name))
   setFiles([...files,...difference])
  }, [acceptedFiles])

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const onProcessSuccess = () => {
    resetForm();
    setSubmitting(false);
    onLoadData();
    setIsOpenConfirmModal(false);
    onCancel();
  }

  const onProcessError = (error) => {
    setSubmitting(false);
    setErrors(error);
  }

  const handleRegisterUser = async () => {
    formik.setSubmitting(true);
    let attachedFileIds = [];
    let attachedFilePks = [];

    const sameArray = JSON.stringify(files) === JSON.stringify(currFiles);

    if (!isEmpty(files) && !sameArray) {
      const uploadFile = await handleUploadFiles();
      attachedFileIds = uploadFile.attachedFileIds;
      attachedFilePks = uploadFile.attachedFilePks;
    }
    if (!isEdit) {
      try {
        const equipType = commonCodes.filter(
          (commonCode) => commonCode.groupId === 'D033000' && commonCode.code === values?.equipType
        );
        const equipmentGroupCode = commonDropdown.equipmentGroupDropdown
          .filter((equipmentGroup) => equipmentGroup.factory === values.factory)
          .find((equipmentGroup) => equipmentGroup.value === values?.equipGroup).code;
        const createParams = {
          code: values?.equipCode,
          name: values?.equipName,
          equipmentSpec: values?.equipSpec,
          equipmentGroup: {
            factoryPk: values?.equipGroup,
            code: equipmentGroupCode
          },
          equipmentType: {
            code: values?.equipType,
            name: equipType[0]?.name
          },
          unit: {
            factoryPk: values?.unit
          },
          state: values?.state,
          pk: {
            factoryCode: values?.factory
          },
          remark: values?.remark,
          attachedFileIds,
          attachedFilePks
        };
        if (!isNullPk(values?.vendor)) {
          createParams.vendor = {
            factoryPk: values?.vendor
          };
        }
        if (!isNullPk(values?.maker)) {
          createParams.maker = {
            factoryPk: values?.maker
          };
        }
        const response = await createUpdateData(`${BASE_URL}/create`, 'equipmentCode', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_equipment_code_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      const currId = [...files.filter(e => typeof (e.pk) !== 'undefined').map(e => e.pk.id), ...attachedFileIds]
      const currFilePk = [...files.filter(e => typeof (e.factoryPk) !== 'undefined').map(e => e.factoryPk), ...attachedFilePks]
      try {
        const updateParams = {
          code: values?.equipCode,
          factoryPk: currentData.factoryPk,
          name: values?.equipName,
          equipmentSpec: values?.equipSpec,
          equipmentGroup: {
            factoryPk: values?.equipGroup
          },
          equipmentType: {
            code: values?.equipType
          },
          unit: {
            factoryPk: values?.unit
          },
          state: values?.state,
          remark: values?.remark,
          vendor: null,
          maker: null,
          attachedFileIds: currId,
          attachedFilePks: currFilePk
        };

        if (values?.vendor) {
          updateParams.vendor = {
            factoryPk: values?.vendor
          };
        }

        if (values?.maker) {
          updateParams.maker = {
            factoryPk: values?.maker
          };
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'equipmentCode', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_equipment_code_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
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
  

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      resetForm();
      setFieldValue('factory', currentFactory);
    } else {
      setCurrentFactory(values.factory);
      setFieldValue('factory', values.factory);
    }
  };

  const handleRemove = (file) => {
    const filteredItems = files?.filter((_file) => _file !== file);
    setFiles(filteredItems);
  
  };

  const handleRemoveAll = () => {
    setFiles([]);
    setAcceptedFiles([]);
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

  const handleChangeFactory = (event) => {
    const {
      target: { value }
    } = event;
    setCurrentFactory(value);
    if (currentFactory !== '' && currentFactory !== value) {
      setChangeFactory(true);
    } else {
      setFieldValue('factory', value);
    }
  };
  
  const EquipCodeSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string().required('Use (Y/N) is required'),
    equipGroup: Yup.string().required('Equip. Group is required'),
    equipType: Yup.string().required('Equip. Type is required'),
    equipCode: Yup.string(),
    remark: Yup.string(),
    equipName: Yup.string().required('Equip. Name is required'),
    equipSpec: Yup.string().required('Equip. Spec is required'),
    unit: Yup.string().required('Unit is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      state: (isEdit && currentData?.state) || 'RUNNING',
      equipGroup: (isEdit && currentData?.equipGroup) || '',
      equipType: (isEdit && currentData?.equipType) || '',
      equipCode: (isEdit && currentData?.equipCode) || '',
      equipName: (isEdit && currentData?.equipName) || '',
      equipSpec: (isEdit && currentData?.equipSpec) || '',
      unit: (isEdit && currentData?.unit) || '',
      vendor: (isEdit && currentData?.vendor) || '',
      maker: (isEdit && currentData?.maker) || '',
      remark: (isEdit && currentData?.remark) || ''
    },
    validationSchema: EquipCodeSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, resetForm, setFieldValue, setSubmitting, setErrors } =    formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Card sx={{ px: 1, py: 2 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('factory')}
                    id="factory"
                    label="Factory"
                    required
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('equipGroup')}
                    id="equipGroup"
                    label="Equip. Group"
                    required
                    disabled={isEdit}
                    options={commonDropdown.equipmentGroupDropdown.filter(
                      (equipmentGroup) => equipmentGroup.factory === values.factory
                    )}
                    defaultValue=""
                    errorMessage={touched.equipGroup && errors.equipGroup}
                  />
                  <Dropdown
                    {...getFieldProps('equipType')}
                    id="equipType"
                    label="Equip. Type"
                    required
                    groupId="D033000"
                    defaultValue=""
                    errorMessage={touched.equipType && errors.equipType}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Equip. Code"
                    {...getFieldProps('equipCode')}
                    error={Boolean(touched.equipCode && errors.equipCode)}
                    helperText={touched.equipCode && errors.equipCode}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Equip. Name"
                    required
                    {...getFieldProps('equipName')}
                    error={Boolean(touched.equipName && errors.equipName)}
                    helperText={touched.equipName && errors.equipName}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    required
                    label="Equip. Spec"
                    {...getFieldProps('equipSpec')}
                    error={Boolean(touched.equipSpec && errors.equipSpec)}
                    helperText={touched.equipSpec && errors.equipSpec}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('unit')}
                    id="unit"
                    label="Unit"
                    required
                    options={commonDropdown.uomDropdown
                      .filter((uom) => (uom.factory = values.factory))
                      .map((uom) => ({
                        value: uom.value,
                        label: uom.label
                      }))}
                    errorMessage={touched.unit && errors.unit}
                  />
                  <Dropdown
                    {...getFieldProps('vendor')}
                    id="vendor"
                    label="Vendor"
                    options={bizPartnerCodeDropdown.filter(
                      (biz) => biz.factory === values.factory && ['D028001', 'D028002'].includes(biz.type)
                    )}
                    onChange={(e) => {
                      setFieldValue('vendor', e.target.value);
                    }}
                    errorMessage={touched.vendor && errors.vendor}
                  />
                  <Dropdown
                    {...getFieldProps('maker')}
                    id="maker"
                    label="Maker"
                    options={bizPartnerCodeDropdown.filter(
                      (biz) => biz.factory === values.factory && ['D028003'].includes(biz.type)
                    )}
                    onChange={(e) => {
                      setFieldValue('maker', e.target.value);
                    }}
                    errorMessage={touched.maker && errors.maker}
                  />
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    label="Use (Y/N)"
                    required
                    options={[
                      { value: 'RUNNING', label: 'Y' },
                      { value: 'HIDDEN', label: 'N' }
                    ]}
                    defaultValue="RUNNING"
                    errorMessage={touched.state && errors.state}
                  />
                </Stack>
                <TextField
                  autoComplete="off"
                  fullWidth
                  label="Remark"
                  {...getFieldProps('remark')}
                  error={Boolean(touched.remark && errors.remark)}
                  helperText={touched.remark && errors.remark}
                />
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
                      showPreview 
                      files={files}
                      onDrop={handleDropMultiFile}
                      onRemove={handleRemove}
                      onRemoveAll={handleRemoveAll}
                      isEdit={isEdit}
                    />
                  </Stack>
                </Card>
          </Grid>
        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing">
            {isEdit ? translate(`button.modify`) : translate(`button.register`)}
          </LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)} ?`}</Typography>
        <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton
              type="button"
              variant="contained"
              onClick={handleRegisterUser}
              loading={isSubmitting}
              loadingIndicator="Processing"
            >
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}
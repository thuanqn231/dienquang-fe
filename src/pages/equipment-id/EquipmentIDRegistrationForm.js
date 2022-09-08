import { Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import axios from 'axios';
import { Form, FormikProvider, useFormik } from 'formik';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import { Dropdown, DthMessage } from '../../core/wrapper';
import UploadMultiImage from '../../components/upload/UploadMultiImageFiles';
import { createUpdateData } from '../../core/helper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL } from './helper';

// ----------------------------------------------------------------------

EquipmentGroupRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

const checkNull = (value) => (value === 'null-null' ? '' : value);

const makeParams = (values, equipStatus) => {
  const createParams = {};
  if (values?.equipIDPlant)
    createParams.equipmentPlant = {
      factoryPk: checkNull(values?.equipIDPlant)
    };
  if (values?.equipTeam) createParams.equipmentTeam = { factoryPk: checkNull(values?.equipTeam) };
  if (values?.equipGroup)
    createParams.equipmentGroup = {
      factoryPk: checkNull(values?.equipGroup)
    };
  if (values?.equipPart)
    createParams.equipmentPart = {
      factoryPk: checkNull(values?.equipPart)
    };
  if (values?.equipLine)
    createParams.equipmentLine = {
      factoryPk: checkNull(values?.equipLine)
    };
  if (values?.equipProcess)
    createParams.equipmentProcess = {
      factoryPk: checkNull(values?.equipProcess)
    };
  if (values?.equipWS)
    createParams.equipmentWorkStation = {
      factoryPk: checkNull(values?.equipWS)
    };
  if (values?.equipSeqLine)
    createParams.equipmentSeqByLine = values?.equipSeqLine
  if (values?.equipSeqEquip)
    createParams.equipmentSeqByEquip = values?.equipSeqEquip
  if (values?.lossMngt !== '')
    createParams.lossMngt = values?.lossMngt
  if (values?.mchMngt !== '')
    createParams.mchMngt = values?.mchMngt
  if (values?.equipSerial)
    createParams.equipmentSerial = values?.equipSerial
  if (values?.equipAsset)
    createParams.equipmentAsset = values?.equipAsset
  if (values?.equipModel)
    createParams.equipmentModel = values?.equipModel
  if (values?.rfidCode)
    createParams.rfidCode = values?.rfidCode
  if (values?.equipStatus)
    createParams.equipmentStatus = {
      code: values?.equipStatus,
      name: equipStatus[0].name
    }
  if (values?.remark)
    createParams.remark = values?.remark
  return createParams;
};

export default function EquipmentGroupRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { commonDropdown } = useAuth();
  const { translate } = useLocales();
  const { commonCodes } = commonDropdown;
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [_attachedFilesId, setAttachedFilesId] = useState([]);
  const [_attachedFilesPk, setAttachedFilesPk] = useState([]);
  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currFiles, setCurrFiles] = useState([])
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');


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
    setFiles([...files, ...difference])
  }, [acceptedFiles])

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  };

  const handleRemove = (file) => {
    const filteredItems = files?.filter((_file) => _file !== file);
    setFiles(filteredItems);

  };

  const handleRemoveAll = () => {
    setFiles([]);
    setAcceptedFiles([]);
    setAttachedFilesId([]);
    setAttachedFilesPk([]);
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

  const handleRegister = async () => {
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
        const equipStatus = commonCodes.filter(
          (commonCode) => commonCode.groupId === 'D034000' && commonCode.code === values?.equipStatus
        );
        const equipCode = commonDropdown.equipmentCodeDropdown
          .filter((equipmentGroup) => equipmentGroup.factory === values.factory)
          .find((item) => item.value === values?.equipCode)?.code;
        const createParams = {
          equipmentCode: {
            factoryPk: values?.equipCode,
            code: equipCode
          },
          name: values?.equipIDName,
          equipmentSpec: values?.equipIDSpec,
          pk: {
            factoryCode: values?.factory
          },
          attachedFileIds,
          attachedFilePks,
          ...makeParams(values, equipStatus)
        };
        if (values?.equipStatus)
          createParams.equipmentStatus = {
            code: values?.equipStatus,
            name: equipStatus[0]?.name
          };
        const response = await createUpdateData(`${BASE_URL}/create-auto-generate-equipment-id`, 'equipmentID', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.register_equipment_ID_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      const currId = [...files.filter(e => typeof (e.pk) !== 'undefined').map(e => e.pk.id), ...attachedFileIds]
      const currFilePk = [...files.filter(e => typeof (e.factoryPk) !== 'undefined').map(e => e.factoryPk), ...attachedFilePks]
      try {
        const equipStatus = commonCodes.filter(
          (commonCode) => commonCode.groupId === 'D034000' && commonCode.code === values?.equipStatus
        );
        const updateParams = {
          factoryPk: currentData.factoryPk,
          equipmentCode: {
            factoryPk: values?.equipCode
          },
          name: values?.equipIDName,
          equipmentSpec: values?.equipIDSpec,
          equipmentSeqByLine: values?.equipSeqLine,
          equipmentSeqByEquip: values?.equipSeqEquip,
          lossMngt: values?.lossMngt,
          mchMngt: values?.mchMngt,
          equipmentSerial: values?.equipSerial,
          equipmentAsset: values?.equipAsset,
          rfidCode: values?.rfidCode,
          equipmentModel: values?.equipModel,
          remark: values?.remark,
          state: values?.state,
          equipmentStatus: {
            code: values?.equipStatus
          },
          attachedFileIds: currId,
          attachedFilePks: currFilePk,
          ...makeParams(values, equipStatus)
        };
        const response = await createUpdateData(`${BASE_URL}/update`, 'equipmentID', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.update_equipment_ID_successful`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
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
  }

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
  }

  const EquipmentIdSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    state: Yup.string(),
    equipCode: Yup.string().required('Equip. Code is required'),
    equipCodeName: Yup.string(),
    equipID: Yup.string(),
    equipIDName: Yup.string().required('Equip. ID name is required'),
    equipIDSpec: Yup.string().required('Equip. ID Spec is required'),
    equipIDPlant: Yup.string().required('Equip. ID Plant is required'),
    equipTeam: Yup.string().required('Equip. ID Team is required'),
    equipGroup: Yup.string().required('Equip. ID Group is required'),
    equipPart: Yup.string().required('Equip. ID Part is required'),
    equipLine: Yup.string().required('Equip. ID Line is required'),
    equipProcess: Yup.string().required('Equip. ID Process is required'),
    equipWS: Yup.string().required('Equip. ID Work Station is required'),
    equipSeqLine: Yup.string(),
    equipSeqEquip: Yup.string(),
    lossMngt: Yup.boolean(),
    mchMngt: Yup.boolean(),
    equipSerial: Yup.string(),
    equipAsset: Yup.string(),
    equipModel: Yup.string(),
    rfidCode: Yup.string(),
    equipStatus: Yup.string(),
    remark: Yup.string()
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: (isEdit && currentData?.factory) || '',
      state: (isEdit && currentData?.state) || '',
      equipCode: (isEdit && currentData?.equipCode) || '',
      equipCodeName: (isEdit && currentData?.equipCodeName) || '',
      equipID: (isEdit && currentData?.equipID) || '',
      equipIDName: (isEdit && currentData?.equipIDName) || '',
      equipIDSpec: (isEdit && currentData?.equipIDSpec) || '',
      equipIDPlant: (isEdit && currentData?.equipIDPlant) || '',
      equipGroup: (isEdit && currentData?.equipGroup) || '',
      equipTeam: (isEdit && currentData?.equipTeam) || '',
      equipPart: (isEdit && currentData?.equipPart) || '',
      equipLine: (isEdit && currentData?.equipLine) || '',
      equipProcess: (isEdit && currentData?.equipProcess) || '',
      equipWS: (isEdit && currentData?.equipWS) || '',
      equipSeqLine: (isEdit && currentData?.equipSeqLine) || '',
      equipSeqEquip: (isEdit && currentData?.equipSeqEquip) || '',
      lossMngt: isEdit ? currentData?.lossMngt : '',
      mchMngt: isEdit ? currentData?.mchMngt : '',
      equipSerial: (isEdit && currentData?.equipSerial) || '',
      equipAsset: (isEdit && currentData?.equipAsset) || '',
      equipModel: (isEdit && currentData?.equipModel) || '',
      rfidCode: (isEdit && currentData?.rfidCode) || '',
      equipStatus: (isEdit && currentData?.equipStatus) || '',
      remark: (isEdit && currentData?.remark) || ''
    },
    validationSchema: EquipmentIdSchema,
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

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps, handleChange, setFieldValue, resetForm, setSubmitting, setErrors } = formik;

  const optionEquipCode = commonDropdown.equipmentCodeDropdown
    .filter((equipmentGroup) => equipmentGroup.factory === values.factory)
    .map((item) => ({ value: item.value, label: item.code, name: item.label }));

  const equipCodeName = optionEquipCode.find((item) => item.value === values.equipCode)?.name;

  const onChangeFieldValue = (event) => {
    const listReset = ['equipIDPlant', 'equipTeam', 'equipGroup', 'equipPart', 'equipLine', 'equipProcess', 'equipWS'];
    setFieldValue(event.target.name, event.target.value);
    const start = listReset.findIndex((item) => item === event.target.name);
    if (start === -1) return;
    listReset.slice(start + 1).forEach((item) => {
      setFieldValue(item, '');
    });
  };

  const getDefaultField = (name) => ({
    name,
    onChange: onChangeFieldValue,
    value: values[name],
    errorMessage: touched[name] && errors[name]
  });

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
                    allowEmptyOption={false}
                    defaultValue=""
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('equipCode')}
                    id="equipCode"
                    label="Equip. Code"
                    required
                    disabled={isEdit}
                    allowEmptyOption={false}
                    options={commonDropdown.equipmentCodeDropdown
                      .filter((equipmentCode) => equipmentCode.factory === values.factory)
                      .map((item) => ({ value: item.value, label: item.code }))}
                    defaultValue=""
                    errorMessage={touched.equipCode && errors.equipCode}
                  />
                  <TextField
                    id="equipName"
                    label={equipCodeName ? '' : 'Equip. ID Name'}
                    fullWidth
                    disabled
                    allowEmptyOption={false}
                    defaultValue=""
                    value={equipCodeName}
                  />
                  <TextField autoComplete="off" fullWidth label="Equip. ID" disabled {...getFieldProps('equipID')} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Equip.ID Name"
                    required
                    {...getFieldProps('equipIDName')}
                    error={Boolean(touched.equipIDName && errors.equipIDName)}
                    helperText={touched.equipIDName && errors.equipIDName}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    required
                    label="Equip.ID Spec"
                    {...getFieldProps('equipIDSpec')}
                    error={Boolean(touched.equipIDSpec && errors.equipIDSpec)}
                    helperText={touched.equipIDSpec && errors.equipIDSpec}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    id="equipPlant"
                    {...getDefaultField('equipIDPlant')}
                    label="Equip. Plant"
                    required
                    allowEmptyOption={false}
                    options={commonDropdown.plantDropdown
                      .filter((item) => item.factory === values.factory)
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                    defaultValue=""
                  />
                  <Dropdown
                    {...getDefaultField('equipTeam')}
                    id="equipTeam"
                    label="Equip. Team"
                    required
                    allowEmptyOption={false}
                    options={commonDropdown.teamDropdown
                      .filter((item) => item.factory === values.factory)
                      .filter((item) => item.plant === values.equipIDPlant)
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                    defaultValue=""
                  />
                  <Dropdown
                    {...getDefaultField('equipGroup')}
                    id="equipGroup"
                    label="Equip. Group"
                    required
                    allowEmptyOption={false}
                    options={commonDropdown.groupDropdown
                      .filter((item) => item.factory === values.factory)
                      .filter((item) => item.plant === values.equipIDPlant && item.team === values.equipTeam)
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                    defaultValue=""
                  />
                  <Dropdown
                    {...getDefaultField('equipPart')}
                    id="equipPart"
                    label="Equip. Part"
                    required
                    allowEmptyOption={false}
                    options={commonDropdown.partDropdown
                      .filter((item) => item.factory === values.factory)
                      .filter(
                        (item) =>
                          item.plant === values.equipIDPlant &&
                          item.team === values.equipTeam &&
                          item.group === values.equipGroup
                      )
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                    defaultValue=""
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getDefaultField('equipLine')}
                    id="equipLine"
                    label="Equip. Line"
                    required
                    allowEmptyOption={false}
                    options={commonDropdown.lineDropdown
                      .filter((item) => item.factory === values.factory)
                      .filter(
                        (item) =>
                          item.plant === values.equipIDPlant &&
                          item.team === values.equipTeam &&
                          item.group === values.equipGroup &&
                          item.part === values.equipPart
                      )
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                    defaultValue=""
                  />
                  <Dropdown
                    {...getDefaultField('equipProcess')}
                    id="equipProcess"
                    label="Equip. Process"
                    required
                    allowEmptyOption={false}
                    defaultValue=""
                    options={commonDropdown.processDropdown
                      .filter((item) => (item.factory = values.factory))
                      .filter(
                        (item) =>
                          item.plant === values.equipIDPlant &&
                          item.team === values.equipTeam &&
                          item.group === values.equipGroup &&
                          item.part === values.equipPart &&
                          item.line === values.equipLine
                      )
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                  />
                  <Dropdown
                    {...getDefaultField('equipWS')}
                    id="equipWS"
                    label="Equip. W/S"
                    required
                    allowEmptyOption={false}
                    defaultValue=""
                    options={commonDropdown.workStationDropdown
                      .filter((item) => (item.factory = values.factory))
                      .filter(
                        (item) =>
                          item.plant === values.equipIDPlant &&
                          item.team === values.equipTeam &&
                          item.group === values.equipGroup &&
                          item.part === values.equipPart &&
                          item.line === values.equipLine &&
                          item.process === values.equipProcess
                      )
                      .map((item) => ({
                        value: item.value,
                        label: item.label
                      }))}
                  />
                  <TextField
                    {...getFieldProps('equipSeqLine')}
                    id="equipSeqLine"
                    label="Equip. Seq. by Line"
                    allowEmptyOption={false}
                    defaultValue=""
                    errorMessage={touched.equipSeqLine && errors.equipSeqLine}
                    sx={{ width: '100%' }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    {...getFieldProps('equipSeqEquip')}
                    id="equipSeqEquip"
                    label="Equip. Seq by Equip"
                    options={commonDropdown.uomDropdown
                      .filter((uom) => (uom.factory = values.factory))
                      .map((uom) => ({
                        value: uom.value,
                        label: uom.label
                      }))}
                    defaultValue=""
                    errorMessage={touched.equipSeqEquip && errors.equipSeqEquip}
                    sx={{ width: '100%' }}
                  />
                  <Dropdown
                    {...getFieldProps('lossMngt')}
                    id="lossMngt"
                    label="Loss Mngt. (Y/N)"
                    allowEmptyOption={false}
                    defaultValue=""
                    options={[
                      { value: '', label: '' },
                      { value: true, label: 'Y' },
                      { value: false, label: 'N' }
                    ]}
                    errorMessage={touched.lossMngt && errors.lossMngt}
                  />
                  <Dropdown
                    {...getFieldProps('mchMngt')}
                    id="mchMngt"
                    label="MCH Mngt. (Y/N)"
                    allowEmptyOption={false}
                    defaultValue=""
                    options={[
                      { value: '', label: '' },
                      { value: true, label: 'Y' },
                      { value: false, label: 'N' }
                    ]}
                    errorMessage={touched.mchMngt && errors.mchMngt}
                  />
                  <TextField
                    {...getFieldProps('equipSerial')}
                    id="equipSerial"
                    label="Equip. Serial"
                    allowEmptyOption={false}
                    defaultValue=""
                    fullWidth
                    errorMessage={touched.equipSerial && errors.equipSerial}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    {...getFieldProps('equipAsset')}
                    id="equipAsset"
                    label="Equip. Asset"
                    defaultValue=""
                    errorMessage={touched.equipAsset && errors.equipAsset}
                    sx={{ width: '100%' }}
                  />
                  <TextField
                    {...getFieldProps('equipModel')}
                    id="equipModel"
                    label="Equip. Model"
                    allowEmptyOption={false}
                    defaultValue=""
                    errorMessage={touched.equipModel && errors.equipModel}
                    sx={{ width: '100%' }}
                  />
                  <TextField
                    {...getFieldProps('rfidCode')}
                    id="rfidCode"
                    label="RFID Code"
                    allowEmptyOption={false}
                    defaultValue=""
                    errorMessage={touched.rfidCode && errors.rfidCode}
                    sx={{ width: '100%' }}
                  />
                  <Dropdown
                    {...getFieldProps('equipStatus')}
                    id="equipStatus"
                    label="Equip. Status"
                    allowEmptyOption={false}
                    defaultValue=""
                    groupId="D034000"
                    errorMessage={touched.equipStatus && errors.equipStatus}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('state')}
                    id="state"
                    name="state"
                    label="Use (Y/N)"
                    allowEmptyOption={false}
                    onChange={handleChange}
                    options={[
                      { value: 'RUNNING', label: 'Y' },
                      { value: 'HIDDEN', label: 'N' }
                    ]}
                    defaultValue="RUNNING"
                    errorMessage={touched.state && errors.state}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Remark"
                    {...getFieldProps('remark')}
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
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Loading...">
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
            <LoadingButton type="button" variant="contained" onClick={handleRegister} loading={isSubmitting}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider>
  );
}

import { Autocomplete, Box, Button, Card, DialogActions, Grid, Stack, TextField, Typography } from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { DialogAnimate } from '../../components/animate';
import { createUpdateData } from '../../core/helper';
import { Dropdown, DthMessage } from '../../core/wrapper';
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
import { useSelector } from '../../redux/store';
import { countryCallingCode, countryCallingCodePlaceHolder } from '../../utils/countryCallingCode';
import { getSafeValue } from '../../utils/formatString';
import ChangeFactoryWarning from '../common/ChangeFactoryWarning';
import { BASE_URL_CODE as BASE_URL } from './helper';
// ----------------------------------------------------------------------

BusinessPartnerCodeRegistrationForm.propTypes = {
  isEdit: PropTypes.bool,
  currentData: PropTypes.object,
  onCancel: PropTypes.func,
  onLoadData: PropTypes.func
};

export default function BusinessPartnerCodeRegistrationForm({ isEdit, currentData, onCancel, onLoadData }) {
  const { commonDropdown } = useAuth();
  const { commonCodes } = commonDropdown;
  const { bizPartnerGroupDropdown } = useSelector((state) => state.bizPartnerManagement);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [valuesForm, setValuesForm] = useState({});
  const [pic, setPic] = useState({
    value: "",
    label: ""
  });
  const { translate } = useLocales();

  const [isChangeFactory, setChangeFactory] = useState(false);
  const [currentFactory, setCurrentFactory] = useState(isEdit && currentData?.factory || '');

  useEffect(() => {
    const currentPic = commonDropdown.userDropdown.filter(user => user.value === currentData?.pic);
    setPic({
      value: currentPic[0]?.value || "",
      label: currentPic[0]?.label || ""
    });
  }, [currentData]);

  const handleOpenConfirmModal = () => {
    setIsOpenConfirmModal(true);
  }

  const handleCloseConfirmModal = () => {
    setIsOpenConfirmModal(false);
  }

  const handleRegister = async () => {
    setSubmitting(true);
    const phoneNumber = valuesForm?.phone ? `${valuesForm?.countryCallingCode}-${valuesForm?.phone.toString().replace(/[^\d]/g, "")}` : '';
    if (!isEdit) {
      try {
        const type = commonCodes.filter((commonCode) => commonCode.groupId === 'D028000' && commonCode.code === valuesForm?.type);
        const createParams = {
          partnerGroup: {
            factoryPk: valuesForm?.partnerGroup || null,
          },
          type: {
            code: valuesForm?.type || null,
            name: type[0]?.name || ''
          },
          englishName: valuesForm?.englishName || null,
          nationalName: valuesForm?.nationalName || null,
          tradeType: {
            code: valuesForm?.tradeType || null,
          },
          taxCode: valuesForm?.taxCode || null,
          phone: phoneNumber || null,
          fax: valuesForm?.fax || null,
          address: valuesForm?.address || null,
          taxAddress: valuesForm?.taxAddress || null,
          email: valuesForm?.email || null,
          representative: valuesForm?.representative || null,
          pic: valuesForm?.pic || null,
          state: valuesForm?.state || 'RUNNING',
          pk: {
            factoryCode: valuesForm?.factory
          }
        };
        if (valuesForm?.paymentTerm) {
          createParams.paymentTerm = {
            code: valuesForm?.paymentTerm,
          }
        }
        if (valuesForm?.incoterm) {
          createParams.incoterm = {
            code: valuesForm?.incoterm,
          }
        }
        if (valuesForm?.vat) {
          createParams.vat = {
            code: valuesForm?.vat,
          }
        }
        if (valuesForm?.currency) {
          createParams.currency = {
            code: valuesForm?.currency,
          }
        }
        const response = await createUpdateData(`${BASE_URL}/create`, 'partnerCode', createParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.business_partner_code_was_registered_successfully`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    } else {
      try {
        const updateParams = {
          partnerGroup: {
            factoryPk: valuesForm?.partnerGroup || null,
          },
          englishName: valuesForm?.englishName || null,
          nationalName: valuesForm?.nationalName || null,
          tradeType: {
            code: valuesForm?.tradeType || null,
          },
          taxCode: valuesForm?.taxCode || null,
          phone: phoneNumber,
          fax: valuesForm?.fax || null,
          address: valuesForm?.address || null,
          taxAddress: valuesForm?.taxAddress || null,
          email: valuesForm?.email || null,
          representative: valuesForm?.representative || null,
          pic: valuesForm?.pic || null,
          state: valuesForm?.state || 'RUNNING',
          factoryPk: currentData.factoryPk
        };
        if (valuesForm?.paymentTerm) {
          updateParams.paymentTerm = {
            code: valuesForm?.paymentTerm,
          }
        }
        if (valuesForm?.incoterm) {
          updateParams.incoterm = {
            code: valuesForm?.incoterm,
          }
        }
        if (valuesForm?.vat) {
          updateParams.vat = {
            code: valuesForm?.vat,
          }
        }
        if (valuesForm?.currency) {
          updateParams.currency = {
            code: valuesForm?.currency,
          }
        }
        const response = await createUpdateData(`${BASE_URL}/update`, 'partnerCode', updateParams);
        if (response.httpStatusCode === 200) {
          onProcessSuccess();
          DthMessage({ variant: 'success', message: translate(`message.business_partner_code_was_modified_successfully`) });
        }
      } catch (error) {
        onProcessError(error);
      }
    }
  }

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

  const BizGroupSchema = Yup.object().shape({
    factory: Yup.string().required('Factory is required'),
    partnerGroup: Yup.string().required('Biz. Group is required'),
    type: Yup.string().required('Biz. Type is required'),
    code: Yup.string(),
    englishName: Yup.string().required('Engligh Name is required'),
    nationalName: Yup.string().required('National Name is required'),
    tradeType: Yup.string().required('Trade Type is required'),
    paymentTerm: Yup.string(),
    incoterm: Yup.string(),
    vat: Yup.string(),
    taxCode: Yup.string(),
    currency: Yup.string(),
    phone: Yup.string().required('Phone Number is required').min(9, 'Phone Number must be at least 10 characters.').max(11, 'Phone numbers are only allowed up to 12 characters'),
    fax: Yup.string(),
    address: Yup.string().required('Address is required'),
    taxAddress: Yup.string(),
    email: Yup.string().email('Invalid email address'),
    representative: Yup.string(),
    pic: Yup.string(),
    state: Yup.string()
  });

  const parseCountryCallingCode = (phoneNumber) => phoneNumber && phoneNumber.slice(0, phoneNumber.indexOf("-"));

  const parsePhoneNumber = (phoneNumber) => phoneNumber && phoneNumber.slice(phoneNumber.indexOf("-") + 1, phoneNumber.length);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      factory: isEdit && currentData?.factory || '',
      partnerGroup: isEdit && currentData?.partnerGroup || '',
      type: isEdit && currentData?.type || '',
      code: isEdit && currentData?.code || '',
      englishName: isEdit && currentData?.englishName || '',
      nationalName: isEdit && currentData?.nationalName || '',
      tradeType: isEdit && currentData?.tradeType || '',
      paymentTerm: isEdit && currentData?.paymentTerm || '',
      incoterm: isEdit && currentData?.incoterm || '',
      vat: isEdit && currentData?.vat || '',
      taxCode: isEdit && currentData?.taxCode || '',
      currency: isEdit && currentData?.currency || '',
      fax: isEdit && currentData?.fax || '',
      address: isEdit && currentData?.address || '',
      taxAddress: isEdit && currentData?.taxAddress || '',
      email: isEdit && currentData?.email || '',
      representative: isEdit && currentData?.representative || '',
      pic: isEdit && currentData?.pic || '',
      state: isEdit && currentData?.state || 'RUNNING',
      phone: isEdit && parsePhoneNumber(currentData?.phone) || '',
      countryCallingCode: isEdit && parseCountryCallingCode(currentData?.phone) || '+84',
    },
    validationSchema: BizGroupSchema,
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setValuesForm(values);
        handleOpenConfirmModal();
      } catch (error) {
        console.error(error);
        onProcessError(error);
      }
    }
  });

  const onChangeFactory = (isChange) => {
    setChangeFactory(false);
    if (isChange) {
      setPic({
        value: "",
        label: ""
      });
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

  const { errors, touched, values, isSubmitting, setFieldValue, handleSubmit, getFieldProps, handleChange, resetForm, setSubmitting, setErrors } = formik;

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
                    name="factory"
                    label='Factory'
                    required
                    disabled={isEdit}
                    onChange={handleChangeFactory}
                    options={commonDropdown.factoryDropdown}
                    errorMessage={touched.factory && errors.factory}
                  />
                  <Dropdown
                    {...getFieldProps('partnerGroup')}
                    id="partnerGroup"
                    name="partnerGroup"
                    label='Biz. Group'
                    required
                    disabled={isEdit}
                    onChange={handleChange}
                    options={bizPartnerGroupDropdown.filter((bizGroup) => bizGroup.factory === values.factory)}
                    errorMessage={touched.partnerGroup && errors.partnerGroup}
                  />
                  <Dropdown
                    {...getFieldProps('type')}
                    id="type"
                    name="type"
                    label='Biz. Type'
                    required
                    disabled={isEdit}
                    onChange={handleChange}
                    groupId='D028000'
                    errorMessage={touched.type && errors.type}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label={isEdit ? "Biz. Partner Code" : "Code is auto generated"}
                    disabled
                    {...getFieldProps('code')}
                    error={Boolean(touched.code && errors.code)}
                    helperText={touched.code && errors.code}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="English Name"
                    required
                    {...getFieldProps('englishName')}
                    error={Boolean(touched.englishName && errors.englishName)}
                    helperText={touched.englishName && errors.englishName}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="National Name"
                    required
                    {...getFieldProps('nationalName')}
                    error={Boolean(touched.nationalName && errors.nationalName)}
                    helperText={touched.nationalName && errors.nationalName}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <Dropdown
                    {...getFieldProps('tradeType')}
                    id="tradeType"
                    name="tradeType"
                    label='Trade Type'
                    required
                    onChange={handleChange}
                    groupId='D029000'
                    errorMessage={touched.tradeType && errors.tradeType}
                  />
                  <Dropdown
                    {...getFieldProps('paymentTerm')}
                    id="paymentTerm"
                    name="paymentTerm"
                    label='Payment Term'
                    onChange={handleChange}
                    groupId='D030000'
                    errorMessage={touched.paymentTerm && errors.paymentTerm}
                  />
                  <Dropdown
                    {...getFieldProps('incoterm')}
                    id="incoterm"
                    name="incoterm"
                    label='Incoterm'
                    onChange={handleChange}
                    groupId='D031000'
                    errorMessage={touched.incoterm && errors.incoterm}
                  />
                  <Dropdown
                    {...getFieldProps('vat')}
                    id="vat"
                    name="vat"
                    label='VAT'
                    onChange={handleChange}
                    groupId='D032000'
                    errorMessage={touched.vat && errors.vat}
                  />
                  <Dropdown
                    {...getFieldProps('currency')}
                    id="currency"
                    name="currency"
                    label='Currency'
                    onChange={handleChange}
                    groupId='D041000'
                    errorMessage={touched.currency && errors.currency}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Tax Code"
                    {...getFieldProps('taxCode')}
                    error={Boolean(touched.taxCode && errors.taxCode)}
                    helperText={touched.taxCode && errors.taxCode}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Fax No."
                    type='number'
                    {...getFieldProps('fax')}
                    error={Boolean(touched.fax && errors.fax)}
                    helperText={touched.fax && errors.fax}
                  />
                  <Grid item xs={4} md={4}>
                    <Dropdown
                      {...getFieldProps('countryCallingCode')}
                      id="countryCallingCode"
                      name="countryCallingCode"
                      label='Country Code'
                      allowEmptyOption={false}
                      onChange={handleChange}
                      options={countryCallingCode}
                    />
                  </Grid>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label={`Phone Number (${countryCallingCodePlaceHolder[values.countryCallingCode] || '0901234567'})`}
                    type='number'
                    {...getFieldProps('phone')}
                    error={Boolean(touched.phone && errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Address"
                    required
                    {...getFieldProps('address')}
                    error={Boolean(touched.address && errors.address)}
                    helperText={touched.address && errors.address}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Tax Address"
                    {...getFieldProps('taxAddress')}
                    error={Boolean(touched.taxAddress && errors.taxAddress)}
                    helperText={touched.taxAddress && errors.taxAddress}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Email"
                    type='email'
                    {...getFieldProps('email')}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <Autocomplete
                    id="pic"
                    className="pic-select"
                    name="pic"
                    fullWidth
                    options={commonDropdown.userDropdown}
                    getOptionLabel={option => option.label}
                    value={pic}
                    isOptionEqualToValue={(option, value) => option.value === value?.value}
                    onChange={(e, value) => {
                      setPic(value);
                      setFieldValue("pic", getSafeValue(value?.value));
                    }}
                    renderInput={params => (
                      <TextField
                        {...params}
                        error={Boolean(touched.pic && errors.pic)}
                        helperText={touched.pic && errors.pic}
                        name="pic"
                        label="PIC"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                  />
                  <TextField
                    autoComplete="off"
                    fullWidth
                    label="Representative"
                    {...getFieldProps('representative')}
                    error={Boolean(touched.representative && errors.representative)}
                    helperText={touched.representative && errors.representative}
                  />
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
                </Stack>
              </Stack>
            </Card>
          </Grid>

        </Grid>
        <DialogActions>
          <Box sx={{ flexGrow: 1 }} />
          <Button type="button" variant="outlined" color="inherit" onClick={onCancel}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting} loadingIndicator="Processing...">{isEdit ? 'Modify' : 'Register'}</LoadingButton>
        </DialogActions>
        <DialogAnimate title={translate(`typo.confirm`)} maxWidth="sm" open={isOpenConfirmModal} onClose={handleCloseConfirmModal}>
          <Typography variant="subtitle1" align="center">{`Do you want to ${isEdit ? translate(`typo.modify`) : translate(`typo.register`)
            }?`}</Typography>
          <DialogActions>
            <Box sx={{ flexGrow: 1 }} />
            <Button type="button" variant="outlined" color="inherit" onClick={handleCloseConfirmModal}>
              {translate(`button.cancel`)}
            </Button>
            <LoadingButton type="button" variant="contained" loading={isSubmitting} loadingIndicator="Processing..." onClick={handleRegister}>
              {isEdit ? translate(`button.modify`) : translate(`button.register`)}
            </LoadingButton>
          </DialogActions>
        </DialogAnimate>
        <ChangeFactoryWarning isOpen={isChangeFactory} onChangeFactory={onChangeFactory} />
      </Form>
    </FormikProvider >
  );
}

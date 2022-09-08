import closeFill from '@iconify/icons-eva/close-fill';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
// material
import {
    Alert, IconButton,
    InputAdornment, Stack, TextField
} from '@material-ui/core';
import { LoadingButton } from '@material-ui/lab';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { MIconButton } from '../../components/@material-extend';
//
import { mutate } from '../../core/api';
import useIsMountedRef from '../../hooks/useIsMountedRef';
import useLocales from '../../hooks/useLocales';
// routes
// redux
import { getApprovals, getIncomeApprovals, selectApproval, closeApprovalDetailModal } from '../../redux/slices/approval';
import { useDispatch, useSelector } from '../../redux/store';
import { getFactoryAndIdByPk } from '../../utils/formatString';
import { encryptPassword } from '../../utils/encrypt';

// ----------------------------------------------------------------------

ApprovalActionForm.propTypes = {
    action: PropTypes.string,
    onClose: PropTypes.func
};

const actionPast = {
    'Approve': 'Approved',
    'Consent': 'Consented',
    'Reject': 'Rejected',
    'Recall': 'Recalled'
}

export default function ApprovalActionForm({ action, onClose }) {
    const isMountedRef = useIsMountedRef();
    const navigate = useNavigate();
    const { approvalId } = useParams();
    const dispatch = useDispatch();
    const { translate } = useLocales();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState(null);
    const { selectedApprovalId, approvals, selectedSidebarItem, sidebarMapParams, searchKeyword, approval } = useSelector((state) => state.approval);

    useEffect(() => {
        const _selectedApproval = approvalId || selectedApprovalId || null;
        setSelectedApproval(_selectedApproval);
    }, [approvalId, selectedApproval]);

    const CommonSchema = Yup.object().shape({
        password: Yup.string().required('Password is required')
    });
    const CommentRequiredSchema = Yup.object().shape({
        comment: Yup.string().required(`Comments is required for ${action}`)
    });
    const CommentSchema = Yup.object().shape({
        comment: Yup.string()
    });
    const ApprovalActionSchema = ['Approve', 'Consent'].indexOf(action) !== -1 ? CommonSchema.concat(CommentSchema) : CommonSchema.concat(CommentRequiredSchema);

    const handleGetApprovals = () => {
        const approvalParams = sidebarMapParams[selectedSidebarItem];
        if (searchKeyword) {
            approvalParams.searchKeyword = searchKeyword;
        }
        if (['submission', 'postponed'].indexOf(selectedSidebarItem) !== -1) {
            dispatch(getApprovals(approvalParams));
        } else {
            dispatch(getIncomeApprovals(approvalParams));
        }
    }

    const onActionDone = () => {
        dispatch(closeApprovalDetailModal());
        navigate('/pages/SM02010102');
        onClose();
        dispatch(selectApproval(null));
        handleGetApprovals();
        callEnqueueSnackbar();
    }

    const approveApprovals = async (params) => {
        await mutate({
            url: '/document-request/approve-request',
            data: params,
            method: 'post',
            featureCode: 'code.create'
        })
            .then(() => {
                onActionDone();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const rejectApprovals = async (params) => {
        await mutate({
            url: '/document-request/reject-request',
            data: params,
            method: 'post',
            featureCode: 'code.create'
        })
            .then(() => {
                onActionDone();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const recallApprovals = async (params) => {
        await mutate({
            url: '/document-request/recall-request',
            data: params,
            method: 'post',
            featureCode: 'code.create'
        })
            .then(() => {
                onActionDone();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const callEnqueueSnackbar = () => {
        enqueueSnackbar(`${actionPast[action]} successfully`, {
            variant: 'success',
            action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                </MIconButton>
            )
        });
    }

    const formik = useFormik({
        initialValues: {
            password: '',
            comment: ''
        },
        validationSchema: ApprovalActionSchema,
        onSubmit: async (values, { setErrors, setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
                let isValidPassword = false;
                await mutate({
                    url: '/authentication/confirm-password',
                    data: {
                        password: encryptPassword(values.password)
                    },
                    method: 'post',
                    featureCode: 'code.create',
                    isShowMessage: false
                }).then((res) => {
                    isValidPassword = true;
                }).catch((error) => {
                    console.error(error);
                    enqueueSnackbar('The password entered is wrong', {
                        variant: 'error',
                        action: (key) => (
                            <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                                <Icon icon={closeFill} />
                            </MIconButton>
                        )
                    });
                });
                if (isValidPassword) {
                    const { factoryCode, id } = getFactoryAndIdByPk(selectedApproval);
                    switch (action) {
                        case 'Approve':
                        case 'Consent':
                            await approveApprovals({
                                documentPk: {
                                    factoryCode,
                                    id
                                },
                                documentId: selectedApproval,
                                remark: values.comment,
                                state: action === 'Approve' ? 'APPROVED' : 'CONSENT'
                            });
                            break;
                        case 'Reject':
                            await rejectApprovals({
                                documentPk: {
                                    factoryCode,
                                    id
                                },
                                remark: values.comment
                            });
                            break;
                        case 'Recall':
                            await recallApprovals({
                                documentPk: {
                                    factoryCode,
                                    id
                                },
                                remark: values.comment
                            });
                            break;

                        default:
                            break;
                    }
                }
                if (isMountedRef.current) {
                    setSubmitting(false);
                }
            } catch (error) {
                resetForm();
                if (isMountedRef.current) {
                    setSubmitting(false);
                    setErrors({ afterSubmit: error.message });
                }
            }
        }
    });

    const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

    const handleShowPassword = () => {
        setShowPassword((show) => !show);
    };

    return (
        <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    {errors.afterSubmit && <Alert severity="error">{errors.afterSubmit}</Alert>}
                    <TextField
                        fullWidth
                        type="text"
                        label='Title'
                        variant='standard'
                        inputProps={
                            { readOnly: true, }
                        }
                        defaultValue={approval.title}
                        sx={{ color: 'primary.main' }}
                    />

                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        {...getFieldProps('password')}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleShowPassword} edge="end">
                                        <Icon icon={showPassword ? eyeFill : eyeOffFill} />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                    />

                    <TextField
                        rows={4}
                        fullWidth
                        multiline
                        label="Comments"
                        {...getFieldProps('comment')}
                        error={Boolean(touched.comment && errors.comment)}
                        helperText={touched.comment && errors.comment} />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="end" sx={{ my: 2 }}>
                    <LoadingButton sx={{ mr: 1 }} size="large" type="submit" variant="contained" loading={isSubmitting}>
                        {action}
                    </LoadingButton>
                    <LoadingButton sx={{ ml: 1 }} size="large" type="button" variant="outlined" onClick={onClose}>
                        {translate(`button.cancel`)}
                    </LoadingButton>
                </Stack>

            </Form>
        </FormikProvider>
    );
}

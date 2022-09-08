import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';
import {
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Portal,
  Slide,
  TextField,
  Typography
} from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import { Editor } from '@tinymce/tinymce-react';
import { LoadingButton } from '@material-ui/lab';
// material
import axios from 'axios';
import { isEmpty, isUndefined, size } from 'lodash';
import { useSnackbar } from 'notistack5';
import PropTypes from 'prop-types';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { getFactoryAndIdByPk, getSafeValue } from '../../utils/formatString';
import { MIconButton } from '../../components/@material-extend';
import Scrollbar from '../../components/Scrollbar';
// components
import { UploadMultiFile } from '../../components/upload';
import { mutate } from '../../core/api';
import { getApprovals } from '../../redux/slices/approval';
// redux
import { useDispatch } from '../../redux/store';
// hooks
import useAuth from '../../hooks/useAuth';
import useLocales from '../../hooks/useLocales';
// internal components
import ApprovalPathCreate from './ApprovalPathCreate';
import SearchApprover from './SearchApprover';
import ApprovalPriority from './ApprovalPriority';
import { DocumentRequestTypeEnum } from './constants';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 1999,
  minHeight: 440,
  outline: 'none',
  display: 'flex',
  position: 'fixed',
  overflow: 'hidden',
  flexDirection: 'column',
  margin: theme.spacing(3),
  boxShadow: theme.customShadows.z20,
  backgroundColor: theme.palette.background.paper
}));

const InputStyle = styled(TextField)(({ theme }) => ({
  borderBottom: `solid 1px ${theme.palette.divider}`
}));

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);
// ----------------------------------------------------------------------

ApprovalCreate.propTypes = {
  documentRequestType: PropTypes.string,
  requestParameters: PropTypes.array,
  isOpenCompose: PropTypes.bool,
  onCloseCompose: PropTypes.func,
  defaultEditor: PropTypes.string,
  defaultTitle: PropTypes.string,
  onSubmitSuccess: PropTypes.func,
  handleDeleteRecord: PropTypes.func,
  approvalFiles: PropTypes.array,
  approvalAttachedIds: PropTypes.array,
  approvalAttachedPks: PropTypes.array,
  isFileAlreadyUploaded: PropTypes.bool
};

const emptyArray = [];

export default function ApprovalCreate({
  documentRequestType = DocumentRequestTypeEnum.NORMAL_REQUEST,
  requestParameters = emptyArray,
  approvalFiles,
  approvalAttachedIds,
  approvalAttachedPks,
  isFileAlreadyUploaded = false,
  isOpenCompose,
  onCloseCompose,
  defaultEditor,
  defaultTitle = '',
  onSubmitSuccess,
  handleDeleteRecord
}) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const initEditorValue = '';
  const initApprovalPath = {
    approvers: {
      [`${getSafeValue(user?.id)}`]: {
        userId: getSafeValue(user?.id),
        content: `${user?.displayName} (${user?.email})/${user?.department?.name}`,
        type: 'DRAFT',
        isParallel: false,
        rank: 0
      }
    },
    columns: {
      'approval-path': {
        id: 'approval-path',
        title: 'Approval Path',
        approverIds: [`${getSafeValue(user?.id)}`]
      }
    },
    // Facilitate reordering of the columns
    columnOrder: ['approval-path']
  };
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [submitMessage, setSubmitMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [approvalTitle, setApprovalTitle] = useState(defaultTitle);
  const [approvalPath, setApprovalPath] = useState(initApprovalPath);
  const [files, setFiles] = useState([]);
  const [acptedFiles, setAcceptedFiles] = useState([]);
  const [isDownload, setIsDownLoad] = useState(false);
  const [isView, setIsView] = useState(false);
  const [priority, setPriority] = useState('D054003');

  const editorRef = useRef(null);
  const { translate } = useLocales();
  const [_requestParameters, setRequestParameters] = useState(requestParameters);

  useEffect(() => {
    setApprovalTitle(defaultTitle);
  }, [defaultTitle, defaultEditor]);

  useEffect(() => {
    if (approvalFiles) {
      setAcceptedFiles(approvalFiles);
      setIsDownLoad(true);
      setIsView(true);
    }
  }, [approvalFiles]);

  useEffect(() => {
    setRequestParameters(requestParameters);
  }, [requestParameters]);

  const handleTouch = () => {
    setTouched(true);
  };

  const handleOpenDialog = () => {
    if (!approvalTitle) {
      handleTouch();
      return;
    }
    let allowSubmit = false;
    if (!isUndefined(approvalPath.columns['approval-path'].approverIds) && !isEmpty(approvalPath.approvers)) {
      approvalPath.columns['approval-path'].approverIds.slice(1).forEach((userId) => {
        const { type } = approvalPath.approvers[userId];
        if (['APPROVER', 'CONSENT'].includes(type)) {
          allowSubmit = true;
        }
      });
    }
    if (size(approvalPath.approvers) <= 1 || !allowSubmit) {
      enqueueSnackbar('Please set at least 1 approver', {
        variant: 'warning',
        action: (key) => (
          <MIconButton size="small" onClick={() => closeSnackbar(key)}>
            <Icon icon={closeFill} />
          </MIconButton>
        )
      });
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    if (approvalTitle) {
      setErrorMessage([]);
    } else {
      setErrorMessage(['Approval Title is required.']);
    }
  }, [approvalTitle]);

  const handleChangeApprovalTitle = (e) => {
    setApprovalTitle(e.target.value);
  };

  const handleClose = () => {
    if (handleDeleteRecord) {
      handleDeleteRecord();
    }

    onCloseCompose();
    setFiles([]);
  };

  const handleDropMultiFile = useCallback(
    (acceptedFiles) => {
      setAcceptedFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    [setAcceptedFiles]
  );

  useEffect(() => {
    setFiles([...acptedFiles, ...files]);
  }, [acptedFiles]);

  const handleRemoveAll = () => {
    setFiles([]);
  };

  const handleRemove = (file) => {
    const filteredItems = files.filter((_file) => _file !== file);

    setFiles(filteredItems);
  };

  const uploadFiles = async (formData) => {
    const accessToken = window.localStorage.getItem('accessToken');
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];
    if (isFileAlreadyUploaded) {
      attachedFilePks = approvalAttachedPks.map((pk) => `${pk.factoryCode}-${pk.id}`);
    } else {
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
    }

    return {
      isUploadFileSuccess,
      uploadFileMessage,
      attachedFileIds,
      attachedFilePks
    };
  };

  const handleUploadFiles = async () => {
    let isUploadFileSuccess = false;
    let uploadFileMessage = '';
    let attachedFileIds = [];
    let attachedFilePks = [];

    const formData = new FormData();
    if (isFileAlreadyUploaded) {
      const difference = files.filter((x) => approvalFiles.indexOf(x) === -1);
      if (!isEmpty(difference)) {
        difference.forEach((file) => {
          formData.append('files', file);
        });
        const data = await uploadFiles(formData);
        isUploadFileSuccess = data.isUploadFileSuccess;
        uploadFileMessage = data.uploadFileMessage;
        attachedFileIds = data.attachedFileIds;
        attachedFilePks = data.attachedFilePks;
      } else {
        isUploadFileSuccess = true;
        attachedFileIds = approvalAttachedIds;
        attachedFilePks = approvalAttachedPks.map((approval) => `${approval.factoryCode}-${approval.id}`);
      }
    } else {
      files.forEach((file) => {
        formData.append('files', file);
      });
      const data = await uploadFiles(formData);
      isUploadFileSuccess = data.isUploadFileSuccess;
      uploadFileMessage = data.uploadFileMessage;
      attachedFileIds = data.attachedFileIds;
      attachedFilePks = data.attachedFilePks;
    }
    return {
      isUploadFileSuccess,
      uploadFileMessage,
      attachedFileIds,
      attachedFilePks
    };
  };

  const handleSubmitApproval = async () => {
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
    let editorContent = '';
    if (editorRef.current) {
      editorContent = editorRef.current.getContent();
    }
    const approvalPathSubmit = [];
    if (isUploadFileSuccess || isEmpty(files)) {
      if (!isUndefined(approvalPath.columns['approval-path'].approverIds) && !isEmpty(approvalPath.approvers)) {
        let rank = -1;
        let isLastParallel = false;
        approvalPath.columns['approval-path'].approverIds.slice(1).forEach((userId) => {
          const { factoryCode, id } = getFactoryAndIdByPk(userId);
          let _rank;
          const _isParallel = approvalPath.approvers[userId].isParallel;
          const _type = approvalPath.approvers[userId].type;
          rank += 1;
          if (!_isParallel) {
            _rank = rank;
            isLastParallel = false;
          } else {
            if (isLastParallel) {
              rank -= 1;
            }
            _rank = rank;
            isLastParallel = true;
          }
          const approver = {
            userPk: {
              factoryCode,
              id
            },
            isParallel: _isParallel,
            type: _type,
            rank: _rank
          };
          approvalPathSubmit.push(approver);
        });
      }
      setSubmitting(true);
      let _approvalTitle = approvalTitle;
      if (priority === 'D054001') {
        _approvalTitle = `[URGENT] ${approvalTitle}`;
      } else if (priority === 'D054002') {
        _approvalTitle = `[HIGH PRIORITY] ${approvalTitle}`;
      }
      await mutate({
        url: '/document-request/create-request',
        data: {
          title: _approvalTitle,
          htmlContent: editorContent,
          version: 0,
          type: {
            code: documentRequestType
          },
          documentApprovalStates: approvalPathSubmit,
          remark: submitMessage,
          attachedFileIds, // @TODO attach file
          attachedFilePks,
          requestParameters: _requestParameters,
          priority: {
            code: priority
          }
        },
        method: 'post',
        featureCode: 'code.create'
      })
        .then((res) => {
          if (res.httpStatusCode === 200) {
            setFiles([]);
            setSubmitting(false);
            enqueueSnackbar('Submit Approval Success', { variant: 'success' });
            dispatch(getApprovals({}));
            setApprovalTitle('');
            setApprovalPath(initApprovalPath);
            handleCloseDialog();
            onCloseCompose();
            handleRemoveAll();
            setPriority('D054003');
            setTouched(false);
            if (onSubmitSuccess) {
              onSubmitSuccess(res.data.factoryPk);
            }
          }
        })
        .catch((error) => {
          setSubmitting(false);
          console.error(error);
        });
    } else {
      setSubmitting(false);
      enqueueSnackbar(`Upload file error: ${uploadFileMessage}`, { variant: 'error' });
    }
  };

  if (!isOpenCompose) {
    return null;
  }

  const getMaxRank = (approvers) => {
    let maxRank = 0;
    Object.values(approvers).forEach((approver) => {
      if (approver.rank > maxRank) {
        maxRank = approver.rank;
      }
    });
    return maxRank + 1;
  };

  const handleAddApprover = (approver) => {
    const newApprovalPath = approvalPath;
    const userId = approver.value.toString();
    const rank = getMaxRank(newApprovalPath.approvers);
    if (!newApprovalPath.columns['approval-path'].approverIds.includes(userId)) {
      newApprovalPath.columns['approval-path'].approverIds.push(userId);
      newApprovalPath.approvers[userId] = {
        userId,
        content: approver.label,
        type: 'APPROVER',
        isParallel: false,
        rank
      };
    }
    setApprovalPath({ ...approvalPath, ...newApprovalPath });
  };

  const handleChangePriority = (priority) => {
    setPriority(priority?.value);
  };

  return (
    <Portal>
      <Backdrop open sx={{ zIndex: 1998 }} />
      <RootStyle
        sx={{
          top: 0,
          left: 0,
          zIndex: 1999,
          margin: 'auto',
          width: {
            xs: `calc(100% - 24px)`,
            md: `calc(100% - 80px)`
          },
          height: {
            xs: `calc(100% - 24px)`,
            md: `calc(100% - 80px)`
          }
        }}
      >
        <Box
          sx={{
            pl: 3,
            pr: 1,
            height: 60,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6">{translate(`typo.create_new_approval`)}</Typography>

          <ApprovalPriority handleChangePriority={handleChangePriority} style={{ width: '20vw' }} />
          <Box sx={{ flexGrow: 1, px: 3 }} />

          <Button variant="contained" sx={{ mr: 1 }} onClick={handleOpenDialog}>
            {translate(`button.submit`)}
          </Button>
          <Button variant="outlined" onClick={handleClose}>
            {translate(`button.cancel`)}
          </Button>
        </Box>

        <Divider />

        <InputStyle
          onChange={handleChangeApprovalTitle}
          value={approvalTitle}
          required
          placeholder="Approval Title"
          onFocus={handleTouch}
          error={touched && Boolean(errorMessage.length)}
          helperText={touched && errorMessage[0]}
          size="small"
        />

        <Scrollbar sx={{ flexGrow: 1 }}>
          <SearchApprover handleAddApprover={handleAddApprover} userDraft={user} />
          <ApprovalPathCreate setApprovalPath={setApprovalPath} approvalPath={approvalPath} />
          <UploadMultiFile
            sx={{ mb: 1 }}
            showPreview={false}
            files={files}
            onDrop={handleDropMultiFile}
            onRemove={handleRemove}
            onRemoveAll={handleRemoveAll}
            isDownload={isDownload}
            isView={isView}
          />
          <Editor
            onInit={(evt, editor) => (editorRef.current = editor)}
            apiKey="6w9x8t8j2gq46hkkm1tokbdmwehnxx9b0gpmiay1574fod11"
            initialValue={defaultEditor || initEditorValue}
            init={{
              height: 500,
              plugins: [
                'print preview importcss tinydrive searchreplace autolink autosave save directionality visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor insertdatetime advlist lists wordcount textpattern noneditable help charmap quickbars emoticons'
              ],
              menubar: 'file edit view insert format tools table tc help',
              toolbar:
                'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist checklist | forecolor backcolor casechange permanentpen formatpainter removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media pageembed template link anchor codesample | a11ycheck ltr rtl',

              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </Scrollbar>
      </RootStyle>
      <Dialog
        sx={{ zIndex: 9999 }}
        open={openDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Submit Approval</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ width: '20vw', my: 2 }}
            rows={4}
            fullWidth
            multiline
            label="Comments"
            onChange={(e) => setSubmitMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDialog}>
            {translate(`button.cancel`)}
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmitApproval}
            loading={isSubmitting}
            loadingIndicator="Submitting..."
          >
            {translate(`button.submit`)}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Portal>
  );
}

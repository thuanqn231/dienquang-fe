import axios from './axios';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082/api/rest/'
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;


axios.defaults.headers.common.FeatureCode = `code.create`;
const response = await axios.post('/document-request/create-request', {
  title: approvalTitle,
  htmlContent: editorContent,
  version: 0,
  type: {
    id: 1
  },
  documentApprovalStates: approvalPathSubmit
});

const _axiosMutate = axios.create({
  baseURL: 'http://localhost:8082/api/rest/'
});
_axiosMutate.interceptors.response.use(res => {
    const data = path(["data"], res) || {}
    const { statusCode, statusMessage } = data
    const isSuccess = statusCode === 'success'
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // statusMessage
    // statusCode
    if (statusMessage && _axiosMutate.isShowMessage) {
        enqueueSnackbar(statusMessage, {
            variant: isSuccess ? 'success' : 'error',
            action: (key) => (
                <MIconButton size="small" onClick={() => closeSnackbar(key)}>
                    <Icon icon={closeFill} />
                </MIconButton>
            ),
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
            },
        })
    }
    return isSuccess ? data : Promise.reject(res)
}, error => Promise.reject((error.response && error.response.data) || 'Something went wrong'))

export const mutate = ({ url, data = {}, isShowMessage, timeout, method = 'post', featureCode } = {}) => {
    _axiosMutate.defaults.timeout = timeout || 10000;
    _axiosMutate.defaults.headers.common.FeatureCode = featureCode || '';
    _axiosMutate.isShowMessage = !_.isUndefined(isShowMessage) ? isShowMessage : true;

    if (!url) {
        return Promise.reject(ERROR_REST_API_URL);
    }

    if (method === 'post') {
        return _axiosMutate.post(url, data);
    }
    return _axiosMutate.put(url, data);
};
import _ from 'lodash';
import qs from 'qs';
import { path } from 'ramda';
import { ERROR_REST_API_URL } from '../constants/error';
import { createAxios } from './axios';
import { SnackActions } from '../wrapper/Notistack';

const statusMap = {
  success: 'STATUS_1',
  error: 'STATUS_0'
};

const _axiosQuery = createAxios({
  method: 'get',
  paramsSerializer: (params) => qs.stringify(params, { indices: false })
});

_axiosQuery.interceptors.response.use(
  (res) => {
    if (_.get(res, 'config.custom.showErrorMessage') && _.get(res, 'data.resultCode') === statusMap.error) {
      console.error(_.get(res, 'data.resultMessage', ''));
    }
    return _.get(res, 'data');
  },
  (error) => {
    if (_.get(error, 'config.custom.showErrorMessage')) {
      handleDisplayMessage(error);
    }
    return Promise.reject(error)
  }
);

// query
/**
 *
 * @param { url, params } object
 * { url: '/restApi', params: { ...getParameter }}
 */
export const query = ({ url, params = {}, featureCode, timeout = 10000, showErrorMessage = true } = {}) => {
  const accessToken = window.localStorage.getItem('accessToken');
  _axiosQuery.defaults.timeout = timeout;
  _axiosQuery.defaults.headers.common.FeatureCode = featureCode || '';
  _axiosQuery.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  _axiosQuery.defaults.headers.common.ScreenId = `${window.location.pathname.split('/').slice(-1)}`;
  return url
    ? _axiosQuery(encodeURI(url), {
      params,
      custom: { showErrorMessage }
    })
    : Promise.reject(ERROR_REST_API_URL);
};

/**
 *
 * @param {Array} object
 *
 * [{ url, params}, {url, params}...]
 */
export const queryAll = (args = []) =>
  Array.isArray(args) && args.length ? Promise.all(args.map(query)) : Promise.reject(ERROR_REST_API_URL);

const _axiosMutate = createAxios();
_axiosMutate.interceptors.response.use((res) => {
  const data = path(['data'], res) || {};
  const { statusCode } = data;
  const isSuccess = statusCode === 'success';

  return isSuccess ? data : Promise.reject(res);
},
  (error) => {
    if (_axiosMutate.isShowMessage) {
      handleDisplayMessage(error);
    }
    return Promise.reject(error)
  }
);

export const mutate = ({ url, data = {}, isShowMessage, timeout, method = 'post', featureCode } = {}) => {
  const accessToken = window.localStorage.getItem('accessToken');
  _axiosMutate.defaults.timeout = timeout || 10000;
  _axiosMutate.isShowMessage = !_.isUndefined(isShowMessage) ? isShowMessage : true;
  _axiosMutate.defaults.headers.common.FeatureCode = featureCode || '';
  _axiosMutate.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  if (!url) {
    return Promise.reject(ERROR_REST_API_URL);
  }

  if (method === 'post') {
    return _axiosMutate.post(url, data);
  }
  if (method === 'delete') {
    return _axiosMutate.delete(url, data);
  }
  if (method === 'patch') {
    return _axiosMutate.patch(url, data);
  }
  return _axiosMutate.put(url, data);
};

const handleDisplayMessage = (error) => {
  // TODO: get option display or not
  if (error && error.data) {
    const { data } = error;
    // TODO: get code and translate to error message
    const { httpStatusCode, statusMessageDetail } = data;
    switch (httpStatusCode) {
      case 500:
        SnackActions.error(statusMessageDetail);
        break;
      case 400:
        SnackActions.info(statusMessageDetail);
        break;
      default:
        break;
    }
  }
};

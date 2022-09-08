import axios from 'axios';
import { isEmpty } from 'lodash';
import { getLocalDateTime, fDateTime } from '../../utils/formatTime';



const statusMap = {
  404: '허가되지 않은 페이지 요청입니다.',
  undefined: '잘못된 네트워크 요청 입니다.'
};
// export const dateTransformer = (data) => {

//   if (data instanceof Date) {
//     // do your specific formatting here
//     return getLocalDateTime(fDateTime(data));
//   }
//   if (Array.isArray(data)) {
//     return data.map((val) => dateTransformer(val));
//   }
//   if (typeof data === 'object' && data !== null) {
//     return Object.fromEntries(Object.entries(data).map(([key, val]) => [key, dateTransformer(val)]));
//   }

//   return data;
// };

export const setDefaultAxiosConfig = () => {
  axios.defaults.baseURL = window.__RUNTIME_CONFIG__.REACT_APP_REST_API_URL;
  axios.defaults.transformResponse = [
    (response) => {
      if (typeof response === 'string') {
        try {
          const json = JSON.parse(response);
          return json;
        } catch (error) {
          return error;
        }
      }

      return response;
    }
  ];

  _setInterceptors(axios);
};
export const createAxios = (config) => {

  setDefaultAxiosConfig();
  // const instance = axios.create({
  //   transformRequest: [dateTransformer].concat(axios.defaults.transformRequest),
  //   ...config
  // });
  const instance = axios.create(config);
  instance.defaults.timeout = 10000;
  _setInterceptors(instance);
  return instance;
};

const _setInterceptors = (instance) => {
  instance.interceptors.request.use((config) => config, _handleError);

  instance.interceptors.response.use((response) => response, _handleError);
};

const _handleError = (error) => {
  if (error.response) {
    const { status } = error.response;
  }
  return Promise.reject(error.response);
};

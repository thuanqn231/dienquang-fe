import { PAGE_SIZE } from '../core/constants/paging';
import { query, mutate } from '../core/api';

const UPDATE_AGGRID_URL = '/v1/user/ag-grid-configuration/update';

export const setGridDataSource = (gridApi, url, requestParams) => {
  let response = [];
  const dataSource = {
    getRows: (params) => {
      // Use startRow and endRow for sending pagination to Backend
      // params.startRow : Start Page
      // params.endRow : End Page

      const page = params.endRow / PAGE_SIZE - 1;
      requestParams.page = page;
      requestParams.size = PAGE_SIZE;
      query({
        url,
        featureCode: 'user.create',
        params: requestParams
      })
        .then((res) => {
          params.successCallback(res?.data?.content || [], res?.data?.totalElements || 0);

          response = res?.data?.content;
        })
        .catch((err) => {
          console.error(err);
          params.successCallback([], 0);
        });
    }
  };
  gridApi.setDatasource(dataSource);
  return response;
};

export const clearGridData = (gridApi) => {
  if (gridApi) {
    const dataSource = {
      getRows: (params) => {
        params.successCallback([], 0);
      }
    };
    gridApi.setDatasource(dataSource);
  }
};

export const setGridDataManual = (gridApi, content, total) => {
  if (gridApi) {
    const dataSource = {
      getRows: (params) => {
        params.successCallback(content, total);
      }
    };
    gridApi.setDatasource(dataSource);
  }
};

export const updateGridConfig = async (agGridId, featureCode, agGridConfig) => {
  const response = await mutate({
    url: UPDATE_AGGRID_URL,
    method: 'post',
    featureCode: 'user.create',
    data: [
      {
        agGridId,
        featureCode,
        agGridConfig
      }
    ]
  }).catch((error) => {
    console.error(error);
  });
  return response;
};

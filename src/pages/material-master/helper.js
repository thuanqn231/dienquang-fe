export const BASE_URL = '/v1/material';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.productionMasterData.materialMaster.materialCode';

export const gridConfigs = {
    [`${pageCode}.materialCode`]: {
        tableCode: 'materialMasterList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}
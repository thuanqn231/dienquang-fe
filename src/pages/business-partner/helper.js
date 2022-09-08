import { mutate, query } from '../../core/api';
import { stateParam } from '../../core/constants';

export const BASE_URL_CODE = '/v1/partner/code';
export const BASE_URL_GROUP = '/v1/partner/group';

export const SEARCH_URL_GROUP = '/v1/partner/group/search-v2';

export const SEARCH_URL_CODE = '/v1/partner/code/search-v2';

export const pageCodeCode = 'menu.masterData.purchase.purchaseMasterData.businessPartnerInformation.businessPartnerCode';

export const pageCodeGroup = 'menu.masterData.purchase.purchaseMasterData.businessPartnerInformation.businessPartnerGroup';

export const isRenderAllOrgChart = false;

export const gridConfigsCode = {
    [pageCodeCode]: {
        tableCode: 'businessPartnerCodeList',
        searchUrl: SEARCH_URL_CODE
    }
}

export const gridConfigsGroup = {
    [pageCodeGroup]: {
        tableCode: 'businessPartnerGroupList',
        searchUrl: SEARCH_URL_GROUP
    }
}

export const initSearchParamsGroup = {
    [pageCodeGroup]: [
        {
            type: 'textfield',
            id: 'code',
            label: 'Biz Partner Group Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Biz Partner Group Name',
            defaultValue: ''
        },
        stateParam
    ]
}
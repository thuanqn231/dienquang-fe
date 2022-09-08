import { stateParam } from '../../core/constants';

export const BASE_URL = '/v1/equipment-id';

export const isRenderAllOrgChart = false;

export const pageCode = 'menu.masterData.production.resourceMasterData.equipmentInfo.equipmentID';

export const gridConfigs = {
    [pageCode]: {
        tableCode: 'equipmentIDList',
        searchUrl: `${BASE_URL}/search-v2`
    }
}

export const initSearchParams = {
    [pageCode]: [
        {
            type: 'textfield',
            id: 'equipmentCode',
            label: 'Equip. Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'code',
            label: 'Equip. ID Code',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'name',
            label: 'Equip. ID Name',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'serial',
            label: 'Equip. Serial',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'asset',
            label: 'Equip. Asset',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'rfidCode',
            label: 'RFID Code',
            defaultValue: ''
        },
        {
            type: 'dropdown',
            id: 'status',
            label: 'Equip. Status',
            groupId: 'D034000',
            defaultValue: ''
        },
        {
            type: 'textfield',
            id: 'model',
            label: 'Equip. Model',
            defaultValue: ''
        },
        stateParam
    ]
}
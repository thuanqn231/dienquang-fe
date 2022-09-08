import {mutate, query} from '../api'

export const loadSelectedData = async (loadUrl, selectedId) => {
    const response = await query({
        url: `${loadUrl}/${selectedId}`,
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    const { data } = response;
    return data;
}

export const deleteSelectedData = async (deleteUrl, selectedId) => {
    const response = await mutate({
        url: `${deleteUrl}/${selectedId}`,
        method: 'delete',
        featureCode: 'user.delete'
    })
        .catch((error) => {
            console.error(error);
        });
    return response;
}

export const createUpdateData = async (url, dtoName, params) => {
    const response = await mutate({
        url,
        data: {
            [dtoName]: params
        },
        method: 'post',
        featureCode: 'user.create'
    })
        .catch((error) => {
            console.error(error);
        });
    return response;
}
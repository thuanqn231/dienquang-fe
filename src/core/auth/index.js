import { Storage } from '../common';
import { STORAGE_ACCESS_TOKEN_KEY } from '../constants';

export function getAccessToken() {
    return Storage.getItem(STORAGE_ACCESS_TOKEN_KEY);
}

export function setAccessToken(value) {
    Storage.setItem(STORAGE_ACCESS_TOKEN_KEY, value);
}

export function removeAccessToken() {
    return Storage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
}

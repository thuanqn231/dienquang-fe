import throttle from 'lodash/throttle';
import { setCommonCodeData } from '../../redux/slices/common';
import { store } from '../../redux/store';
import { query } from '../api';


const _dispatch = throttle((action) => {
    store.dispatch(action);
}, 1000);

const SetCommonCode = async () => {
    _dispatch(
        setCommonCodeData(
            await query({
                url: `${window.__RUNTIME_CONFIG__.REACT_APP_REST_API_URL}/listIPX_CommonCodeTotalAC`, // process.env.REACT_APP_REST_API_URL+
                timeout: 60000
            })
        )
    );
};

SetCommonCode();
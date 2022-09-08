import { LoadingButton } from '@material-ui/lab';
import { pick, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import useAuth from '../../hooks/useAuth';

function DthButtonPermission({ pageCode, widgetCode, funcType, ...restProps }) {
  const { funcPermission } = useAuth();
  let isRender = false;
  const pageIndex = funcPermission.findIndex((func) => func.code === pageCode);
  
  if (pageIndex !== -1 && funcPermission[pageIndex].permissions.includes(funcType)) {
    if (isEmpty(funcPermission[pageIndex].widgets)) {
      isRender = funcPermission[pageIndex].permissions.includes(funcType);
    } else {
      const widgetIndex = funcPermission[pageIndex].widgets.findIndex((widget) => widget.code === widgetCode);
      if (widgetIndex !== -1) {
        isRender = funcPermission[pageIndex].widgets[widgetIndex].permissions.includes(funcType);
      }
    }
  }
  const selectProps = pick(restProps, ['sx', 'variant', 'onClick', 'size', 'label', 'disabled']);
  return isRender && <LoadingButton {...restProps}>{selectProps.label}</LoadingButton>;
}

DthButtonPermission.propTypes = {
  pageCode: PropTypes.string.isRequired,
  funcType: PropTypes.string.isRequired,
  widgetCode: PropTypes.string
};

export default DthButtonPermission;

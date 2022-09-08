import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  ListItemIcon
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { get, pick, isEmpty, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';

function DropDown({
  name,
  label,
  required,
  disabled,
  options,
  groupId,
  defaultValue,
  value,
  errorMessage,
  onChange,
  inputWidth,
  allowEmptyOption,
  isMulti,
  sx,
  excludes,
  allowSendAll,
  ...restProps
}) {
  const selectProps = pick(restProps, [
    'autoWidth',
    'children',
    'classes',
    'displayEmpty',
    'input',
    'inputProps',
    'MenuProps',
    'native',
    'onClose',
    'onOpen',
    'open',
    'renderValue',
    'SelectDisplayProps',
    'variant',
    'style',
    'width',
    'size'
  ]);
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250
      }
    },
    getContentAnchorEl: null,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center'
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'center'
    },
    variant: 'menu'
  };
  const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      width: 300
    },

    selectAllText: {
      fontWeight: 500
    },
    selectedAll: {
      backgroundColor: 'rgba(0, 0, 0, 0.06)',
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.06)'
      }
    }
  }));
  const classes = useStyles();
  const { commonDropdown } = useAuth();
  const { commonCodes } = commonDropdown;
  const [currentOptions, setOptions] = useState([]);

  useEffect(() => {
    try {
      if (!isEqual(currentOptions, options)) {
        setOptions(options);
      }
    } catch (error) {
      console.error(error);
    }
  }, [options]);

  useEffect(() => {
    if (!!groupId && !isEmpty(commonDropdown.commonCodes) && isEmpty(currentOptions)) {
      const options = commonDropdown.commonCodes
        .filter((commonCode) => commonCode.groupId === groupId)
        .map((commonCode) => ({
          value: commonCode.code,
          label: commonCode.name
        }));
      setOptions(options);
      if (allowSendAll) {
        setOptions([
          {
            value: 'ALL',
            label: 'ALL'
          },
          ...options
        ]);
      }
    }
  }, [commonCodes]);

  return (
    <FormControl
      error={Boolean(errorMessage)}
      required={required}
      sx={{ ...sx, py: 0, width: inputWidth }}
      size={selectProps.size}
    >
      {label && <InputLabel shrink>{label}</InputLabel>}
      <Select
        {...selectProps}
        label={label}
        name={name}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        multiple={isMulti}
        renderValue={(selected) =>
          (isMulti ? selected : [selected])
            .filter((v) => v !== '')
            .map((v) =>
              get(
                currentOptions.find((o = {}) => o.value === v),
                'label'
              )
            )
            .join(' | ')
        }
        MenuProps={MenuProps}
      >
        {allowEmptyOption && !excludes.includes('') && (
          <MenuItem key="select-item-empty" value="">
            &nbsp;
          </MenuItem>
        )}
        {isMulti && currentOptions.length > 1 && (
          <MenuItem
            value="all"
            classes={{
              root: currentOptions.length > 0 && currentOptions.length === value.length ? classes.selectedAll : ''
            }}
          >
            <ListItemIcon>
              <Checkbox
                checked={currentOptions.length > 0 && currentOptions.length === value.length}
                indeterminate={value.length > 0 && value.length < currentOptions.length}
              />
            </ListItemIcon>

            <ListItemText classes={{ primary: classes.selectAllText }} primary="Select All" />
          </MenuItem>
        )}
        {currentOptions &&
          currentOptions
            .filter((item) => !excludes.includes(item.value))
            .map((item, index) => {
              if (isMulti) {
                return (
                  <MenuItem key={`select-item-${index}`} disabled={Boolean(item.disabled)} value={item.value}>
                    <Checkbox checked={value.indexOf(item.value) > -1} />
                    <ListItemText primary={item.label} />
                  </MenuItem>
                );
              }
              return (
                <MenuItem key={`select-item-${index}`} disabled={Boolean(item.disabled)} value={item.value}>
                  {item.label}
                </MenuItem>
              );
            })}
      </Select>
      {Boolean(errorMessage) && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
}

DropDown.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  classes: PropTypes.any,
  sx: PropTypes.object,
  options: PropTypes.array,
  excludes: PropTypes.array,
  groupId: PropTypes.string,
  defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  isMulti: PropTypes.bool,
  allowEmptyOption: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  inputWidth: PropTypes.string,
  label: PropTypes.string
};

DropDown.defaultProps = {
  className: '',
  classes: {},
  sx: {},
  name: 'dthaus-select-field',
  value: '',
  options: [],
  excludes: [],
  groupId: '',
  required: false,
  disabled: false,
  isMulti: false,
  errorMessage: '',
  inputWidth: '100%',
  allowEmptyOption: true,

  onChange: (event, value) => {}
};

export default DropDown;

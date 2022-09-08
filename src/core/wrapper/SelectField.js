import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Checkbox,
  FilledInput,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select
} from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { get, isEmpty, isEqual, join, noop, pick, toString } from 'lodash';
import PropTypes from 'prop-types';
import { query } from '../api';
import { useSelector } from '../../redux/store';

const SELECTED_ALL = 'SELECTED_ALL';
const VALUE_ALL = '@@@@@@';
const VALUE_ALL_TEXT = '전체';

const styles = () => ({
  menuItem: {
    justifyContent: 'center'
  }
});
function usePreviousValue(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function makeEvent(name, value) {
  const changedEvent = new Event('change', {
    bubbles: true
  });

  Object.defineProperty(changedEvent, 'target', {
    writable: false,
    value: {
      name,
      value
    }
  });

  return changedEvent;
}

function OwpSelectField({
  className,
  classes,
  name,
  label,
  isMulti,
  required,
  useAll,
  useCheckboxMenuWithMenu,
  useReset,
  isSearch,
  disabled,
  groupId,
  query: queryOptions,
  mapper,
  items,
  options,
  defaultValue,
  value,
  removeDefaultOption,
  emptyOptionLabel,
  errorMessage,
  onChange,
  inputWidth,
  ...restProps
}) {
  const useAllSingle = !isMulti && useAll;
  const useAllMulti = isMulti && useAll;

  const [currentValue, setValue] = useState(useAllSingle ? VALUE_ALL : defaultValue || value);
  const [currentOptions, setOptions] = useState([]);
  const [currentOptionsConvToObj, setOptionsConvToObj] = useState({});

  const diffOptionsRef = useRef(false);
  let _defaultValueRef = value;
  if (useAllSingle) _defaultValueRef = VALUE_ALL;
  else if (useAllMulti) _defaultValueRef = null;
  else _defaultValueRef = defaultValue;
  const defaultValueRef = useRef(_defaultValueRef);
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  const prevQueryOptions = usePreviousValue(queryOptions);
  const prevValue = usePreviousValue(value) || '';
  const { commonCodes } = useSelector((state) => state.common);

  const selectedValue = useMemo(() => {
    let _currentValue = currentValue;
    if (isMulti) {
      if (isEmpty(currentValue)) {
        _currentValue = [];
      } else if (typeof currentValue === 'string') {
        if (currentValue.indexOf(',') === -1) {
          _currentValue = [currentValue];
        } else {
          _currentValue = currentValue.split(',');
        }
      }
    }
    return _currentValue;
  }, [value, currentValue]);

  const useSelectedAll = useMemo(() => {
    if (useAllMulti) {
      return selectedValue.length === currentOptions.length;
    }

    return false;
  }, [useAllMulti, selectedValue, currentOptions]);

  useEffect(() => {
    if (required && useAllSingle) {
      inputRef.current.value = VALUE_ALL;
      inputRef.current.setCustomValidity('');
    }
  }, []);

  useEffect(() => {
    if (!isSearch && !isEqual(prevValue, value)) {
      setValue(value);
    }
  }, [isSearch, prevValue, value]);

  useEffect(() => {
    try {
      if (!isEmpty(items) && !isEqual(currentOptions, items)) {
        setOptions(items);
        return;
      }

      if (!isEmpty(options) && !isEqual(currentOptions, options)) {
        diffOptionsRef.current = true;
        setOptions(options);
      }
    } catch (error) {
      console.error(error);
    }
  }, [items, options]);

  useEffect(() => {
    if (!!groupId && !isEmpty(commonCodes) && isEmpty(currentOptions)) {
      setOptions(commonCodes[groupId]);
    }
  }, [commonCodes]);

  useEffect(() => {
    if (!isEmpty(get(queryOptions, 'url')) && !isEqual(prevQueryOptions, queryOptions)) {
      query(queryOptions)
        .then((data = []) =>
          setOptions(
            data.map((item) => ({
              label: item[get(mapper, 'label', 'label')],
              value: toString(item[toString(get(mapper, 'value', 'value'))] || ''),
              data: item
            }))
          )
        )
        .catch((error) => console.error(error));
    }
  }, [queryOptions, prevQueryOptions]);

  useEffect(() => {
    if (useAllMulti && !isEmpty(currentOptions) && (isEmpty(defaultValueRef.current) || diffOptionsRef.current)) {
      const values = currentOptions.map(({ value }) => value);
      diffOptionsRef.current = false;
      defaultValueRef.current = values;
      setValue(values);

      if (onChange instanceof Function) {
        const joindValue = join(values, ',');
        onChange(makeEvent(name, joindValue), { value: joindValue, data: currentOptions });
      }

      if (required) {
        inputRef.current.value = values;
        inputRef.current.setCustomValidity('');
      }
    }
  }, [useAllMulti, currentOptions]);

  const handleChange = (evt) => {
    const isEmptyValue = isEmpty(evt.target.value);

    const isSelectedAllOfMulti = isMulti && !isEmptyValue && evt.target.value.includes(SELECTED_ALL);
    let changedValue = evt.target.value;
    if (isMulti) {
      if (isSelectedAllOfMulti) {
        if (useSelectedAll) {
          changedValue = '';
        } else {
          changedValue = join(
            currentOptions.map(({ value }) => value),
            ','
          );
        }
      } else if (isEmptyValue) {
        changedValue = '';
      } else {
        changedValue = join(evt.target.value, ',');
      }
    }

    if (onChange instanceof Function) {
      const changedEvt = {
        ...evt,
        target: {
          ...evt.target,
          value: changedValue
        }
      };
      const selectedOptionData = currentOptions.filter(
        ({ value }) => !isEmptyValue && evt.target.value.includes(value)
      );

      onChange(changedEvt, {
        value: changedValue,
        data: isMulti ? selectedOptionData : get(selectedOptionData, '0', {})
      });
    }

    if (required) {
      inputRef.current.value = changedValue;
      if (!isEmpty(changedValue)) inputRef.current.setCustomValidity('');
    }

    setValue(isSelectedAllOfMulti ? changedValue : evt.target.value);
  };

  const getInput = () => {
    switch (restProps.variant) {
      case 'outlined':
        return <OutlinedInput labelWidth={label.length * 8} id={name} />;
      case 'filled':
        return <FilledInput id={name} />;
      default:
        return <Input id={name} />;
    }
  };

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
    'width'
  ]);

  return (
    <FormControl
      error={Boolean(errorMessage)}
      required={required}
      variant={restProps.variant}
      sx={{ py: 0, width: inputWidth }}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        {...selectProps}
        renderValue={(selected) =>
          (isMulti ? selected : [selected])
            .map((v) =>
              v === VALUE_ALL
                ? VALUE_ALL_TEXT
                : get(
                    currentOptions.find((o = {}) => o.value === v),
                    'label'
                  )
            )
            .join(', ')
        }
        name={name}
        value={selectedValue}
        multiple={isMulti}
        onChange={handleChange}
        input={getInput()}
        inputProps={{
          inputRef: selectRef
        }}
        disabled={disabled}
      >
        {useAllMulti && (
          <MenuItem classes={{ root: classes.menuItem }} value={SELECTED_ALL}>
            {`${VALUE_ALL_TEXT}선택 ${useSelectedAll ? '해제' : ''}`}
          </MenuItem>
        )}
        {(isMulti || removeDefaultOption
          ? currentOptions || []
          : [
              useAll ? { label: VALUE_ALL_TEXT, value: VALUE_ALL } : { label: emptyOptionLabel, value: '' },
              ...(currentOptions || [])
            ]
        ).map((item, index) => (
          <MenuItem key={`owp-select-item-${index}`} disabled={Boolean(item.disabled)} value={item.value}>
            {useCheckboxMenuWithMenu && !isEmpty(item.value) && (
              <Checkbox checked={selectedValue.indexOf(item.value) > -1} />
            )}
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Select>
      {required && (
        <input
          ref={inputRef}
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0 }}
          value={get(inputRef.current, 'value', selectedValue)}
          onFocus={() => selectRef.current.focus()}
          onChange={noop}
          onInvalid={(e) => {
            e.target.setCustomValidity('목록에서 항목을 선택하세요.');
          }}
          required={required}
        />
      )}
      {Boolean(errorMessage) && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
}

OwpSelectField.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  classes: PropTypes.any,
  query: PropTypes.shape({
    url: PropTypes.string,
    params: PropTypes.object
  }),
  mapper: PropTypes.object,
  useCheckboxMenuWithMenu: PropTypes.bool,
  useAll: PropTypes.bool,
  items: PropTypes.array,
  options: PropTypes.array,
  defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
  groupId: PropTypes.string,
  isMulti: PropTypes.bool,
  required: PropTypes.bool,
  useReset: PropTypes.bool,
  isSearch: PropTypes.bool,
  disabled: PropTypes.bool,
  removeDefaultOption: PropTypes.bool,
  emptyOptionLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  setValue: PropTypes.func,
  inputWidth: PropTypes.string
};

OwpSelectField.defaultProps = {
  className: '',
  classes: {},
  name: 'owp-select-field',
  value: '',
  query: {},
  mapper: { label: 'label', value: 'value' },
  groupId: '',
  items: [],
  options: [],
  isMulti: false,
  required: false,
  useReset: false,
  useAll: false,
  useCheckboxMenuWithMenu: true,
  isSearch: false,
  disabled: false,
  removeDefaultOption: false,
  emptyOptionLabel: '',
  errorMessage: '',
  inputWidth: '100%',
  onChange: (event, value) => {},
  setValue: () => {}
};

export default withStyles(styles)(OwpSelectField);

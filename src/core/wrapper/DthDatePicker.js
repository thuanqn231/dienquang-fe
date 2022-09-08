import { TextField } from '@material-ui/core';
import { DatePicker, LocalizationProvider } from '@material-ui/lab';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import { pick } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import { isValidDate } from '../../utils/formatTime';

function DthDatePicker({ inputFormat, mask, errorMessage, onChange, value, disabled, ...restProps }) {
  const pickerProps = pick(restProps, ['name', 'label', 'value', 'onChange', 'minDate', 'maxDate']);

  const inputProps = pick(restProps, ['sx', 'fullWidth', 'size', 'required', 'disabled', 'variant', 'InputProps']);

  const [date, setDate] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fNewValue = new Date(value);
    setDate(fNewValue);
  }, [onChange]);

  const handleChange = useCallback(
    (newValue) => {
      let fNewValue;
      if (onChange instanceof Function && isValidDate(newValue)) {
        fNewValue = new Date(newValue);
      } else {
        fNewValue = new Date();
      }

      setDate(fNewValue);
      onChange(fNewValue);
    },
    [onChange]
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale="vi">
      <DatePicker
        {...pickerProps}
        disabled={disabled}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        inputFormat={inputFormat}
        mask={mask}
        value={date}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField {...params} disabled={disabled} {...inputProps} onClick={(e) => { if(!disabled) setOpen(true)}} error={Boolean(errorMessage)} helperText={errorMessage} />
        )}
      />
    </LocalizationProvider>
  );
}

DthDatePicker.propTypes = {
  mask: PropTypes.string,
  inputFormat: PropTypes.string,
  errorMessage: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

DthDatePicker.defaultProps = {
  mask: '____-__-__',
  inputFormat: 'yyyy-MM-dd',
  errorMessage: '',
  value: '',
  onChange: (value) => {}
};

export default DthDatePicker;

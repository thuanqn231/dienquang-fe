import DatePicker from 'react-date-picker';

import AdapterDateFns from '@material-ui/lab/AdapterDateFns';

import { pick } from 'lodash';
import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import { isValidDate } from '../../utils/formatTime';

function DthMonthPicker({
  onChange,
  value,
  maxDate,
  dateFormat,
  minDate,

  ...restProps
}) {
  // const pickerProps = pick(restProps, ['name', 'label', 'value', 'onChange', 'disabled', 'minDate', 'maxDate']);

  // const inputProps = pick(restProps, ['sx', 'fullWidth', 'size', 'required', 'disabled', 'variant', 'InputProps']);

  const [date, setDate] = useState(value);

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
    <DatePicker
      {...restProps}
      view="year"
      value={date}
      onClickMonth={handleChange}
      label="Month"
      maxDate={maxDate}
      minDate={minDate}
      format={dateFormat}
    />
  );
}

DthMonthPicker.propTypes = {
  dateFormat: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func
};

DthMonthPicker.defaultProps = {
  dateFormat: 'yyyy-MM',
  onChange: (value) => {}
};

export default DthMonthPicker;

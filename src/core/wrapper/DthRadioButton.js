import { FormControl, FormHelperText, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import PropTypes from 'prop-types';

function DthRadioButton({
  name,
  label,
  required,
  options,
  value,
  errorMessage,
  onChange,
  variant,
  sx,
  ...restProps
}) {
  return (
    <FormControl
      component="fieldset"
      error={Boolean(errorMessage)}
      required={required}
      sx={{ ...sx }}
      variant="standard"
      {...restProps}
    >
      {label && <FormLabel component="legend">{label}</FormLabel>}
      <RadioGroup row aria-label={name} name={name} value={value} onChange={onChange}>
        {options.map((item, index) => (
          <FormControlLabel key={item.value} value={item.value} control={<Radio />} label={item.label} {...item.props} />
        ))}
      </RadioGroup>
      {Boolean(errorMessage) && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
}

DthRadioButton.propTypes = {
  name: PropTypes.string,
  sx: PropTypes.object,
  options: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  errorMessage: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string
};

DthRadioButton.defaultProps = {
  sx: {},
  name: 'dthaus-radio-button',
  value: '',
  options: [],
  required: false,
  disabled: false,
  errorMessage: '',
  onChange: (event, value) => { },
  label: ''
};

export default DthRadioButton;

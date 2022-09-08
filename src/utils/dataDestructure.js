import { numberWithCommas } from '../pages/fmb/helper';

export const destructureNumber = (data) => {
  if (typeof data === 'number' && data !== null) {
    return numberWithCommas(data);
  }
  if (data instanceof Number) {
    return numberWithCommas(data);
  }

  if (Array.isArray(data)) {
    return data.map((val) => destructureNumber(val));
  }
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(Object.entries(data).map(([key, val]) => [key, destructureNumber(val)]));
  }

  return data;
};
function isNumeric(str) {
  if (typeof str !== 'string') return false; // we only process strings!
  return (
    !Number.isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !Number.isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

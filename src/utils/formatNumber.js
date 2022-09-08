import { replace } from 'lodash';
import numeral from 'numeral';
import { isNullVal } from './formatString';

// ----------------------------------------------------------------------

export function fCurrency(number) {
  return numeral(number).format(Number.isInteger(number) ? '$0,0' : '$0,0.00');
}

export function fPercent(number) {
  return numeral(number / 100).format('0.0%');
}

export function fNumber(number) {
  return numeral(number).format();
}

export function fShortNumber(number) {
  return numeral(number).format('0,.[0000]');
}

export function fShortenNumber(number) {
  return replace(numeral(number).format('0.00a'), '.00', '');
}

export function fData(number) {
  return numeral(number).format('0.0 b');
}

export function numberWithCommas(x) {
    if (!isNullVal(x) && x !== '-') {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return x;
}

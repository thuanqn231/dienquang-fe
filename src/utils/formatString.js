import { isUndefined } from 'lodash-es';

export function toStringCaseCapitalize(string, separator = '_') {
  if (isUndefined(string)) {
    return '';
  }
  const sentence = string.toLowerCase().split(separator);
  for (let i = 0; i < sentence.length; i += 1) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }
  return sentence.join(' ');
}

export function capitalizeFirstChar([first, ...rest], lowerRest = false) {
  return first.toUpperCase() + (lowerRest ? rest.join('').toLowerCase() : rest.join(''));
}

export function getSafeValue(value) {
  return value ? value.toString().trim() : '';
}

export function emptyStringToSharp() {
  return '#';
}

export function getFactoryByPk(value) {
  const factoryPk = value.split('-');
  return value ? factoryPk[0] : '';
}

export function getFactoryAndIdByPk(value) {
  const factoryPk = value.split('-');
  const factoryCode = factoryPk[0] ? factoryPk[0] : '';
  const id = factoryPk[1] ? factoryPk[1] : '';
  return { factoryCode, id };
}

export function isNullPk(value) {
  if (value === 'null-null' || value === '' || isUndefined(value)) return true;
  return false;
}

export function isNullVal(value) {
  if (value === '' || isUndefined(value) || value === 'null' || value === null) return true;
  return false;
}

export function camalize(str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

import { format, formatDistanceToNow, getUnixTime, isValid, parse } from 'date-fns';
import { isUndefined, isEmpty, isNull } from 'lodash-es';
import DateFnsUtils from '@date-io/date-fns';
import moment from 'moment';

// ----------------------------------------------------------------------

export function fDate(date) {
  return isValidDate(date) ? format(new Date(date), 'yyyy-MM-dd') : '';
}

export function fTime(date) {
  return isValidDate(date) ? format(new Date(date), 'HH:mm:ss') : '';
}

export function fDateTime(date) {
  return isValidDate(date) ? format(new Date(date), 'yyyy-MM-dd HH:mm:ss') : '';
}

export function fDateTimeKR(date) {
  return format(new Date(date), 'dd MMM yyyy HH:mm:ss');
}

export function fDateTimeSuffix(date) {
  return isValidDate(date) ? format(new Date(date), 'yyyy-MM-dd hh:mm p') : '';
}

export function fToNow(date) {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true
  });
}
export function fToDate(date) {
  return isValidDate(date) ? format(new Date(date), 'yyyy-MM') : '';
}

export function fToUnixTime(date) {
  return getUnixTime(new Date(date));
}

export function fMonth(date) {
  return isValidDate(date) ? format(new Date(date), 'yyyy-MM') : '';
}


export function getCurrentDateTime() {
  const tzoffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
  return localISOTime;
}

export function getLocalDateTime(date) {
  if (isValidDate(date)) {
    const tzoffset = new Date(date).getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(new Date(date) - tzoffset).toISOString();
    return localISOTime;
  }
  return '';
}

export function isValidDate(date) {
  if (isUndefined(date) || date === '' || isNull(date) || date === 'Invalid Date' || !moment(date).isValid()) {
    return false;
  }
  return true;
}

export function jsDateToLocalISO8601DateString(date) {
  return [
    String(date.getFullYear()),
    String(101 + date.getMonth()).substring(1),
    String(100 + date.getDate()).substring(1)
  ].join('-');
}

export function dateStringToLocalDate(s) {
  if (!s) return null;
  return new DateFnsUtils().parse(s, 'yyyy-MM-dd');
}

export function fDateTimeToTime(date) {
  return isValidDate(date) ? format(new Date(date), 'hh:mm:ss') : '';
}

export function getLastWeekDate(now) {
  const offset = now.getTimezoneOffset();
  now = new Date(now.getTime() - offset * 60 * 1000);
  const lastWeekDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const [today] = now.toISOString().split('T');
  const [lastWeekDay] = lastWeekDate.toISOString().split('T');
  return {
    today,
    lastWeekDay
  };
}

export function getCurrentDate() {
  return format(new Date(getCurrentDateTime()), 'yyyy-MM-dd');
}

export function timeToSecond(time) {
  const [hour, minute, second] = time.split(':');
  return +hour * 60 * 60 + +minute * 60 + +second;
}

// steal from https://github.com/sindresorhus/pretty-bytes/blob/master/index.js

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export default function prettyBytes(n: number) {
  if (n < 1024) {
    return n + ' B';
  }
  const exponent = Math.min(Math.floor(Math.log(n) / Math.log(1024)), UNITS.length - 1);
  n = Number((n / Math.pow(1024, exponent)).toPrecision(3));
  const unit = UNITS[exponent];
  return n + ' ' + unit;
}

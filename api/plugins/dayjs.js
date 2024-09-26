const dayjs = require('dayjs');
require('dayjs/locale/ja');

let $dayjs = dayjs;
const isBetween = require('dayjs/plugin/isBetween');
const relativeTime = require('dayjs/plugin/relativeTime');

module.exports = (context, inject) => {
  context.$dayjs = dayjs;
  $dayjs = dayjs;
  $dayjs.locale('ja')
  $dayjs.extend(isBetween);
  $dayjs.extend(relativeTime);
  inject('dayjs', dayjs);
};

module.exports.$dayjs = $dayjs;
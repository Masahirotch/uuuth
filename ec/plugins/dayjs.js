import dayjs from 'dayjs'
import 'dayjs/locale/ja'

let $dayjs = dayjs
const isBetween = require('dayjs/plugin/isBetween')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.locale('ja')

export default (context, inject) => {
  context.$dayjs = dayjs
  $dayjs = dayjs
  $dayjs.extend(isBetween)
  $dayjs.extend(relativeTime)

  inject('dayjs', dayjs)
}

export { $dayjs }

const productFields = require('./productFields');
const productPriceFields = require('./productPriceFields');
const shopFields = require('./shopFields');
const userFields = require('./userFields');
const orderFields = require('./orderFields');
const channelTypes = require('./channelTypes');

module.exports = {
  ...productFields,
  ...productPriceFields,
  ...shopFields,
  ...userFields,
  ...orderFields,
  channelTypes,
};

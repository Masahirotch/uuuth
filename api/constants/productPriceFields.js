const OPTION = {
  salesChannel: {
    TO_B_NORMAL: 1,
    TO_B_SPOT: 2,
    TO_C: 4,
    TO_B_TO_C: 8,
  },
};

const LABEL = {
  salesChannel: {
    TO_B_NORMAL: 'toB(通常)',
    TO_B_SPOT: 'toB(スポット)',
    TO_C: 'toC',
    TO_B_TO_C: 'toBtoC',
  },
}

const PRODUCT_PRICE = {
  OPTION,
  LABEL
};

module.exports = {
  PRODUCT_PRICE
};
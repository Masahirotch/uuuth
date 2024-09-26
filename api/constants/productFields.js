const OPTION = {
  salesChannel: {
    TO_B_NORMAL: 1,
    TO_B_SPOT: 2,
    TO_C: 4,
    TO_B_TO_C: 8,
  },
  productPriceM: {
    NORMAL: 0,
    MARKET: 1,
  },
  productPriceS: {
    COMMON: 0,
    STORE_SPECIFIC: 1,
  },
  size: {
    LARGE: 'L',
    MEDIUM: 'M',
    SMALL: 'S',
  },
  shop: {
    ALL: 0,
    STORE_SPECIFIC: 1,
  },
  quantity: {
    NOT_SET: 0,
    SET: 1,
  },
  period: {
    NOT_SET: 0,
    SET: 1,
  },
  isOnsale: {
    SOLD_OUT: 0,
    ON_SALE: 1,
  },
  deleteFlg: {
    ACTIVE: 0,
    DISCONTINUED: 1,
  },
};

const LABEL = {
  salesChannel: {
    TO_B_NORMAL: 'toB(通常)',
    TO_B_SPOT: 'toB(スポット)',
    TO_C: 'toC',
    TO_B_TO_C: 'toBtoC',
  },
  productPriceM: {
    NORMAL: '通常価格',
    MARKET: '時価',
  },
  productPriceS: {
    COMMON: '共通価格商品',
    STORE_SPECIFIC: '店舗別価格商品',
  },
  size: {
    LARGE: 'L',
    MEDIUM: 'M',
    SMALL: 'S',
  },
  shop: {
    ALL: '全店舗',
    STORE_SPECIFIC: '店舗限定',
  },
  quantity: {
    NOT_SET: '未設定',
    SET: '設定',
  },
  period: {
    NOT_SET: '未設定',
    SET: '設定',
  },
  isOnsale: {
    SOLD_OUT: '販売休止',
    ON_SALE: '販売中',
  },
  deleteFlg: {
    ACTIVE: '現行商品',
    DISCONTINUED: '販売終了',
  },
}

const PRODUCT = {
  OPTION,
  LABEL
};

module.exports = {
  PRODUCT
};

const OPTION = {
  shopPickup: {
    NOT_ACCEPTABLE: 0,
    ACCEPTABLE: 1,
  },
  deleteFlg: {
    ACTIVE: 0,
    DISCONTINUED: 1,
  },
};

const LABEL = {
  shopPickup: {
    NOT_ACCEPTABLE: '受取不可',
    ACCEPTABLE: '受取可',
  },
  deleteFlg: {
    ACTIVE: '利用中',
    DISCONTINUED: '削除',
  },
}

const SHOP = {
  OPTION,
  LABEL
};

module.exports = {
  SHOP
};

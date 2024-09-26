const OPTION = {
  isParent: {
    NOT_SET: 0,
    SET: 1,
  },
  salesChannel: {
    TO_B_NORMAL: 1,
    TO_B_SPOT: 2,
    TO_B_TO_C: 8,
  },
  regist: {
    NOT_LINK: 0,
    LINKED: 1,
  },
  active: {
    SUSPENDED: 0,
    AVAILABLE: 1,
  },
  deleteFlg: {
    ACTIVE: 0,
    DISCONTINUED: 1,
  },
};

const LABEL = {
  isParent: {
    NOT_SET: '管理者',
    SET: '担当者',
  },
  salesChannel: {
    TO_B_NORMAL: 'toB(通常)',
    TO_B_SPOT: 'toB(スポット)',
    TO_B_TO_C: 'toBtoC',
  },
  regist: {
    NOT_LINK: '未',
    LINKED: '連携済',
  },
  active: {
    SUSPENDED: '利用停止',
    AVAILABLE: '利用可',
  },
  deleteFlg: {
    ACTIVE: '利用中',
    DISCONTINUED: '削除',
  },
}

const USER = {
  OPTION,
  LABEL
};

module.exports = {
  USER
};
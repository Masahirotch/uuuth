/* システム設定 */
const config = {
  //----- 全体 -----
  //使用する販売経路のアイコン（未使用時は空白）
  BtoB: 'mdi-alpha-b-box-outline', //通常卸売販売
  BtoBspot: 'mdi-alpha-s-box-outline', //スポット販売
  BtoC: 'mdi-alpha-c-box-outline', //卸元直販
  BtoBtoC: '', //販売店販売
  BtoBActive: 'mdi-alpha-b-box', //通常卸売販売
  BtoBspotActive: 'mdi-alpha-s-box', //スポット販売
  BtoCActive: 'mdi-alpha-c-box', //卸元直販
  BtoBtoCActive: '', //販売店販売
  //管理者の受注代行入力
  purchaseAdmin: false,
  //クーポンの利用
  coupon: false,
  //環境設定画面の利用(現在表示のみ)
  configsPage: false,
  //----- 商品 -----
  //商品グループの使用
  productGroup: false,
  //商品付加情報の使用（使用する場合は表示名を記載する）
  optInfo: {
    optInfo1: '',
    optInfo2: '',
    optInfo3: '',
  },
  //店舗限定機能の利用
  limited: false,
  //価格表示
  tax: '(税込)',
  //tax: '(＋税),
  //税率(1番目の要素が既定値)
  taxRates: [8, 10],
  //商品一覧検索の価格帯フィルター
  priceRange: {
    value: [[1, 200], [201, 500], [501, 1000], [1001, 3000], [3001, 9999999]],
    text: ['～￥200', '￥201～500', '￥501～￥1000', '￥1001～￥3000', '￥3001～'],
  },
  //----- 利用者 -----
  //店舗グループの使用
  shopGroup: false,
  //店舗受取(BtoBtoC == true の場合に有効)
  shopPickup: false,
  //締め時間の既定値(設定しない場合はnullとする)
  closingTime: '17:00',
  //店舗担当者の商品購入
  purchaseChild: false,
  //店舗別実績画面の利用
  sales: false,
  //----- 受注情報 -----
  //直近表示期間(日数)
  newest: 14,
  //その他費用の表示
  orderFee: '',
  //----- LINE配信 -----
  //LINE一斉配信時刻の既定値(設定しない場合はnullとする)
  messageTime: '09:00',
  //----- 管理情報 -----
  //配送料タブの表示値
  postageTab1: 'Ｓ サイズ (60)',
  postageTab2: 'Ｍ サイズ (100)',
  postageTab3: 'Ｌ サイズ (140)',
  //アプリのテーマ
  theme1: 'テーマ 1',
  theme2: 'テーマ 2',
  //注文受付の当日分締め時間
  minClosing: "00:00", //指定可能な最も早い時刻
  maxClosing: "23:59", //指定可能な最も遅い時刻
  productPriceM: process.env.PRODUCT_PRICE_M_SETTING == "true",
  showColumnAccessSetting: process.env.SHOW_COLUMN_ACCESS_SETTING == "true",
  addAccountPersonInChargeSetting: process.env.ADD_ACCOUNT_PERSON_IN_CHARGE_SETTING == "true",
  addAccountAdminSetting: process.env.ADD_ACCOUNT_ADMIN_SETTING == "true",
};

export default config;

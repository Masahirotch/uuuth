// //////////////////////////////////////////////////////////////////////////////
// 事前処理
// //////////////////////////////////////////////////////////////////////////////

// .env 読込
require("dotenv").config()

// Express 読込
const express = require(`express`)

const multer = require('multer')

const upload = multer()

const cors = require("cors")

// 暗号化モジュール読込（トークン生成用）
const crypto = require("crypto")

// ファイル処理モジュール読込
const fs = require("fs")

// 画像リサイズ処理モジュール読込
const sharp = require("sharp")

// LINE 処理用モジュール読込
const line = require("@line/bot-sdk")

// Sequelize 関連読込
const { Op } = require("sequelize")
const sequelize = require("sequelize")
const models = require("../models")

// ログ出力処理モジュール読込
const morganMiddleware = require("./morgan")
const log = require("./log")

// Csv support
const {stringify} = require('csv-stringify');
const jconv = require('jconv');
const {$dayjs} = require("../plugins/dayjs")
const isBetween = require('dayjs/plugin/isBetween')
$dayjs.extend(isBetween)
const _ = require('lodash');
const axios = require('axios');

const QRCode = require('qrcode');

// Express アプリケーション生成
const app = express()
// jsonをパースする際のlimitを設定
app.use(express.json({ extended: true, limit: "100mb" }))
// urlencodeされたボディをパースする際のlimitを設定
app.use(express.urlencoded({ extended: true, limit: "100mb" }))
// admin / info のみからのアクセスを許可
app.use(cors({ origin: [process.env.ADMIN_URL, process.env.INFO_URL, process.env.AEC_URL, process.env.EC_URL, process.env.B2B_URL] }))
// files ディレクトリを公開
app.use(express.static("files"))
// ロガーを使用
app.use(morganMiddleware)
// プロキシを信頼
app.set("trust proxy", "loopback")
// Constants
const constants = require("../constants")
const channelTypes = constants.channelTypes
// Cron job
const cron = require("node-cron")
// Run every minute
cron.schedule('* * * * *', sendLater);

// Helpers
const helper = require("../utils/helpers.js")

// Payment services
const paymentService = require('../services/paymentService.js')

// Validation
function validateRequest(schema) {
  return (req, res, next) => {
    const {error} = schema.validate(req.body, {abortEarly: false, allowUnknown: true});
    if (error) {
      const errors = error.details.map((detail) => {
        return message = detail.message.replace(/"/g, "");
      });
      return res.status(400).json({errors});
    }
    next();
  };
}

const bitsToArray = num => Array.from(num.toString(2)).reverse().map((digit, index) => digit === '1' ? 2 ** index : 0).filter(power => power !== 0);

// 日付フォーマット
const dateFormat = "yyyy-MM-dd hh:mm:ss"

// ==============================================================================
// 共通処理
// ==============================================================================
// ------------------------------------------------------------------------------
// JST を UTC に変換 TODO:この処理を Sequelize 側でできないか？／moment.js？要検討
// ------------------------------------------------------------------------------
const getUtcDate = (date) => {
  if (!date) return null
  return new Date(Date.parse(date) + 9 * 60 * 60 * 1000)
}

// ------------------------------------------------------------------------------
// UTC を JST に変換 TODO:この処理を Sequelize 側でできないか？／moment.js？要検討
// ------------------------------------------------------------------------------
const getJstDate = (date) => {
  if (!date) return null
  return new Date(Date.parse(date) - 9 * 60 * 60 * 1000)
}

// ------------------------------------------------------------------------------
// Date オブジェクトを指定フォーマットに変換
// ------------------------------------------------------------------------------
const getFormattedDate = (date, format) => {
  if (!date) return null
  let formatedDate = format.replace(/yyyy/g, date.getFullYear())
  formatedDate = formatedDate.replace(/MM/g, `0${date.getMonth() + 1}`.slice(-2))
  formatedDate = formatedDate.replace(/dd/g, `0${date.getDate()}`.slice(-2))
  formatedDate = formatedDate.replace(/hh/g, `0${date.getHours()}`.slice(-2))
  formatedDate = formatedDate.replace(/mm/g, `0${date.getMinutes()}`.slice(-2))
  formatedDate = formatedDate.replace(/ss/g, `0${date.getSeconds()}`.slice(-2))
  formatedDate = formatedDate.replace(/SSS/g, `00${date.getMilliseconds()}`.slice(-3))
  return formatedDate
}

const getUTCDateTime = (date = null) => {
  date = !date ? new Date() : new Date(date.toString())
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()))
}

// ------------------------------------------------------------------------------
// トークンを生成
// ------------------------------------------------------------------------------
const generateToken = (date) =>
  crypto.createHash("md5").update(getFormattedDate(date, "yyyy-MM-dd@hh:mm")).digest("hex")

// ------------------------------------------------------------------------------
// トークンを取得
// ------------------------------------------------------------------------------
app.post("/getToken", (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // トークン取得
    const token = generateToken(new Date())
    // Response 返却
    res.type("json")
    return res.status(200).send({ token })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// トークンを判定（分またぎを考慮）true:真正トークン／false:不正トークン
// ------------------------------------------------------------------------------
const isValidToken = (token) => {
  const now = new Date()
  const anMinuteAgo = new Date(now - 60 * 1000)
  return token === generateToken(now) || token === generateToken(anMinuteAgo)
}

// ------------------------------------------------------------------------------
// SequelizeInstance 配列をプレーンなオブジェクト配列に変換
// ------------------------------------------------------------------------------
const getPlainObjectArray = async (sequelizeInstanceArray) =>
  Promise.all(
    sequelizeInstanceArray.map(async (sequelizeInstance) => sequelizeInstance.get({ plain: true }))
  ).then((plainObjectArray) => plainObjectArray)

// //////////////////////////////////////////////////////////////////////////////
// ルーティング定義
// //////////////////////////////////////////////////////////////////////////////

// ==============================================================================
// products
// ==============================================================================

// ------------------------------------------------------------------------------
// 商品情報に対する変換処理
// ------------------------------------------------------------------------------
const convertProducts = (products) => {
  // 返却用変数
  const convertedProducts = products.map((product) => {
    // Sequelize Instance を Object 型に変換
    const convertedProduct = {}
    convertedProduct.productId = product.productId
    convertedProduct.productCode = product.productCode
    convertedProduct.productName = product.productName
    convertedProduct.productDetail = product.productDetail
    convertedProduct.productPhoto = product.productPhoto1
    convertedProduct.productPhoto1 = product.productPhoto2
    convertedProduct.productPhoto2 = product.productPhoto3
    convertedProduct.productPrice = product.productPriceB
    convertedProduct.productPriceBS = product.productPriceBS
    convertedProduct.isOnSale = product.isOnsale
    convertedProduct.quantity = 0
    convertedProduct.maxNum = product.maxNum
    convertedProduct.stock = product.stock || 0
    convertedProduct.isMax = product.quantity ? 1 : 0
    convertedProduct.isPeriod = product.period ? 1 : 0
    convertedProduct.start = getFormattedDate(getJstDate(product.start), dateFormat)
    convertedProduct.end = getFormattedDate(getJstDate(product.end), dateFormat)
    convertedProduct.unit = product.unit
    return convertedProduct
  })
  return convertedProducts
}

// クエリ文字列をエスケープする
function escapeQuery(query){
  if (!query) { return query }
  return query
    .replace(/\\/g, "\\\\")
    .replace(/\'/g, "\\\'")
    .replace(/\"/g, "\\\"")
    .replace(/\n/g, "\\\n")
    .replace(/\r/g, "\\\r")
    .replace(/\x00/g, "\\\x00")
    .replace(/\x1a/g, "\\\x1a")
}

/************************************
 * 
 * IDトークンを検証する ( https://developers.line.biz/ja/reference/line-login/#revoke-access-token )
 * 
 * POST https://api.line.me/oauth2/v2.1/verify
 * Content-Type : application/x-www-form-urlencoded
 * 
 * リクエストボディ
 * id_token  (必須) : IDトークン
 * client_id (必須) : チャネルID - LINEが発行した、チャネル固有の識別子。
 * nonce     (任意) : 認可リクエストに指定したnonceの値を指定します。認可リクエストでnonceの値を指定しなかった場合は省略します。
 * user_id   (任意) : ユーザーID
 * 
 * 
 * レスポンス
 * {
 * amr: ['linesso']
 * aud: "1656948912"
 * exp: 1657772973
 * iat: 1657769373
 * iss: "https://access.line.me"
 * name: {displayName}
 * picture: {user picture}
 * sub: {userId}
 * }
 * 
************************************/
async function verifyToken(id_token) {
  const posts = await new URLSearchParams();
  await posts.append('id_token', id_token)
  await posts.append('client_id', process.env.LOGIN_CHANNEL_ID)

  return await new Promise(async function (resolve) {
    await axios.post("https://api.line.me/oauth2/v2.1/verify", posts).then(function (result) {
      resolve(result.data)
    }).catch((err) => {
      resolve(err)
    })
  })
}

// ユーザーの存在をチェックする
async function userVerify ( userId ){
  try {
    const user = await models.users.findOne({ where: { userLine: userId, deleteFlg: 0 } })

    return user ? true : false
  } catch (err) {
    console.log(err);
    return false
  }
}

function number_format(value) {
  let formatter = new Intl.NumberFormat('ja-JP');
  return formatter.format(value);
}

async function weekdays( value ){
  var weeklist = await [ '日','月','火','水','木','金','土' ]
  return await weeklist[value]
}

/**
 * sendMultipleMessages
 * @param {int[]} shopIds shopCodes
 * @param {any} receipt Line Flex Message
 * @returns any
 */
async function sendMultipleMessages(shopIds, receipt) {

  const users = await models.users.findAll({
    attributes: [[sequelize.fn('DISTINCT', sequelize.col('userLine')), 'userLine']],
    where: {
      shopId: {
        [sequelize.Op.in]: shopIds,
      },
      userLine: {
        [Op.and] : {
          [sequelize.Op.not]: null,
          [sequelize.Op.notLike]: '',
        }
      },
      deleteFlg: 0,
    },
  });
  const userLines = await Promise.all(users.map(user => user.userLine))

  const config = getAppChannel(channelTypes.B2B) // b2b config channel

  const client = new line.Client(config)
  return await client.multicast(userLines, receipt)
}

async function createReceipt(order_id, auth, token = null) {
  const orderDb = await models.orders.findOne({
    attributes: {
      include: [
        [models.sequelize.literal("DATE_FORMAT(orders.orderDate, '%Y-%m-%d %H:%i')"), 'orderDate'],
        [models.sequelize.literal("DATE_FORMAT(orders.preferredDate, '%Y-%m-%d')"), 'preferredDate']
      ],
      // Exclude default rows
      exclude:['orderDate', 'preferredDate']
    },
    where: {
      orderId: order_id,
      userId: auth,
    },
    include: [
      {
        model: models.carts,
        where: {orderId: sequelize.col('orders.orderId')},
        include: [
          {
            model: models.products,
            required: false,
          }
        ],
        required: false,
      }
    ],
  });

  const user = await models.users.findOne({
    where: {
      userLine: auth,
      deleteFlg: 0,
    },
    include: [
      {
        model: models.shops,
        required: true,
        where: {
          deleteFlg: { [Op.eq]: constants.USER.OPTION.deleteFlg.ACTIVE },
        },
      },
    ],
  })

  const order = [{
    order_id: orderDb.orderId,
    user_id: orderDb.userId,
    shop_code: user.shop.shopCode,
    status: orderDb.status,
    deliv_date: orderDb.preferredDate,
    order_memo: orderDb.orderMemo,
    order_date: orderDb.orderDate,
  }]

  console.log(order)

  const cart = orderDb.carts.map((item) => {
    return {
      product_id: item.productId,
      order_id: orderDb.order_id,
      user_id: orderDb.userId,
      price: item.price,
      group_code: item.productGroup,
      product_code: item.productCode,
      product_name: item.productName,
      quantity: item.quantity,
      shop_code: user.shop.shopCode
    }
  });

  console.log(cart)

  var receipt = await {};
  var separator = await { "type": "separator", "margin": "xxl" };

  receipt.type = await 'bubble';
  receipt.styles = await { footer: { separator: true } };
  receipt.body = await { layout: 'vertical', type: 'box', contents: [] };
  receipt.body.contents[0] = await {
    type: 'text',
    text: `${process.env.APP_NAME} B2B Market.`,
    weight: 'bold',
    color: '#1DB446',
    size: 'sm'
  };
  receipt.body.contents[1] = await {
    type: 'text',
    text: 'ご注文内容',
    weight: 'bold',
    size: 'xl',
    margin: 'md'
  };
  receipt.body.contents[2] = await {
    type: 'text',
    text: 'ご注文ありがとうございます！',
    size: 'xs',
    color: '#aaaaaa',
    wrap: true
  };
  receipt.body.contents[3] = await separator;
  receipt.body.contents[4] = await {
    "type": "box",
    "layout": "vertical",
    "margin": "xxl",
    "spacing": "sm",
    contents: []
  };
  receipt.body.contents[5] = await separator;

  receipt.body.contents[6] = await {
    type: 'box',
    layout: 'horizontal',
    margin: 'md',
    contents: []
  };
  receipt.body.contents[6].contents[0] = await {
    type: 'text',
    text: '注文番号',
    size: 'xs',
    color: '#777777',
    flex: 0
  };
  receipt.body.contents[6].contents[1] = await {
    type: 'text',
    text: order_id,
    color: '#777777',
    size: 'xs',
    align: 'end'
  };

  let totalType = await 0;
  let totalQuantity = await 0;

  // 商品リスト
  const buyItems = await Promise.all(cart.map(async (c) => {
    totalQuantity += c.quantity;
    totalType += 1;

    return await {
      "type": "box",
      "layout": "vertical",
      "contents": [{
        "type": "text",
        "text": `${c.product_name} x ${c.quantity}`,
        "size": "sm",
        "color": "#555555",
        "flex": 0,
        "wrap": true
      }
      ]
    };
  }));

  var totals = await [];

  // 商品合計点数
  await totals.push({
    "type": "box",
    "layout": "horizontal",
    "margin": "xxl",
    "contents": [{
      "type": "text",
      "text": "注文点数",
      "size": "sm",
      "color": "#555555",
      "flex": 0
    },
      {
        "type": "text",
        "text": number_format(totalType) + "種 / " + number_format(totalQuantity) + "点",
        "size": "sm",
        "color": "#111111",
        "align": "end",
        "weight": "bold"
      }
    ]
  });

  // 注文日時
  await totals.push({
    "type": "box",
    "layout": "horizontal",
    "margin": "xxl",
    "contents": [{
      "type": "text",
      "text": "注文日時",
      "size": "sm",
      "color": "#555555",
      "flex": 0
    },
      {
        "type": "text",
        "text": $dayjs(order[0].order_date).format('YYYY-MM-DD HH:mm'),
        "size": "sm",
        "color": "#111111",
        "align": "end",
        "weight": "bold"
      }
    ]
  });

  // 注文者
  const verify = await verifyToken(token);
  // push message of orderer to contents
  await totals.push({
    "type": "box",
    "layout": "horizontal",
    "contents": [{
      "type": "text",
      "text": "注文者",
      "size": "sm",
      "color": "#555555",
      "flex": 0
    },
      {
        "type": "text",
        "text": verify?.name ?? 'No name',
        "size": "sm",
        "color": "#111111",
        "align": "end",
        "weight": "bold"
      }
    ]
  });

  // 配達予定日時
  var delivday = await $dayjs(order[0].deliv_date).format('YYYY-MM-DD');
  var weekday = await weekdays($dayjs(order[0].deliv_date).day());

  await totals.push({
    "type": "box",
    "layout": "horizontal",
    "contents": [{
      "type": "text",
      "text": "配達予定日",
      "size": "sm",
      "color": "#555555",
      "flex": 0
    },
      {
        "type": "text",
        "text": `${delivday} (${weekday})`,
        "size": "sm",
        "color": "#111111",
        "align": "end",
        "weight": "bold"
      }
    ]
  });

  var body = await [...buyItems, ...[separator], ...totals];
  receipt.body.contents[4].contents = await body;

  if (order[0].order_memo != void 0 && order[0].order_memo != '') {
    return await [{
      "type": "flex",
      "altText": "オーダーの通知",
      "contents": receipt
    },
      {
        "type": "text",
        "text": `【MEMO】\n\n${order[0].order_memo}`
      },
    ];
  } else {
    return await [{
      "type": "flex",
      "altText": "オーダーの通知",
      "contents": receipt
    }];
  }
}

// ------------------------------------------------------------------------------
// [INFO] 商品一覧取得
// ------------------------------------------------------------------------------
app.post("/info/products", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 全商品取得
    const propertyMapping = {
      productPhoto: "productPhoto1",
      productPriceBS: "productPriceBS",
      isMax: "quantity",
      isPeriod: "period",
    };

    const paging = req.body?.paging ?? true;

    if (req.body.order_by?.order) {
      req.body.order_by.order = req.body.order_by.order.map(([property, direction]) => [propertyMapping[property] || property, direction]);
    }

    let options = {
      order: req.body.order_by?.order || [],
      where: {
        isOnsale: 1,
        deleteFlg: 0,
        [Op.and]: [
          models.sequelize.literal(`salesChannel & b'0010' > 0`),
        ],
      },
    };


    const totalCount = await models.products.count(options);

    const currentPage = +req.body.currentPage || 1;
    const perPage = +req.body.perPage || +process.env.SPOT_PER_PAGE || 15;

    if (paging) {
      options.offset = (currentPage - 1) * perPage;
      options.limit = perPage;
    }

    const foundProducts = await models.products.findAll(options);

    // 全商品を素のオブジェクトに変換
    const plainProducts = await getPlainObjectArray(foundProducts)
    // 1/0 → true/false 変換
    const serverUrl = `${req.protocol}://${req.get('host')}`
    plainProducts.map(function (p){
      p.productPhoto1 = `${serverUrl}/aec/product-images/${p.productPhoto1}/file?type=origin`
      p.productPhoto2 = `${serverUrl}/aec/product-images/${p.productPhoto2}/file?type=origin`
      p.productPhoto3 = `${serverUrl}/aec/product-images/${p.productPhoto3}/file?type=origin`
      return p;
    })
    const products = convertProducts(plainProducts)
    // Response 返却
    res.type("json")
    if (paging) {
      return res.status(200).send({products, perPage, currentPage, totalProduct: totalCount})
    }
    return res.status(200).send({ products, totalProduct: totalCount })
  } catch (err) {
    log.error(req, err)
    console.log(err);
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// [INFO] 商品追加
// ------------------------------------------------------------------------------
app.post("/addProduct", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 商品追加
    req.body.new_product.start = req.body.new_product.start
      ? getUtcDate(req.body.new_product.start)
      : null
    req.body.new_product.end = req.body.new_product.end
      ? getUtcDate(req.body.new_product.end)
      : null
    await models.products.create(req.body.new_product)
    // 全商品取得
    const foundProducts = await models.products.findAll()
    // 全商品を素のオブジェクトに変換
    const plainProducts = await getPlainObjectArray(foundProducts)
    // 1/0 → true/false 変換
    const products = convertProducts(plainProducts)
    // Response 返却
    res.type("json")
    return res.status(200).send({ products })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// [INFO] 商品更新
// ------------------------------------------------------------------------------
app.post("/updateProduct", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 更新対象の商品を取得
    req.body.set_product.start = req.body.set_product.start
      ? getUtcDate(req.body.set_product.start)
      : null
    req.body.set_product.end = req.body.set_product.end
      ? getUtcDate(req.body.set_product.end)
      : null
    const product = await models.products.findOne({
      where: { productId: req.body.product_id },
    })
    product.set(req.body.set_product)
    await product.save()
    // 全件取得
    const foundProducts = await models.products.findAll()
    // 全商品を素のオブジェクトに変換
    const plainProducts = await getPlainObjectArray(foundProducts)
    // 1/0 → true/false 変換
    const products = convertProducts(plainProducts)
    // Response 返却
    res.type("json")
    return res.status(200).send({ products })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ==============================================================================
// ouentai_products
// ==============================================================================

// ------------------------------------------------------------------------------
// [応援隊] 商品一覧取得
// ------------------------------------------------------------------------------
app.post("/getOuentaiProducts", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.OUENTAI_TOKEN) return res.status(401).send()
    // 全商品取得
    const foundOuentaiProducts = await models.ouentai_products.findAll()
    // 全商品を素のオブジェクトに変換
    const plainOuentaiProducts = await getPlainObjectArray(foundOuentaiProducts)
    // 1/0 → true/false 変換
    const ouentaiProducts = convertProducts(plainOuentaiProducts)
    // Response 返却
    res.type("json")
    return res.status(200).send({ ouentaiProducts })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// [応援隊] 商品追加
// ------------------------------------------------------------------------------
app.post("/addOuentaiProduct", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.OUENTAI_TOKEN) return res.status(401).send()
    // 商品追加
    req.body.new_ouentai_product.start = req.body.new_ouentai_product.start
      ? getUtcDate(req.body.new_ouentai_product.start)
      : null
    req.body.new_ouentai_product.end = req.body.new_ouentai_product.end
      ? getUtcDate(req.body.new_ouentai_product.end)
      : null
    await models.ouentai_products.create(req.body.new_ouentai_product)
    // 全商品取得
    const foundOuentaiProducts = await models.ouentai_products.findAll()
    // 全商品を素のオブジェクトに変換
    const plainOuentaiProducts = await getPlainObjectArray(foundOuentaiProducts)
    // 1/0 → true/false 変換
    const ouentaiProducts = convertProducts(plainOuentaiProducts)
    // Response 返却
    res.type("json")
    return res.status(200).send({ ouentaiProducts })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// [応援隊] 商品更新
// ------------------------------------------------------------------------------
app.post("/updateOuentaiProduct", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.OUENTAI_TOKEN) return res.status(401).send()
    // 更新対象の商品を取得
    req.body.set_ouentai_product.start = req.body.set_ouentai_product.start
      ? getUtcDate(req.body.set_ouentai_product.start)
      : null
    req.body.set_ouentai_product.end = req.body.set_ouentai_product.end
      ? getUtcDate(req.body.set_ouentai_product.end)
      : null
    const ouentaiProduct = await models.ouentai_products.findOne({
      where: { productId: req.body.ouentai_product_id },
    })
    ouentaiProduct.set(req.body.set_ouentai_product)
    await ouentaiProduct.save()
    // 全件取得
    const foundOuentaiProducts = await models.ouentai_products.findAll()
    // 全商品を素のオブジェクトに変換
    const plainOuentaiProducts = await getPlainObjectArray(foundOuentaiProducts)
    // 1/0 → true/false 変換
    const ouentaiProducts = convertProducts(plainOuentaiProducts)
    // Response 返却
    res.type("json")
    return res.status(200).send({ ouentaiProducts })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ==============================================================================
// users
// ==============================================================================

// ------------------------------------------------------------------------------
// user の 1/0 を true/false に変換
// ------------------------------------------------------------------------------
const convertUser = (user, all) => {
  const convertedUser = {}
  Object.assign(convertedUser, user)
  convertedUser.flg_active = !!user.flg_active
  convertedUser.flg_1 = !!user.flg_1
  convertedUser.flg_2 = !!user.flg_2
  convertedUser.flg_3 = !!user.flg_3
  convertedUser.flg_4 = !!user.flg_4
  convertedUser.flg_5 = !!user.flg_5
  if (all) {
    convertedUser.regist = !!user.regist
    convertedUser.isParent = !!user.isParent
  }
  return convertedUser
}

// ------------------------------------------------------------------------------
// 親ユーザに属する子を取得
// ------------------------------------------------------------------------------
const getChildUsers = async (parentUser) => {
  // 親ユーザに属する全子ユーザ取得
  const foundChildUsers = await models.users.findAll({
    where: { isParent: 0, shopId: parentUser.shopId },
  })
  // 子ユーザに対する変換処理
  const plainChildUsers = await getPlainObjectArray(foundChildUsers)
  const convertedChildUsers = plainChildUsers.map((plainChildUser) => convertUser(plainChildUser))
  return convertedChildUsers
}

// ------------------------------------------------------------------------------
// 親ユーザに対する変換処理
// ------------------------------------------------------------------------------
const convertParentUsers = async (parentUsers) =>
  Promise.all(
    parentUsers.map(async (parentUser) => {
      const convertedParentUser = convertUser(parentUser, false)
      convertedParentUser.child = await getChildUsers(convertedParentUser)
      convertedParentUser.isView = true
      return convertedParentUser
    })
  ).then((convertedParentUsers) => convertedParentUsers)

// ------------------------------------------------------------------------------
// 親ユーザ一覧取得
// ------------------------------------------------------------------------------
app.post("/getParentUsers", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 全親ユーザ取得
    const foundParentUsers = await models.users.findAll({ where: { isParent: 1 } })
    // 全親ユーザを素のオブジェクトに変換
    const plainParentUsers = await getPlainObjectArray(foundParentUsers)
    // 親ユーザに対する変換処理
    const parentUsers = await convertParentUsers(plainParentUsers)
    // Response 返却
    res.type("json")
    return res.status(200).send({ parentUsers })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// ユーザ取得または追加
// ------------------------------------------------------------------------------
app.post("/findUser", async (req, res) => {
  try {
    // ログ出力
    log.user(req)
    const { token, userId} = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()
    // ユーザが存在しなければ追加
    let user = await models.users.findOne({ 
      include: [{ 
        model: models.shops, 
        required: true,
        where: {deleteFlg: 0}
      }], where: { 
        userLine: userId,
        deleteFlg: 0,
        [Op.and]: [
          models.sequelize.literal(`salesChannel & b'0010' > 0`),
        ],
      }})

    
    if(user){
      const shopId = user.shopId
      user = {
        userId: user.userLine,
      regist: user.regist,
        bizName: user.shop?.bizName,
        shopName: user.shop?.shopName,
        ordererName: user.ordererName,
        shop_tel: user.shop?.shopTel,
        manager: null,
        user_tel: user.userTel,
        displayName: user.userName,
      flg_active: user.active,
      flg_1: 0,
      flg_2: 0,
      flg_3: 0,
      flg_4: 0,
      flg_5: user.purchase,
      shopCode: user.shop?.shopCode,
        isParent: user.isParent,
        parentID: null
      }
      if (!user.isParent) {
        const parent = await models.users.findOne({
          attributes: ['userId', 'userName'],
        where: { shopId, isParent: 1, deleteFlg: 0 } })
      if(parent){
        user.manager = parent.userName
          user.parentID = parent.userId
        }
      }
    }
    return res.status(200).json({ user })
  } catch (err) {
    log.error(req, err)
    console.log(err);
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// 該当ユーザ取得
// ------------------------------------------------------------------------------
app.post("/getUsers", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()

    let users = []

    const propertyMapping = {
      ID: 'userID',
      userId: "userLine",
      bizName: "$shop.bizName$",
      user_tel: "userTel",
      shop_tel: '$shop.shopTel$',
      shopCode: '$shop.shopCode$',
      displayName: 'userName',
      flg_active: 'active'
    };

    // 取得条件の設定
    let condition
    if (req.body.where) {
      condition = { where: req.body.where }
    } else if (req.body.where_flg) {
      condition = {
        where: {
          flg_active: req.body.where_flg.flg_active
        },
      }
    } else {
      condition = {}
    }

    if (condition?.where) {
      condition.where = _.mapKeys(condition.where, (value, key) => {
        return propertyMapping[key] || key;
      });

      condition.where = {
        ...condition.where,
        deleteFlg: 0,
        [Op.and]: [
          models.sequelize.literal(`salesChannel & b'0010' > 0`),
        ],
      }
    }
    condition['include'] = [{
      model: models.shops,
      required: true,
      as: 'shop',
      where: {deleteFlg: 0}
    }]
    
    // 全親ユーザ取得
    users = await models.users.findAll(condition)

    let foundUsers = []
    for (const user of users) {
      let parent = null
      if (!user.isParent) {
        parent = await models.users.findOne({ where: { shopId: user.shopId, isParent: 1, deleteFlg: 0 } })
      }
      const convertUser = {
        userId: user.userLine,
        regist: user.regist,
        bizName: user.shop?.bizName,
        shop_tel: user.shop?.shopTel,
        manager: parent?.userName || null,
        user_tel: user.userTel,
        displayName: user.userName,
        flg_active: user.active,
        flg_1: 0,
        flg_2: 0,
        flg_3: 0,
        flg_4: 0,
        flg_5: user.purchase,
        shopCode: user.shop?.shopCode,
        isParent: user.isParent,
        parentID: parent?.userId || null,
      }
      foundUsers.push(convertUser)
    }

    // Response 返却
    res.type("json")
    return res.status(200).send({ foundUsers })
  } catch (err) {
    log.error(req, err)
    console.log(err);
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// ユーザ更新
// ------------------------------------------------------------------------------
app.post("/updateUser", async (req, res) => {
  const t = await models.sequelize.transaction()
  try {
    // ログ出力
    log.user(req)
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 更新対象のユーザを取得
    let user = await models.users.findOne({
      include: [
        {
          model: models.shops,
          required: true,
        }
      ],
      where: { userLine: req.body.userId, deleteFlg: 0},
    })
    const setUser = req.body.set_user

    if (setUser.displayName) {
      user.set({ userName: setUser.displayName });
    }

    if (setUser.ordererName) {
      user.set({ ordererName: setUser.ordererName });
    }

    user.set({ userTel: setUser.user_tel})
    await user.save({ transaction: t })

    // update parent name (manager)
    const parent = await models.users.findOne({ where: { shopId: user.shopId, isParent: 1 } })
    if (parent && setUser?.manager) {
      parent.set({ userName: setUser.manager })
      parent.save({ transaction: t })
    }

    // update shop
    await models.shops.update({ bizName: setUser.bizName, shopTel: setUser.shop_tel }, { where: { shopId: user.shopId }, transaction: t })

    // 全親ユーザ取得
    const foundParentUsers = await models.users.findAll({ where: { isParent: 1 } })
    // 全親ユーザを素のオブジェクトに変換
    const plainParentUsers = await getPlainObjectArray(foundParentUsers)
    // 親ユーザに対する変換処理
    const parentUsers = await convertParentUsers(plainParentUsers) 

    // convert response user data
    user = {
      userId: req.body.userId,
      regist: user.regist,
      bizName: setUser.bizName,
      shop_tel: setUser.shop_tel,
      shopName: user.shop?.shopName,
      manager: setUser.manager,
      user_tel: setUser.user_tel,
      displayName: setUser?.displayName,
      ordererName: setUser?.ordererName,
      flg_active: user.active,
      flg_1: 0,
      flg_2: 0,
      flg_3: 0,
      flg_4: 0,
      flg_5: user.purchase,
      shopCode: user.shop?.shopCode || null,
      isParent: user.isParent,
      parentID: parent?.userId || null,
    }

    await t.commit();
    // Response 返却
    res.type("json")
    return res.status(200).send({ user, parentUsers })
  } catch (err) {
    await t.rollback()
    log.error(req, err)
    console.log(err);
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// ユーザ削除
// ------------------------------------------------------------------------------
app.post("/deleteUser", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 指定ユーザ削除
    await models.users.destroy({ where: { ID: req.body.ID } })
    // 全親ユーザ取得
    const foundParentUsers = await models.users.findAll({ where: { isParent: 1 } })
    // 全親ユーザを素のオブジェクトに変換
    const plainParentUsers = await getPlainObjectArray(foundParentUsers)
    // 親ユーザに対する変換処理
    const parentUsers = await convertParentUsers(plainParentUsers)
    // Response 返却
    res.type("json")
    return res.status(200).send({ parentUsers })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ==============================================================================
// info_orders
// ==============================================================================

// ------------------------------------------------------------------------------
// オーダ情報に対する変換処理
// ------------------------------------------------------------------------------
const convertInfoOrders = async (infoOrders) => {
  // 変換後の値を格納・返却するオブジェクト
  const convertedInfoOrders = {}
  // 最古オーダ日付取得
  const startDate = new Date(getFormattedDate(getJstDate(infoOrders[0].orderDate), dateFormat))
  // 最新オーダ日付取得
  const endDate = new Date(
    getFormattedDate(getJstDate(infoOrders[infoOrders.length - 1].orderDate), dateFormat)
  )
  // 名称「YYYY-MM」のプロパティを追加
  for (
    let iDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1, 0, 0, 0);
    iDate <= endDate;
    iDate.setMonth(iDate.getMonth() + 1)
  ) {
    convertedInfoOrders[getFormattedDate(iDate, "yyyy-MM")] = []
  }
  // オーダのループ処理
  // TODO: N+1問題解消 → https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/
  await Promise.all(
    infoOrders.map(async (infoOrder) => {
      const objInfoOrder = JSON.parse(JSON.stringify(infoOrder))
      objInfoOrder.isView = true
      const user = await models.users.findOne({
        where: { userId: infoOrder.userId },
      })
      // ユーザ情報をオーダに追加
      objInfoOrder.user = user.get({ plain: true })
      if (!user) {
        // TODO: userId が存在しなかった場合を考慮するべき（以下は仮）
        objInfoOrder.user = null
        objInfoOrder.parent = null
      } else if (user.isParent === 0 && user.parentID) {
        // 自身が子ユーザならば親ユーザ情報を追加
        const parentUser = await models.users.findOne({
          where: { ID: user.parentID },
        })
        // 親ユーザ情報をオーダに追加
        objInfoOrder.parent = parentUser.get({ plain: true })
      } else {
        // 自身が子ユーザでなければ親ユーザ情報は null
        objInfoOrder.parent = null
      }
      objInfoOrder.orderArray = JSON.parse(infoOrder.orderArray)
      objInfoOrder.orderDate = getFormattedDate(getJstDate(infoOrder.orderDate), dateFormat)
      objInfoOrder.deliveryDate = getFormattedDate(getJstDate(infoOrder.deliveryDate), dateFormat)
      delete objInfoOrder.userId // オリジナルの API に合わせるため削除（残しても問題ないかも？）
      // ----------------------------------------------
      // 旧 API と比較可能な並び順に変更する場合に実行 ↓
      // ----------------------------------------------
      // delete infoOrder.dataValues.userId
      // const objectOrder = {
      //   isView: null,
      //   order_id: null,
      //   user: null,
      //   parent: null,
      //   orderArray: null,
      //   orderNum: null,
      //   orderDate: null,
      //   deliveryDate: null,
      // }
      // infoOrder = Object.assign(objectOrder, infoOrder.dataValues);
      // ----------------------------------------------
      // 自身の YYYY-MM に合致するプロパティに格納
      convertedInfoOrders[objInfoOrder.orderDate.slice(0, 7)].push(objInfoOrder)
    })
  )
  const sortedInfoOrders = {}
  await Promise.all(
    Object.entries(convertedInfoOrders).map(async ([key, value]) => {
      sortedInfoOrders[key] = await value.sort((a, b) => a.order_id - b.order_id)
    })
  )
  return sortedInfoOrders
}

// ------------------------------------------------------------------------------
// オーダ一覧取得
// ------------------------------------------------------------------------------
app.post("/getInfoOrders", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 全オーダ取得
    const foundInfoOrders = await models.info_orders.findAll({
      order: [["orderDate", "ASC"]],
    })
    // 全オーダを素のオブジェクトに変換
    const plainInfoOrders = await getPlainObjectArray(foundInfoOrders)
    // オーダに対する変換処理
    const infoOrders = await convertInfoOrders(plainInfoOrders)
    // Response 返却
    res.type("json")
    return res.status(200).send({ infoOrders })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// オーダ追加
// ------------------------------------------------------------------------------
app.post("/addInfoOrder", async (req, res) => {
  const t = await models.sequelize.transaction()
  try {
    // ログ出力
    log.order(req, null)
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()

    let order = req.body.new_info_order || {}
    const perPage = +req.body.perPage || +process.env.SPOT_PER_PAGE || 15
    const currentPage = +req.body.currentPage || 1

    const offset = (currentPage - 1) * perPage

    // オーダ追加
    order.orderDate = order.orderDate ? getUtcDate(order.orderDate) : null
    order.deliveryDate = order.deliveryDate ? getUtcDate(order.deliveryDate) : null
    let errorMessage = null

    const user = await models.users.findOne({
      where: {
        userLine: order?.userId || null,
        deleteFlg: 0,
      },
      include: [
        {
          model: models.shops,
          required: true,
          where: {
            deleteFlg: 0,
          },
        },
      ],
    })

    let totalProductPrice = 0;
    order?.orderArray?.forEach(item => {
      totalProductPrice += item.productPriceBS * item.quantity;
    });

    const newInfoOrder = {
      orderId: order?.orderId || null,
      todo: order?.todo || 0,
      status: order?.status || 'new',
      orderDate: getUTCDateTime(order?.orderDate || null),
      salesChannel: 2,
      userId: order?.userId || null,
      ordererId: user?.userId || null,
      userName: user?.ordererName || user?.userName || null,
      orderNum: order.orderNum,
      cartPrice: totalProductPrice || order?.cartPrice || 0,
      discount: order?.discount || 0,
      shippingFee: order?.shippingFee || 0,
      orderFee: order?.orderFee || 0,
      payment: totalProductPrice || order?.payment || 0,
      paymentMethod: order?.paymentMethod || 'card',
      order_stripe_id: order?.order_stripe_id || null,
      orderMemo: order?.orderMemo || null,
      addressId: user?.shop?.addressId || null,
      deliveryMethod: order?.deliveryMethod || '宅配',
      preferredDate: order?.preferredDate || null,
      preferredTime: order?.preferredTime || null,
      deliveryDay: order?.deliveryDay || null,
      shipNumber: order?.shipNumber || null,
      appId: order?.appId || null,
      shopuserId: order?.shopuserId || null
    };

    const [createdOrder, created] = await models.orders.upsert(newInfoOrder, {
      transaction: t,
    })

    // delete all carts of this order
    await models.carts.destroy({
      where: { orderId: createdOrder.orderId },
      transaction: t
    })

    let carts = [];

    for (const item of order.orderArray) {
      if (item?.quantity || 0) {
        carts.push({
          cartId: item?.cartId || null,
          orderId: createdOrder.orderId,
          productId: item.productId,
          productCode: item?.productCode || null,
          productName: item.productName,
          price: item.productPriceBS,
          quantity: item.quantity,
        });
      }
    }

    await models.carts.bulkCreate(carts, {
      updateOnDuplicate: ['productName', 'price', 'quantity'],
      transaction: t,
    })

    // cart の中身でループ
    for (const infoProduct of (order?.orderArray || [])) {
      // isMax = 1 の商品ならば、DB から現在の stock を取得し、( stock - quantity ) の値を算出
      // period = 1 & not (start < now < end) or deleteFlg = 1 or isOnsale = 0
      const product = !infoProduct.quantity ? null : await models.products.findOne({
        attributes: {
          include: [
            [models.sequelize.literal("DATE_FORMAT(products.start, '%Y-%m-%d %H:%i')"), 'start'],
            [models.sequelize.literal("DATE_FORMAT(products.end, '%Y-%m-%d %H:%i')"), 'end'],
          ],
          // Exclude default rows
          exclude:[ 'start', 'end', ]
        },
        where: { 
          productId: infoProduct.productId,
          [Op.or]: [
            {deleteFlg: 1},
            {isOnsale: {[Op.ne]: 1}},
            {quantity: 1},
            {period: 1}
          ],
        }
      })
      if (product) {
        if (product.deleteFlg == 1) {
          errorMessage = `「${product.productName}」商品は存在しません`;
          break;
        }
        if (!product.isOnsale) {
          errorMessage = `「${product.productName}」商品は販売停止となりました `;
          break;
        }
        if (product.quantity == 1) {
          if (product.stock < infoProduct.quantity) {
            // 数量限定商品であり、かつ stock が quantity 未満ならば（＝注文数分の在庫がすでになければ）処理中断
            errorMessage = `「${product.productName}」の注文数「${infoProduct.quantity}」に対して在庫数「${product.stock}」のため、在庫不足で注文に失敗しました。カートを閉じて最新の在庫数をご確認ください。`;
            break;
          } else {
            // stock が quantity 以上ならば（＝注文数分の在庫があるならば）stock を更新
            product.stock -= infoProduct.quantity
            await product.save({ transaction: t })
          }
        }
        if (product.period == 1 && !$dayjs(new Date()).isBetween(product.start, product.end)) {
          errorMessage = `「${product.productName}」商品は有効期限が切れています`;
          break;
        }
      }
    }
    const serverUrl = `${req.protocol}://${req.get('host')}`
    if (errorMessage) {
      // ログ出力
      log.order(req, errorMessage)
      // ロールバック
      await t.rollback()
      // エラー処理
      const foundProducts = await models.products.findAll({
        order: [["productId", "DESC"]],
        where: {
          isOnsale: 1,
          deleteFlg: 0,
          [Op.and]: [
            models.sequelize.literal(`salesChannel & b'0010' > 0`),
          ]
        },
        offset, limit: perPage
      })
      // 全商品を素のオブジェクトに変換
      const plainProducts = await getPlainObjectArray(foundProducts)
      // 1/0 → true/false 変換
      const products = convertProducts(plainProducts)
      products.map(function (p){
        p.productPhoto = `${serverUrl}/aec/product-images/${p.productPhoto}/file?type=origin`
        return p;
      })
      // Response 返却
      res.type("json")
      return res.status(200).send({
        message: errorMessage,
        products,
        currentPage,
        perPage
      })
    }
    // コミット
    await t.commit()
    // 正常処理
    const foundProducts = await models.products.findAll({
      order: [["productId", "DESC"]],
      where: {
        isOnsale: 1,
        deleteFlg: 0,
        [Op.and]: [
          models.sequelize.literal(`salesChannel & b'0010' > 0`),
        ]
      },
      offset, limit: perPage
    })
    // 全商品を素のオブジェクトに変換
    const plainProducts = await getPlainObjectArray(foundProducts)
    // 1/0 → true/false 変換
    const products = convertProducts(plainProducts)
    products.map(function (p){
      p.productPhoto = `${serverUrl}/aec/product-images/${p.productPhoto}/file?type=origin`
      return p;
    })
    // Response 返却
    res.type("json")
    return res.status(200).send({
      result: 1,
      products,
      currentPage,
      perPage
    })
  } catch (err) {
    // ロールバック
    await t.rollback()
    log.error(req, err)
    return res.status(500).send()
  }
})

// ==============================================================================
// messages
// ==============================================================================

// ------------------------------------------------------------------------------
// メッセージに対する変換処理
// ------------------------------------------------------------------------------
const convertMessages = async (messages, getFlg) =>
  Promise.all(
    messages.map(async (message) => {
      const convertedMessage = {}
      Object.assign(convertedMessage, message)
      convertedMessage.createDate = getFormattedDate(getJstDate(message.createDate), dateFormat)
      if (getFlg) convertedMessage.messages = JSON.parse(message.messages)
      if (getFlg) convertedMessage.destinationTo = JSON.parse(message.destinationTo)
      convertedMessage.lastSendDate = getFormattedDate(getJstDate(message.lastSendDate), dateFormat)
      convertedMessage.reservation = getFormattedDate(getJstDate(message.reservation), dateFormat)
      return convertedMessage
    })
  )

// ------------------------------------------------------------------------------
// メッセージ一覧取得
// ------------------------------------------------------------------------------
app.post("/getMessages", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // 全オーダ取得
    const foundMessages = await models.messages.findAll({
      where: { delFlg: 0 },
    })
    // メッセージをプレーンオブジェクトに変換
    const plainMessages = await getPlainObjectArray(foundMessages)
    // メッセージに対する変換処理
    const messages = await convertMessages(plainMessages, true)
    // Response 返却
    res.type("json")
    return res.status(200).send({ messages })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// メッセージ追加
// ------------------------------------------------------------------------------
app.post("/addMessage", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    // メッセージ追加
    req.body.set_message.createDate = getUtcDate(req.body.set_message.createDate)
    req.body.set_message.lastSendDate = req.body.set_message.lastSendDate
      ? getUtcDate(req.body.set_message.lastSendDate)
      : null
    req.body.set_message.reservation = req.body.set_message.reservation
      ? getUtcDate(req.body.set_message.reservation)
      : null
    const newMessage = await models.messages.create(req.body.set_message)
    // メッセージをプレーンオブジェクトに変換
    const [plainMessage] = await getPlainObjectArray([newMessage])
    // このままだと ID が null なので格納
    const maxID = await models.messages.max("ID")
    plainMessage.ID = maxID
    // メッセージに対する変換処理
    const [message] = await convertMessages([plainMessage], false)
    // Response 返却
    res.type("json")
    return res.status(200).send({ message })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// メッセージ更新
// ------------------------------------------------------------------------------
app.post("/updateMessage", async (req, res) => {
  try {
    // Token 確認
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()
    req.body.set_message.createDate = getUtcDate(req.body.set_message.createDate)
    req.body.set_message.lastSendDate = req.body.set_message.lastSendDate
      ? getUtcDate(req.body.set_message.lastSendDate)
      : null
    req.body.set_message.reservation = req.body.set_message.reservation
      ? getUtcDate(req.body.set_message.reservation)
      : null
    // 該当メッセージがなければ追加／あれば更新
    // 更新対象のメッセージを取得
    const foundMessage = await models.messages.findOne({
      where: { ID: req.body.message_id },
    })
    req.body.set_message.createDate = foundMessage.createDate
    foundMessage.set(req.body.set_message)
    await foundMessage.save()
    // メッセージをプレーンオブジェクトに変換
    const [plainMessage] = await getPlainObjectArray([foundMessage])
    // メッセージに対する変換処理
    const [message] = await convertMessages([plainMessage], false)
    // Response 返却
    res.type("json")
    return res.status(200).send({ message })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ==============================================================================
// LINE Messaging API
// ==============================================================================

// ------------------------------------------------------------------------------
// LINE 複数ユーザにテキスト送信
// ------------------------------------------------------------------------------
app.post("/PUSH/multicast", async (req, res) => {
  try {
    // ログ出力
    log.message(req)
    // トークン確認
    if (!isValidToken(req.body.token)) return res.status(401).send()
    // LINE Messaging API 読込
    const { config } = req.body
    const client = new line.Client(config)
    const multicast = async (userId, message) => {
      try {
        await client.multicast(userId, message)
        return null
      } catch (error) {
        return error
      }
    }
    const error = await multicast(req.body.userId, req.body.messages)
    if (error) throw error
    // Response 返却
    res.type("json")
    return res.status(200).send({ result: "OK" })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// ==============================================================================
// CDN 処理
// ==============================================================================

// ------------------------------------------------------------------------------
// 画像サイズ変更 - Update
// ------------------------------------------------------------------------------
const resizeImage = async (orgnImagePath, resizeImagePath, resizeWidth) => {
  await sharp(orgnImagePath).resize(resizeWidth).toFile(resizeImagePath)
}

// ---------------------------------------------------------------------------//
// 画像サイズ変更 - AEC Update                                                 //
// ---------------------------------------------------------------------------//
const newResizeImage = async (orgnImagePath, resizeImagePath, resizeWidth) => {
  await sharp(orgnImagePath).resize({
    width: resizeWidth,
    height: resizeWidth,
    position: "centre",
    background: 'black',
    fit: 'contain'
  }).toFile(resizeImagePath)
}

// ------------------------------------------------------------------------------
// 画像・動画をアップロード
// ------------------------------------------------------------------------------
app.post("/uploadFileCDN", async (req, res) => {
  try {
    // トークン確認
    if (!isValidToken(req.body.token)) return res.status(401).send()
    // imageBase64 データから画像情報を抽出
    const { imageBase64 } = req.body
    const imageData = imageBase64.replace(/^data:\w+\/\w+;base64,/, "")
    const imageExtension = imageBase64
      .toString()
      .slice(imageBase64.indexOf("/") + 1, imageBase64.indexOf(";"))
    const imageFile = Buffer.from(imageData, "base64")
    const commonSuffix = (Math.random() + 1).toString(36).substring(7)
    const commonFileName = `${getFormattedDate(new Date(), "yyyyMMdd-hhmm-ssSSS_")}${commonSuffix}.`
    // オリジナル画像
    const orgnImageName = `orgn_${commonFileName}${imageExtension}`
    const orgnImagePath = `./files/${orgnImageName}`
    // メイン画像
    const mainImageName = `main_${commonFileName}${imageExtension}`
    const mainImagePath = `./files/${mainImageName}`
    // サムネイル画像
    const thmbImageName = `thmb_${commonFileName}${imageExtension}`
    const thmbImagePath = `./files/${thmbImageName}`
    // オリジナル画像保存
    fs.writeFileSync(orgnImagePath, imageFile, (err) => {
      if (err) throw err
    })
    // メイン画像保存
    await resizeImage(orgnImagePath, mainImagePath, 1200)
    // サムネイル画像保存
    await resizeImage(orgnImagePath, thmbImagePath, 500)
    // 動画
    let videoName = null
    let videoPath = null
    // 動画の有無を確認
    if (req.body.videoBase64) {
      // 動画ありの場合
      // videoBase64 データから画像情報を抽出
      const { videoBase64 } = req.body
      const videoData = videoBase64.replace(/^data:\w+\/\w+;base64,/, "")
      const videoExtension = videoBase64
        .toString()
        .slice(videoBase64.indexOf("/") + 1, videoBase64.indexOf(";"))
      const videoFile = Buffer.from(videoData, "base64")
      // 動画ファイル
      videoName = `vdeo_${commonFileName}${videoExtension}`
      videoPath = `./files/${videoName}`
      // 動画ファイル保存
      fs.writeFileSync(videoPath, videoFile, (err) => {
        if (err) throw err
      })
    }
    // Response 返却
    res.type("json")
    return res.status(200).send({
      files: {
        orgn: process.env.FILES_ROOT_URL + orgnImageName,
        main: process.env.FILES_ROOT_URL + mainImageName,
        thmb: process.env.FILES_ROOT_URL + thmbImageName,
        vdeo: process.env.FILES_ROOT_URL + videoName,
      },
    })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// //////////////////////////////////////////////////////////////////////////////
// NEW LOGIC FOR AEC
// //////////////////////////////////////////////////////////////////////////////
function buildProductsWhereClause(filterObj) {
  const where = {};

  Object.keys(filterObj).forEach(key => {
    if (Array.isArray(filterObj[key]) && filterObj[key].length > 0) {
      switch (key) {
        case  'salesChannel':
          const orConditions = filterObj[key].map(channel => {
            channel = parseInt(channel);
            if (channel === 1) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'0001\' = 1)')]};
            if (channel === 2) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'0010\' = 2)')]};
            if (channel === 4) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'0100\' = 4)')]};
            if (channel === 8) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'1000\' = 8)')]};
          });
          where[key] = {[Op.or]: orConditions};
          break;
        case  'quantity':
        case  'productPriceB':
        case  'productPriceC':
        case  'productPriceBC':
          if (Array.isArray(filterObj[key])) {
            const orConditions2 = filterObj[key].map(c => {
              if (c.length === 2) {
                const [from, to] = c;
                return {
                  [Op.between]: [from, to]
                }
              }
            });
            where[key] = {[Op.or]: orConditions2};
          }
          break;
        default:
          where[key] = {[Op.in]: filterObj[key]};
          break;
      }
    }
  });

  return where;
}

// //////////////////////////////////////////////////////////////////////////////
// AEC Save image to product_images or article_images by type
// //////////////////////////////////////////////////////////////////////////////
const saveImage = async (file, type = 1, gid = null) => { // type 1: product image, 2: article image
  try {
    if (!file) return null
    const { buffer, originalname, mimetype } = file
    const thumbSize = parseInt(process.env.THUMBNAIL_SIZE, 10) || 200
    const thumb = await sharp(buffer).resize({
      width: thumbSize,
      height: thumbSize,
      fit: 'contain',
      background: process.env.THUMBNAIL_BACKGROUND_COLOR || 'gray'
    }).extend({
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
      background: 'white'
    }).toBuffer();

    return Promise.all(thumb).then(async (data) => {
      const model = type === 1 ? models.product_images : models.article_images
      if (gid) {
        await model.destroy({
          where: {
            gid
          }
        })
      }
      const image = await model.create({
        origin: buffer,
        thumb: data,
        fileName : originalname,
        fileType : mimetype
      });
      return image.gid
    })
  } catch (err) {
    console.log(err);
    return err
  }
}

// //////////////////////////////////////////////////////////////////////////////
// AEC delete image from product_images or article_images by type
// //////////////////////////////////////////////////////////////////////////////
const deleteImage = async (type = 1, gid = null) => { // type 1: product image, 2: article image
  try {
    if (!gid) return false
    const model = type === 1 ? models.product_images : models.article_images
    await model.destroy({ where: { gid } })
    return true
  } catch (err) {
    console.log(err);
    return err
  }
}

// ------------------------------------------------------------------------------//
// [INFO] AEC Get products                                                       //
// ------------------------------------------------------------------------------//
app.get("/aec/products", async (req, res) => {
  try {
    const app = req.query.app || null
    const group = req.query.group || ''
    let flags = req.query.flags || ''
    flags = flags.length ? flags.split(',') : []
    
    let where = 'WHERE true'
    where += flags.length == 1 ? ` AND deleteFlg = ${flags[0]}` : ''
    where += app ? ` AND product_shops.shopId = ${app}` : ''
    where += group ? ` AND products.productGroup like '%${group}%'` : ''

    const serverUrl = `${req.protocol}://${req.get('host')}`

    const products = await models.sequelize.query(`
      SELECT
        products.productId,
        products.productCode,
        products.productName,
        products.productTag,
        products.productSubname,
        products.productOrign,
        products.productDetail,
        IF(products.productPhoto1 > 0, CONCAT_WS('/', '${serverUrl}/aec/product-images', products.productPhoto1, 'file?type=thumb'), '${serverUrl}/aec/product-images/null/file?type=thumb') AS productPhoto1,
        CONCAT((products.salesChannel & b'0001'), ',', (products.salesChannel & b'0010'), ',', (products.salesChannel & b'0100'), ',', (products.salesChannel & b'1000')) AS salesChannel,
        products.isOnsale,
        products.productPriceB,
        products.productPriceBS,
        products.productPriceC,
        products.productPriceBC,
        products.quantity,
        products.period,
        products.deleteFlg
      FROM products
      LEFT JOIN product_shops ON products.productId = product_shops.productId AND product_shops.shopId = ${app}
      ${where}
      ORDER BY products.productId DESC;
    `, { type: models.sequelize.QueryTypes.SELECT })

    return res.json({ products })
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------
// [INFO] AEC 商品追加
// ------------------------------------------------------------------------------
app.post("/aec/products/create", upload.fields([
  { name: 'article_image', maxCount: 1 },
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
]), async (req, res) => {
  const transaction = await models.sequelize.transaction()
  try {
    const {token} = req.body
    const product = JSON.parse(req.body.product)
    const {files} = req

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    // Product Code 確認
    const productByCode = await models.products.findOne({
      where: { productCode: product.productCode },
    })
    if (productByCode) {
      // Response 返却
      res.type("json")
      return res.status(200).send({
        product: null,
        message: '商品コードが重複しています。',
        status: false,
      })
    }

    if (product.productGroup) {
      await models.sequelize.query(`
        INSERT INTO product_groups(groupName)
        SELECT '${product.productGroup}'
        WHERE NOT EXISTS (
          SELECT 1 FROM product_groups WHERE groupName = '${product.productGroup}'
        );
      `, { type: models.sequelize.QueryTypes.UPDATE, transaction }
      )
    }

    // 商品追加
    product.start = product.start ? getUTCDateTime(product.start) : null
    product.end = product.end ? getUTCDateTime(product.end) : null

    // product image
    if (files) {
      product.productPhoto1 = files.photo1 ? await saveImage(files.photo1[0]) : product.productPhoto1
      product.productPhoto2 = files.photo2 ? await saveImage(files.photo2[0]) : product.productPhoto2
      product.productPhoto3 = files.photo3 ? await saveImage(files.photo3[0]) : product.productPhoto3
    }

    const result = await models.products.create(product, { transaction })
    product.productId = result.productId
    product.productPhoto1 = result.productPhoto1

    await transaction.commit()

    // Response 返却
    return res.status(201).json({
      product,
      message: '商品の新規登録が完了しました。',
      status: true,
    })
  } catch (err) {
    await transaction.rollback()
    console.log(err)
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------
// [INFO] AEC 商品取得
// ------------------------------------------------------------------------------
app.get("/aec/products/:product_id", async (req, res) => {
  try {
    const serverUrl = `${req.protocol}://${req.get('host')}`
    const product = await models.products.findOne({
      where: {
        productId: req.params.product_id
      },
      attributes: {
        include: [
          [models.sequelize.literal(`IF(productPhoto1 > 0, CONCAT_WS('/', '${serverUrl}/aec/product-images', productPhoto1, 'file?type=thumb'), '')`), 'productPhoto1Url'],
          [models.sequelize.literal(`IF(productPhoto2 > 0, CONCAT_WS('/', '${serverUrl}/aec/product-images', productPhoto2, 'file?type=thumb'), '')`), 'productPhoto2Url'],
          [models.sequelize.literal(`IF(productPhoto3 > 0, CONCAT_WS('/', '${serverUrl}/aec/product-images', productPhoto3, 'file?type=thumb'), '')`), 'productPhoto3Url'],
          [models.sequelize.literal("CONCAT((salesChannel & b'0001'), ',', (salesChannel & b'0010'), ',', (salesChannel & b'0100'), ',', (salesChannel & b'1000'))"), 'salesChannel']
        ],
        exclude: ['productArticle']
      }
    })
    // ProductId 確認
    if (!product) {
      // Response 返却
      res.type("json")
      return res.status(200).send({
        product: null,
        message: 'この商品は登録されていません。',
        status: false,
      })
    }

    return res.status(200).json({
      product
    })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------
// [INFO] AEC 商品更新
// ------------------------------------------------------------------------------
app.post("/aec/products/:product_id", upload.fields([
  { name: 'article_image', maxCount: 1 },
  { name: 'photo1', maxCount: 1 },
  { name: 'photo2', maxCount: 1 },
  { name: 'photo3', maxCount: 1 },
]), async (req, res) => {
  const transaction = await models.sequelize.transaction()
  try {
    const {token} = req.body
    const product = JSON.parse(req.body.product)
    const {files} = req

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    // ProductId 確認
    const productById = await models.products.findOne({
      where: {
        productId: req.params.product_id
      }
    });
    if (!productById) {
      // Response 返却
      res.type("json")
      return res.status(200).send({
        product: null,
        message: 'この商品は登録されていません。',
        status: false,
      })
    }

    // ProductCode 確認
    const productByCode = await models.products.findOne({
      where: {
        productCode: product.productCode
      }
    });
    if (productByCode && productByCode.productId !== productById.productId) {
      // Response 返却
      res.type("json")
      return res.status(200).send({
        productId: product.productId,
        message: '商品コードが重複しています。',
        status: false,
      })
    }

    if (product.productGroup) {
      await models.sequelize.query(`
        INSERT INTO product_groups(groupName)
        SELECT '${product.productGroup}'
        WHERE NOT EXISTS (
          SELECT 1 FROM product_groups WHERE groupName = '${product.productGroup}'
        );
      `, { type: models.sequelize.QueryTypes.UPDATE, transaction }
      )
    }

    // 更新対象の商品を取得
    product.start = product.start ? getUTCDateTime(product.start) : null
    product.end = product.end ? getUTCDateTime(product.end) : null

    // product image
    if (files) {
      product.productPhoto1 = files.photo1 ? await saveImage(files.photo1[0], 1, product.productPhoto1) : product.productPhoto1
      product.productPhoto2 = files.photo2 ? await saveImage(files.photo2[0], 1, product.productPhoto2) : product.productPhoto2
      product.productPhoto3 = files.photo3 ? await saveImage(files.photo3[0], 1, product.productPhoto3) : product.productPhoto3
    }

    if (!product.productPhoto1) await deleteImage(1, product.productPhoto1Delete)
    if (!product.productPhoto2) await deleteImage(1, product.productPhoto2Delete)
    if (!product.productPhoto2) await deleteImage(1, product.productPhoto2Delete)

    await models.products.update(product, {
      where: {
        productId: req.params.product_id
      },
      transaction
    })

    await transaction.commit()

    return res.json({
      product,
      message: `商品の更新が完了しました。`,
      status: true,
    });
  } catch (err) {
    await transaction.rollback()
    log.error(req, err)
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Delete product by id                                               //
// ------------------------------------------------------------------------------//
app.delete("/aec/products/:product_id", async (req, res) => {
  try {
    // Token 確認
    const {token} = req.body
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    // ProductId 確認
    const productById = await models.products.findOne({
      where: {
        productId: req.params.product_id
      }
    });
    if (!productById) {
      // Response 返却
      res.type("json")
      return res.status(200).send({
        product: null,
        message: 'この商品は登録されていません。',
        status: false,
      })
    }
    await models.products.update(
      {deleteFlg: constants.PRODUCT.OPTION.deleteFlg.DISCONTINUED},
      {where: {productId: req.params.product_id}}
    );

    return res.json({
      productId: req.params.product_id,
      message: `商品の削除が完了しました。`,
      status: true,
    });
  } catch (err) {
    log.error(req, err)
    return res.status(500).send('Internal server error');
  }
})

// restore product by id
app.post("/aec/restore-product", async (req, res) => {
  try {
    // Token 確認
    const {token, id} = req.query
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    // ProductId 確認
    const productById = await models.products.findOne({ where: { productId: id } });
    if (!productById) {
      return res.json({ product: null, status: false })
    }
    await models.products.update( {deleteFlg: constants.PRODUCT.OPTION.deleteFlg.ACTIVE}, {where: {productId: id}} );

    return res.json({ productId: id, status: true });
  } catch (err) {
    console.log(err)
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Get Units                                                          //
// ------------------------------------------------------------------------------//
app.get("/aec/units", async (req, res) => {
  try {
    // Token 確認
    const { token } = req.query

    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const units = await models.product_units.findAll({
      attributes: ['unitName']
    })

    // Response 返却
    return res.json({ units })
  } catch (err) {
    console.log(err);
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Get product groups                                                          //
// ------------------------------------------------------------------------------//
app.get("/aec/product-groups", async (req, res) => {
  try {
    // Token 確認
    const { token } = req.query

    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const productGroups = await models.product_groups.findAll()

    // Response 返却
    return res.json({ productGroups })
  } catch (err) {
    console.log(err);
    return res.status(500).send('Internal server error');
  }
})

app.get('/aec/product-images/:id/file', async (req, res) => {
  try {
    // Find the product image record with the specified ID
    const {id} = req.params;
    const productImage = await models.product_images.findByPk(id);

    // Determine which image to serve based on the "type" query parameter
    const imageType = req.query.type === 'thumb' ? 'thumb' : 'origin';
    let imageData = null

    if(productImage){
      imageData = productImage[imageType];
    }

    // Check if productImage exists and has image data
    if (!imageData) {
      // Return default image here
      const path = require('path'); // Import the path module
      const defaultImagePath = path.join('static', 'dummy_thumb.jpg');
      imageData = fs.readFileSync(defaultImagePath);
      // Set the response headers to indicate the content type and disposition
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `inline; filename="dummy_thumb.jpg"`);
    } else {
      // Set the response headers to indicate the content type and disposition
      res.setHeader('Content-Type', productImage.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${productImage.fileName}"`);
    }

    // Convert the binary data to a Buffer object and stream it to the response
    const buffer = Buffer.from(imageData, 'binary');
    return res.send(buffer);
  } catch (error) {
    console.error(`商品画像取得中にエラー: ${error.message}`);
    return res.status(500).send('Internal server error');
  }
});

app.get('/aec/article-images/:id/file', async (req, res) => {
  try {
    // Find the product image record with the specified ID
    const {id} = req.params;
    const articleImage = await models.article_images.findByPk(id);

    // Determine which image to serve based on the "type" query parameter
    const imageType = req.query.type === 'thumb' ? 'thumb' : 'origin';
    const imageData = articleImage[imageType];

    // Set the response headers to indicate the content type and disposition
    res.setHeader('Content-Type', 'image/*');

    // Convert the binary data to a Buffer object and stream it to the response
    const buffer = Buffer.from(imageData, 'binary');
    return res.send(buffer);
  } catch (error) {
    console.error(`記事画像取得中にエラー： ${error.message}`);
    return res.status(500).send('Internal server error');
  }
});

function buildUsersWhereClause(filterObj) {
  const where = {};

  Object.entries(filterObj).forEach(([key, value]) => {
    if (!Array.isArray(value)) {
      // If the value is an object, convert it to an array
      value = [value]
    }

    if (Array.isArray(value) && value.length > 0) {
      switch (key) {
        case 'shop':
          value = value[0];
          Object.entries(value).forEach(([shopKey, shopValue]) => {
            if (Array.isArray(shopValue) && shopValue.length > 0) {
              where[`$shop.${shopKey}$`] = {[Op.in]: shopValue};
            }
          });
          break;
        case 'salesChannel':
          const orConditions = value.map(channel => {
            channel = parseInt(channel);
            if (channel === 1) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'0001\' = 1)')]};
            if (channel === 2) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'0010\' = 2)')]};
            if (channel === 8) return {[Op.or]: [models.sequelize.literal('(salesChannel & b\'1000\' = 8)')]};
          });
          where[key] = {[Op.or]: orConditions};
          break;
        default:
          where[key] = {[Op.in]: value};
          break;
      }
    }
  });

  return where;
}

async function findUser(userId) {
  const user = await models.users.findOne({
    where: {
      userId: userId
    },
    attributes: {
      include: [
        [models.sequelize.literal("CAST(salesChannel AS UNSIGNED)"), 'salesChannel'],
      ]
    },
    include: [
      {
        model: models.shops,
        required: false,
        attributes: {
          include: [
            [models.sequelize.literal("TIME_FORMAT(closing, '%H:%i')"), 'closing'],
          ]
        },
        include: [
          {
            model: models.addresses,
            required: false,
          },
          {
            model: models.shop_groups,
            required: false,
          }
        ],
        where: {
          deleteFlg: { [Op.eq]: constants.USER.OPTION.deleteFlg.ACTIVE },
        },
      },
    ],
  })
  return user
}

// ------------------------------------------------------------------------------//
// [INFO] AEC Get users                                                          //
// ------------------------------------------------------------------------------//
app.get("/aec/users", async (req, res) => {
  try {
    const shop = +req.query.shop || null
    let where = `WHERE users.deleteFlg = 0`
    where += shop ? ` AND users.shopId = ${shop}` : ''

    let users = await models.sequelize.query(
      `
      SELECT
        users.userId,
        users.isParent,
        users.userCode,
        users.ordererName,
        shops.shopCode,
        shops.shopName,
        CAST(users.salesChannel AS UNSIGNED) AS salesChannel,
        users.regist,
        users.active,
        users.purchase,
        users.shopId,
        users.tag
      FROM
        users
      LEFT JOIN
        shops ON users.shopId = shops.shopId
      ${where} 
      ORDER BY users.userId DESC;
    `, { type: models.sequelize.QueryTypes.SELECT })

    return res.json({ users });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
})

async function updateShopRelation(shop, t) {
  // Check if the shop exists
  if (shop) {
    // Check if the shop group is selected or manually entered
    let shopGroupId = null;
    if (shop.shop_group && shop.shop_group.shopGroupId !== null) {
      // Selected from the dropdown
      shopGroupId = shop.shop_group.shopGroupId;
    } else if (shop.shop_group && shop.shop_group.groupName) {
      // Manually entered, search or create a new shop group
      const foundShopGroup = await models.shop_groups.findOne({
        where: {groupName: shop.shop_group.groupName},
      }, {transaction: t});
      if (foundShopGroup) {
        shopGroupId = foundShopGroup.shopGroupId;
      } else {
        const createdShopGroup = await models.shop_groups.create({
          groupName: shop.shop_group.groupName,
        }, {transaction: t});
        shopGroupId = createdShopGroup.shopGroupId;
      }
    }

    shop.shopGroupId = shopGroupId;

    const createOrUpdateAddress = async (addressData) => {
      const {addressId, ...addressAttributes} = addressData;

      // Find the address based on addressId
      const [addressItem, created] = await models.addresses.findOrCreate({
        where: {addressId},
        defaults: addressAttributes,
        transaction: t,
      });

      // If the address already exists, update its attributes
      if (!created) {
        await addressItem.update(addressAttributes, {transaction: t});
      }

      return addressItem;
    };

    const updatedAddress = await createOrUpdateAddress(shop.address);
    shop.addressId = updatedAddress.addressId;

    const createOrUpdateShop = async (shopData) => {
      const {shopId, ...shopAttributes} = shopData;
      delete shopAttributes.address;
      delete shopAttributes.shop_group;

      // Find the shop based on shopId
      const [shopItem, created] = await models.shops.findOrCreate({
        where: {shopId},
        defaults: shopAttributes,
        transaction: t,
      });

      // If the shop already exists, update its attributes
      if (!created) {
        await shopItem.update(shopAttributes, {transaction: t});
      }

      return shopItem;
    };

    const updatedShop = await createOrUpdateShop(shop);
    return updatedShop;
  }
  return shop;
}

// ------------------------------------------------------------------------------
// Create user
// ------------------------------------------------------------------------------
app.post("/aec/users/create", async (req, res) => {

  const t = await models.sequelize.transaction();
  const {token} = req.body;
  let {shop, ...user} = req.body.user;

  if (user.userCode && await findUserByCode(user.userCode, null)) {
    return res.json({
      status: false,
      message: 'ユーザコードは既に存在します',
    })
  }
  
  if (user.userLine && await findUserByLineId(user.userLine, null)) {
    return res.json({
      status: false,
      message: 'LineIDは既に存在します',
    })
  }

  try {
    // Token 確認
    if (token !== process.env.INFO_TOKEN) {
      return res.status(401).send('Unauthenticated error!')
    }

    user = {
      ...user,
      userId: null,
      deleteFlg: 0
    }

    const shopData = await updateShopRelation(shop, t);
    user.shopId = shopData.shopId;

    // Create user
    const theUser = await models.users.create(user, {transaction: t})

    await t.commit();

    // Response 返却
    return res.json({
      status: true,
      message: 'Create new user successfully!',
      result: {user: await findUser(theUser.userId)},
    })
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// Get User by userId
app.get('/aec/users/:user_id', async (req, res) => {
  try {
    const {token} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const user = await findUser(req.params.user_id);

    return res.json({
      status: true,
      message: 'Get user successfully',
      result: {
        user
      }
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// Update user by id
app.post('/aec/users/:user_id', async (req, res) => {
  const t = await models.sequelize.transaction()
  const {token} = req.body;
  let {shop, ...user} = req.body.user;

  if (user.userCode && await findUserByCode(user.userCode, req.params.user_id)) {
    return res.json({
      status: false,
      message: 'ユーザコードは既に存在します',
    })
  }

  if (user.userLine && await findUserByLineId(user.userLine, req.params.user_id)) {
    return res.json({
      status: false,
      message: 'LineIDは既に存在します',
    })
  }

  try {
    // Token 確認
    if (token !== process.env.INFO_TOKEN) {
      return res.status(401).send('Unauthenticated error!')
    }

    user.userId = req.params.user_id;

    const shopData = await updateShopRelation(shop, t);
    user.shopId = shopData.shopId;

    // Update user
    await models.users.update(user, {where: {userId: user.userId}, transaction: t});

    // Update saleChannel spec for all staff of the shop
    if (user.isParent) {
      let updateData = { salesChannel: user.salesChannel };
      if (!(user.salesChannel&1)) updateData.active = 0;
      if (!(user.salesChannel&2)) updateData.purchase = 0;

      await models.users.update(updateData, {
        where: {
          shopId: user.shopId, 
          userId: {
            [Op.ne]: user.userId
          }
        }, transaction: t});
    }

    // Commit transaction
    await t.commit();

    console.log("Update successful");
    return res.json({
      result: {user: await findUser(user.userId)},
      status: true
    })
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

async function findUserByCode(userCode, userId = null) {
  return await models.users.findOne({
    where: {
      [Op.and]: [
        userId ? {userId: {[Op.not]: userId}} : models.sequelize.literal('userId IS NOT NULL'),
        models.sequelize.where(
          models.sequelize.fn('lower', sequelize.col('userCode')),
          models.sequelize.fn('lower', userCode)
        ),
      ]
    },
  })
}

async function findUserByLineId(lineId, userId = null) {
  return await models.users.findOne({
    where: {
      [Op.and]: [
        userId ? {userId: {[Op.not]: userId}} : models.sequelize.literal('userId IS NOT NULL'),
        models.sequelize.where(
          models.sequelize.fn('lower', sequelize.col('userLine')),
          models.sequelize.fn('lower', lineId)
        ),
      ],
      deleteFlg: 0
    },
  })
}

// Check if a field exists for a given user
app.get('/aec/user/isExist', async (req, res) => {
  try {
    const {token, userId, name, value} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const parsedUserId = !isNaN(userId) ? parseInt(userId) : null;

    if (!value) {
      return res.json({
        result: false
      })
    }

    const user = await models.users.findOne({
      where: {
        [Op.and]: [
          parsedUserId !== null ? { userId: { [Op.ne]: parsedUserId } } : models.sequelize.literal('userId IS NOT NULL'),
          models.sequelize.where(
            models.sequelize.fn('lower', sequelize.col(name)),
            models.sequelize.fn('lower', value)
          )
        ]
      }
    });

    return res.json({
      result: !!user
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// Check user LINE exist
app.get('/aec/userLine/isExist', async (req, res) => {
  try {
    const {token, userId, name, userLine, value} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const parsedUserId = !isNaN(userId) ? parseInt(userId) : null;

    if (!value) {
      return res.json({
        result: false
      })
    }

    const user = await models.users.findOne({
      where: {
        [Op.and]: [
          parsedUserId !== null ? { userId: { [Op.ne]: parsedUserId } } : models.sequelize.literal('userId IS NOT NULL'),
          models.sequelize.where(
            models.sequelize.fn('lower', sequelize.col(name)),
            models.sequelize.fn('lower', value)
          ),
        ],
        deleteFlg: 0
      },
    });

    return res.json({
      result: !!user
    })
  } catch (err) {
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// Check if a field exists for a given shop
app.get('/aec/shop/isExist', async (req, res) => {
  try {
    const {token, shopId, name, value} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const parsedShopId = !isNaN(shopId) ? parseInt(shopId) : null;

    const shop = await models.shops.findOne({
      where: {
        [Op.and]: [
          parsedShopId !== null ? { shopId: { [Op.ne]: parsedShopId } } : models.sequelize.literal('shopId IS NOT NULL'),
          models.sequelize.where(
            models.sequelize.fn('lower', sequelize.col(name)),
            models.sequelize.fn('lower', value)
          )
        ]
      }
    });

    return res.json({
      result: !!shop
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})


// Delete User
app.delete('/aec/users/:user_id', async (req, res) => {
  const transaction = await models.sequelize.transaction();

  try {
    const {token} = req.body
    let shopId = req.body.shopId || null
    let isParent = req.body.isParent || false

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    if (isParent) {
      await models.users.update({ deleteFlg: 1 }, { where: { shopId }, transaction})
      await models.shops.update({ deleteFlg: 1 }, {where: { shopId }, transaction})
      await models.product_shops.destroy({where: { shopId }, transaction})
    } else {
      await models.users.update({ deleteFlg: 1 }, {where: {userId: req.params.user_id}, transaction});
    }

    await transaction.commit();
    return res.json({ status: true })
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    return res.status(500).send({
      status: false,
      message: err.message
    })
  }
})

app.get('/aec/shops', async (req, res) => {
  try {

    const shops = await models.sequelize.query(`
      SELECT shopCode, shopName
      FROM shops
      JOIN users ON users.shopId = shops.shopId
      WHERE shops.deleteFlg = 0 AND users.isParent = 1 AND users.salesChannel&0b1100 <> 0
      ORDER BY shopName;
    `, { type: models.sequelize.QueryTypes.SELECT });

    return res.json({
      status: true,
      message: 'Get shops successfully',
      shops
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// Get Shop Groups
app.get('/aec/shop-groups', async (req, res) => {
  try {
    const {token} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const groups = await models.shop_groups.findAll({ order: [['groupName', 'ASC']] })

    return res.json({
      status: true,
      message: 'Get shop groups successfully',
      groups
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// get tags
app.get('/aec/tags', async (req, res) => {
  try {
    const {token, id} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const where = id ? {tagId: id, deleteFlg: 0} : {deleteFlg: 0}

    const tags = await models.tags.findAll({
      attributes: ['tagId', 'tagValue'],
      where,
      order: [['tagValue', 'ASC']]
    })

    return res.json({
      status: true,
      message: 'Get tags successfully',
      tags
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// get address by zip
app.get('/aec/const-zips', async (req, res) => {
  try {
    const {token, zip} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const result = await models.const_zip.findOne({
      where: {
        zip
      }
    })

    return res.json({
      prefCode: result.prefCode,
      prefName: result.prefName,
      cityName: result.cityName,
      printName: result.printName,
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

function buildOrdersWhereClause(filterObj) {
  const where = {};
  Object.entries(filterObj).forEach(([key, value]) => {
    if (!Array.isArray(value)) {
      // If the value is an object, convert it to an array
      value = [value]
    }

    if (Array.isArray(value) && value.length > 0) {
      switch (key) {
        case 'orderDate':
          if (value.length >= 2 && (Math.abs(value[0].length - value[1].length) > 1)) return;
          const orDateConditions = value.map(dateItem => {
            // 受注日 empty, mean that we get the newest orders
            if (dateItem.split('-').length === 1) { 
              const newestDays = $dayjs().subtract(+dateItem, 'day').format('YYYY-MM-DD');
              return models.sequelize.literal(`(orders.orderDate >= '${newestDays}')`);
            }
            // Match YYYY-MM
            const regex = /^[1-9]\d{3}-([1-9]|0[1-9]|1[0-2])$/
            const isMatch = regex.test(dateItem);
            if (isMatch) {
              return models.sequelize.literal(`(orders.orderDate like '${dateItem}%')`);
            }
          }).filter(c => c !== undefined);
          where[key] = {[Op.or]: orDateConditions};
          break;
        case 'salesChannel':
          const orChannelConditions = value.map(channel => {
            channel = parseInt(channel);
            if (channel === 0) return {[Op.or]: [models.sequelize.literal('(orders.salesChannel & b\'0001\' = 1)')]};
            if (channel === 1) return {[Op.or]: [models.sequelize.literal('(orders.salesChannel & b\'0010\' = 2)')]};
            if (channel === 2) return {[Op.or]: [models.sequelize.literal('(orders.salesChannel & b\'0100\' = 4)')]};
            if (channel === 3) return {[Op.or]: [models.sequelize.literal('(orders.salesChannel & b\'1000\' = 8)')]};
          });
          where[key] = {[Op.or]: orChannelConditions};
          break;
        case 'status':
          const orStatus = value.map(status => ({[Op.or]: [models.sequelize.literal(`(orders.status = '${status}')`)]}));
          where[key] = {[Op.or]: orStatus};
          break;
        case 'preferred':
          const orPreferredDate = value.map(date => ({[Op.or]: [models.sequelize.literal(`(DATE_FORMAT(orders.preferredDate, '%Y-%m') = '${date}')`)]}))
          where.preferredDate = {[Op.or]: orPreferredDate};
          break;
        default:
          where[key] = {[Op.in]: value};
          break;
      }
    }
  });

  return where;
}

async function findOrder(orderId) {
  const o = models.orders.findOne({
    where: {
      orderId: orderId
    },
    attributes: {
      include: [
        [models.sequelize.literal("DATE_FORMAT(orders.orderDate, '%Y-%m-%d %H:%i')"), 'orderDate'],
        [models.sequelize.literal("DATE_FORMAT(orders.arrivalDay, '%Y-%m-%d')"), 'arrivalDay'],
        [models.sequelize.literal("CONCAT((todo & b'0001'), ',', (todo & b'0010'), ',', (todo & b'0100'), ',', (todo & b'1000'))"), 'todo'],
        [models.sequelize.literal("CONCAT((orders.salesChannel & b'0001'), ',', (orders.salesChannel & b'0010'), ',', (orders.salesChannel & b'0100'), ',', (orders.salesChannel & b'1000'))"), 'salesChannel'],
      ]
    },
    include: [
      {
        model: models.carts,
        where: { orderId: sequelize.col('orders.orderId') },
        include: [
          {
            model: models.products,
            required: false,
          }
        ],
        required: false,
      },
      {
        model: models.order_stripes,
        required: false,
      },
      {
        model: models.apps,
        required: false,
        where: { deleteFlg: 0 },
      },
      {
        model: models.users,
        required: false,
        as: 'shopuser',
        attributes: {
          include: [
            [models.sequelize.literal("CONCAT((shopuser.salesChannel & b'0001'), ',', (shopuser.salesChannel & b'0010'), ',', (shopuser.salesChannel & b'0100'), ',', (shopuser.salesChannel & b'1000'))"), 'salesChannel'],
          ]
        },
        include: [
          {
            model: models.shops,
            required: false,
          }
        ],
      },
      {
        model: models.addresses,
        required: false,
      },
      {
        model: models.order_stripes,
        required: false,
      }
    ],
  })

  return o;
}

async function findOrders(orderIds) {
  const orders = models.orders.findAndCountAll({
    where: {
      orderId: {[models.Sequelize.Op.in]: orderIds}
    },
    attributes: {
      include: [
        [models.sequelize.literal("DATE_FORMAT(orders.orderDate, '%Y-%m-%d %H:%i')"), 'orderDate'],
        [models.sequelize.literal("CONCAT((todo & b'0001'), ',', (todo & b'0010'), ',', (todo & b'0100'), ',', (todo & b'1000'))"), 'todo'],
        [models.sequelize.literal("CONCAT((orders.salesChannel & b'0001'), ',', (orders.salesChannel & b'0010'), ',', (orders.salesChannel & b'0100'), ',', (orders.salesChannel & b'1000'))"), 'salesChannel'],
      ]
    },
    include: [
      {
        model: models.carts,
        where: { orderId: sequelize.col('orders.orderId') },
        include: [
          {
            model: models.products,
            required: false,
          }
        ],
        required: false,
      },
      {
        model: models.order_stripes,
        required: false,
      },
      {
        model: models.addresses,
        required: false,
      },
      {
        model: models.apps,
        required: false,
      },
      {
        model: models.users,
        required: false,
        as: 'shopuser',
        attributes: {
          include: [
            [models.sequelize.literal("CONCAT((shopuser.salesChannel & b'0001'), ',', (shopuser.salesChannel & b'0010'), ',', (shopuser.salesChannel & b'0100'), ',', (shopuser.salesChannel & b'1000'))"), 'salesChannel'],
          ]
        },
        include: [
          {
            model: models.shops,
            required: false,
          }
        ]
      },
    ],
  });

  return orders;
}

// ------------------------------------------------------------------------------//
// [INFO] ORDERS Get Orders                                                      //
// ------------------------------------------------------------------------------//
app.get("/aec/orders", async (req, res) => {
  try {
    const orderBy = 'orderId';
    const orderDirection = 'desc';
    const search = req.query.search || '{}';

    let filterObj = {};
    try {
      console.log(search)
      filterObj = JSON.parse(search);
    } catch (err) {
      console.error('無効なJSONフィルター:', err.message);
    }

    const orderCriteria = [[orderBy, orderDirection]]; // Default order by users

    // Construct the where clause for the query based on the filter object
    const where = buildOrdersWhereClause(filterObj);

    let orders = await models.orders.findAll({
      attributes: {
        include: [
          [models.sequelize.literal("DATE_FORMAT(orders.orderDate, '%Y-%m-%d %H:%i')"), 'orderDate'],
          [models.sequelize.literal("DATE_FORMAT(orders.arrivalDay, '%Y-%m-%d')"), 'arrivalDay'],
          [models.sequelize.literal("CONCAT((orders.salesChannel & b'0001'), ',', (orders.salesChannel & b'0010'), ',', (orders.salesChannel & b'0100'), ',', (orders.salesChannel & b'1000'))"), 'salesChannel'],
        ],
        // Exclude default rows
        exclude:[
          'orderDate',
          'arrivalDay',
          'salesChannel',
        ]
      },
      include:[
        {
          model: models.users,
          required: false,
          as: 'shopuser',
          include: [
            {
              model: models.shops,
              required: false,
            }
          ],
        },
        {
          model: models.apps,
          required: false,
        }
      ],
      where,
      order: orderCriteria,
    });

    orders = orders.map(order => ({
      orderId: order.orderId,
      todo: order.todo,
      status: order.status,
      orderDate: order.orderDate,
      salesChannel: order.salesChannel.split(',').map((item, index) => item > 0 ? index : -1).filter((channel) => channel > -1),
      userName: order.userName,
      // payment: order.payment,
      preferred: order.preferredDate,
      arrivalDay: order.arrivalDay,
      ordererName: order.shopuser?.ordererName || null,
      shopCode: order.shopuser?.shop?.shopCode || null,
      shopName: order.shopuser?.shop?.shopName || null,
      closing: order.shopuser?.shop?.closing || null,
      orderMemo: order.orderMemo,
      shipNumber: order.shipNumber,
      appName: order.app?.app_name || '',
    }));

    return res.json({
      orders,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

// get selected orders
app.get('/aec/getSelectedOrders', async (req, res) => {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()

    const ids = req.query.ids?.split(',') || []

    let orders = await findOrders(ids)
    orders = await orders.rows
    const userIds = orders.map(order => {
      return order.userId
    })

    const appNames = await models.users.findAll({
      attributes: [[models.sequelize.col('users.userLine'), 'userId'], [models.sequelize.col('shop.shopName'), 'shopName']],
      raw: true,
      where: {
        userLine: {
          [Op.in]: userIds
        },
        deleteFlg: 0,
      },
      include: [{
        model: models.shops,
        required: true,
        attributes: []
      }]
    })

    let results = []
    orders.forEach(o => {
      const order = JSON.parse(JSON.stringify(o))
      order.todo = order.todo?.split(',') || []
      order.salesChannel = order.salesChannel.split(',').map((item, index) => item > 0 ? index : -1).filter((channel) => channel > -1)
      if (order.salesChannel.includes(2) && order.salesChannel.includes(3)) {
        order.app_name = order.userName
      } else {
        const appName = appNames.find(app => app.userId == order.userId);
        order.app_name = appName?.shopName || ''
      }
      results.push(order)
    })

    return res.json({ orders: results })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.get('/aec/order', async (req, res) => {
  try {
    const {token} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    let order = await findOrder(req.query.order);
    
    order = {
      orderId: order.orderId,
      status: order.status,
      orderDate: order.orderDate,
      salesChannel: order.salesChannel.split(',').map((item, index) => item > 0 ? index : -1).filter((channel) => channel > -1),
      userName: order.userName,
      cart: order.carts?.map(item => ({id: item.productId, code: item.productCode, name: item.productName.length > 50 ? item.productName.substring(0,50) + '...' : item.productName, price: item.price || 0, quantity: item.quantity, amount: item.price * item.quantity})),
      cartPrice: order.cartPrice,
      discount: order.discount,
      shippingFee: order.shippingFee,
      orderFee: order.orderFee,
      payment: order.payment,
      preferredDate: order.preferredDate,
      deliveryDay: order.deliveryDay,
      deliveryMethod: order.deliveryMethod,
      shipNumber: order.shipNumber,
      app_name: order.app?.app_name,
      orderMemo: order.orderMemo,
      address: order.address,
      preferredTime: order.preferredTime, 
      userLine: order.userId,
      app: order.app,
      orderStripeId: order.order_stripe?.id || null,
      arrivalDay: order.arrivalDay,
      ordererName: order.shopuser?.ordererName || null,
      shopCode: order.shopuser?.shop?.shopCode || null,
      shopName: order.shopuser?.shop?.shopName || null,
      closing: order.shopuser?.shop?.closing || null,
    }

    return res.json({
      status: true,
      message: 'Get order successfully',
      result: {
        order
      }
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// get users by shopId
app.get('/aec/getUsersByShopId', async (req, res) => {
  try {
    const {token, shopId} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const users = await models.users.findAll({
      where: {
        shopId
      },
      attributes: [['userId', 'id'], ['userName', 'fullname']]
    })

    return res.json({
      status: true,
      message: `Get users by shopId = ${shopId} successfully`,
      users
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})
// [INFO] AEC Get Accounts                                                       //
// ------------------------------------------------------------------------------//
app.get("/aec/apps", async (req, res) => {
  try {
    const apps = await models.apps.findAll({
      where: { deleteFlg: 0 },
      order: [['app_code', 'asc']],
      attributes: ['app_id', 'app_code', 'app_name','deleteFlg']
    });

    return res.json({ apps })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})
// ------------------------------------------------------------------------------//
// [INFO] AEC :  Get App Detail By AppId - Accounts                              //
// ------------------------------------------------------------------------------//
app.get("/aec/app", async (req, res) => {
  try {
    const { id } = req.query
    const serverUrl = `${req.protocol}://${req.get('host')}`
    const app = await models.apps.findOne({
      where: {
        app_id: id,
        deleteFlg: 0
      },
      attributes: {
        include: [
          [models.sequelize.fn('CONCAT_WS', '/', `${serverUrl}/aec/product-images`, models.sequelize.col('logo_gid'), 'file?type=thumb'), 'logoUrl'],
        ]
      }
    })
    // App 確認
    if (!app) {
      // Response 返却
      return res.json({
        app: null,
        status: false,
      })
    }

    return res.json({ app })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Delete app by app_id                                               //
// ------------------------------------------------------------------------------//
app.post("/aec/deleteApp", async (req, res) => {
  try {
    // Token 確認
    const { token, deleteFlg, appId } = req.body
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    await models.apps.update({ deleteFlg }, {where: {app_id: appId}});

    return res.json({
      app_id: appId,
      message: `削除が完了しました。`,
      status: true,
    });
  } catch (err) {
    log.error(req, err)
    return res.status(500).send('Internal server error');
  }
})

// ------------------------------------------------------------------------------
// [INFO] AEC create, update APP
// ------------------------------------------------------------------------------
app.post("/aec/updateapp", upload.fields([
  { name: 'logoImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const {token} = req.body
    const dataApp = JSON.parse(req.body.dataApp)
    const {files} = req
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const shop = await models.shops.findOne({
      where: {
        shopCode: dataApp.shop_code,
        deleteFlg: 0
      },
    })
    // Shop 確認
    if (!shop) {
      // Response 返却
      res.type("json")
      return res.status(200).send({
        message: 'この店舗コードは登録されていません。',
        status: false,
      })
    }
    dataApp.logo_gid = dataApp.app_id ? dataApp.logo_gid : null
    // logo image
    if (files) {
      dataApp.logo_gid = files.logoImage ? await saveImage(files.logoImage[0], 1, dataApp.logo_gid) : dataApp.logo_gid
    }
    // AppByAppID 確認
    if(dataApp.app_id) {
      const appById = await models.apps.findOne({
        where: {
          app_id: dataApp.app_id,
          deleteFlg: 0
        }
      });
      if (!appById) {
        // Response 返却
        res.type("json")
        return res.status(200).send({
          data: null,
          status: false,
        })
      }
    }
    const app = await models.apps.upsert(dataApp) // upsert return app and value true

    return res.json({
      app: app[0],
      status: true,
    });
  } catch (err) {
    log.error(req, err)
    return res.status(500).send('Internal server error');
  }
})

app.get('/aec/download/ordersCsv', async (req, res) => {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()

    const fileName = $dayjs().format('YYYY-MM-DD') + '.csv';
    const orders = await findOrders(req.query.id.split(','));
    const data = [];

    orders.rows.forEach(order => {
      const deliv_time = order.preferredTime === 'none' ? '' : order.preferredTime === 'am' ? '0812' : order.preferredTime;
      const addressFull = [order.address?.perf ?? '', order.address?.city ?? '', order.address?.street ?? '', order.address?.address ?? '',].join('');
      const tel = [order.address?.tel1 ?? '', order.address?.tel2 ?? '', order.address?.tel3 ?? '',].join('-');
      const app_code = order.app?.app_code?? '';

      const dataRow = {
        order_id: (app_code == ''? '': app_code + '-') + `${order.orderId ?? ''}`,
        deliv_date: $dayjs().format('YYYY/MM/DD'),
        deliv_time: deliv_time,
        type: 0,
        cool_flg: 2,
        tel: tel,
        name: order.address?.name ?? '',
        zip: order.address?.zip ?? '',
        address: addressFull,
        building: order.address?.addition ?? '',
        honor: '様',
        seller_code: order.app?.app_code ?? '',
        seller_name: order.app?.app_name ?? '',
        seller_tel: process.env.SELLER_TEL,
        seller_zip: process.env.SELLER_ZIP,
        seller_address: process.env.SELLER_ADDRESS,
      }
      data.push(dataRow);
    });

    const headers = [
      "order_id",
      "deliv_date",
      "deliv_time",
      "type",
      "cool_flg",
      "tel",
      "name",
      "zip",
      "address",
      "building",
      "honor",
      "seller_code",
      "seller_name",
      "seller_tel",
      "seller_zip",
      "seller_address"
    ];

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');

    // Use csv-stringify to convert the data to a CSV string with headers
    await stringify(data, {header: true, headerTransform: header => headers[header.index]}, (err, csvString) => {
      if (err) {
        res.status(500).send(err);
        return;
      }

      // Convert the CSV string to Shift_JIS encoding using jconv
      const csvShiftJis = jconv.encode(csvString, 'SJIS');

      // Send the response with the Shift_JIS encoded CSV string as the body
      res.send(csvShiftJis);
    });

    // update orders exported to CSV
    const status = 'wait'
    const todo = parseInt('0011', 2)
    const ids = req.query.id.split(',')
    await models.orders.update({todo, status}, {where: {orderId: {[Op.in]: ids}}})

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.post('/aec/changeStatus', async (req, res) => {
  const t = await models.sequelize.transaction()
  try {
    const {token, orders, status} = req.body

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const ids = orders.map(order => order.orderId)

    if (!ids.length) {
      return res.json({
        status: false,
        message: '一括変換の対象が選択されていません。',
      })
    }

    // 発送済みへの変換は、伝票番号の入力が条件
    if (['wait', 'sent', 'comp'].includes(status)) {
      const notExportListOrder = orders.filter(order => order.todo[0] == 0)
      if (notExportListOrder.length > 0) {
        return res.json({
          status: false,
          message: `ピッキングリストが出力されていない注文は${constants.ORDER.STATUS[status]}に変更できません。`,
        })
      }
    }

    // CSV & shipNumber check
    if (['sent', 'comp'].includes(status)) {
      // CSVが出力されていない注文は、出荷済み・通知済みに変更できません。
      const notExportCsvOrders = orders.filter(order => order.todo[1] == 0)
      if (notExportCsvOrders.length > 0) {
        return res.json({
          status: false,
          message: `CSVが出力されていない注文は${constants.ORDER.STATUS[status]}に変更できません。`
        })
      }

      // 発送済みへの変換は、伝票番号の入力が条件
      const notShipNumberOrders = orders.filter(order => !order.shipNumber)
      if(notShipNumberOrders.length > 0) {
        return res.json({
          status: false,
          message: `伝票番号のない受注は出荷済みに変更できません。`
        })
      }
    }

    // change status = cancel
    if (status == 'cancel') {
      const notNewOrders = orders.filter(order => order.status != 'new')
      if (notNewOrders.length > 0) {
        return res.json({
          status: false,
          message: `キャンセルへの変更は、新規受注の場合のみ可能です。`
        })
      }
    }

    // 通知済みへの変換は、通知フラグが条件
    if (status == 'comp') {
      const notSentMailOrders = orders.filter(order => order.todo[3] == 0)
      if (notSentMailOrders.length > 0) {
        return res.json({
          status: false,
          message: `LINEに伝票番号未通知の受注は通知済みにできません`
        })
      }
    }

    // update order status
    if (ids.length == 1) {
      const orderId = ids[0]
      await models.orders.update(
        {status},
        {where: {orderId}, transaction: t}
      )
    } else {
      await models.orders.update({status},{
        where: {
          orderId: {
            [Op.in]: ids
          }
        }, transaction: t
      })
    }
    await t.commit()

    return res.json({
      status: true,
      message: `ステータスを${constants.ORDER.STATUS[status]}に変更しました`
    })
  } catch (error) {
    t.rollback()
    console.log(error);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.post('/aec/sendLineMessage', async (req, res) => {
  try {
    const {token, content, receiver, order} = req.body

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const userName = order.userName ? order.userName : receiver

    const typeConfig = order.salesChannel.includes(0) ? 1 : (order.salesChannel.includes(1) ? 2 : 3)

    const result = await sendLineMessage(order.app, receiver, content, typeConfig)

    if (result) {
      const todo = parseInt('1111', 2)
      await models.orders.update({
        status: 'comp',
        todo
      }, {where: {orderId: order.orderId}})
      return res.json({
        status: true,
        message: `${userName}にLINE通知しました。`
      })
    }

    return res.json({
      status: false,
      message: `${userName}へのLINE通知に失敗しました。`
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.post('/aec/updateOrdersShip', upload.single('file'), async (req, res) => {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()
    const {buffer} = req.file;
    const orders = buffer.toString().split('\n').slice(1); // convert CSV to array of orders
    for (const order of orders) {
      const orderItem = order.split(',');
      const orderId = orderItem[0].split('-')[0];
      if(orderId){
        const shipNumber = orderItem[3];
        const deliveryDay = $dayjs(orderItem[4], 'YYYY/MM/DD').format('YYYY-MM-DD');
        const status = 'sent';
        const todo = parseInt('0111', 2)
        await models.orders.update(
          {status, shipNumber, deliveryDay, todo},
          {where: {orderId}}
        )
      }
    }
    return res.json({
      status: true,
      message: 'Import successfully'
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
});

app.post('/aec/updateOrderAddress', async (req, res) => {
  const t = await models.sequelize.transaction()
  try {
    const {token, data} = req.body
    
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const {orderId, shipNumber, arrivalDay, preferredTime, consumerId, addition, address, city, name, perf, prefCode, street, tel1, tel2, tel3, zip} = data
    let addressId = data?.addressId || null

    // create a new address
    if (!addressId) {
      const address = await models.addresses.create({ addition, address, city, name, perf, prefCode, street, tel1, tel2, tel3, zip })
      addressId = address.addressId
      if (!!addressId && !!consumerId) {
        await models.shipping_addresses.create({ addressId, consumerId })
      }
    } else { // update address
      await models.addresses.update({ addition, address, city, name, perf, prefCode, street, tel1, tel2, tel3, zip }, { where: { addressId }})
    }

    // update order
    await models.orders.update({ shipNumber, preferredTime, addressId, arrivalDay: getUTCDateTime(arrivalDay) }, {where: { orderId }})

    await t.commit()
    return res.status(200).send(
        {
          status: true,
          message: 'Update success'
        }
    )
  } catch (err) {
    await t.rollback()
    console.log(err)
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

async function sendLineMessage(app, receiver, content, type = channelTypes.B2B) {
  try {
    let config = null
    if (!app?.msg_access_token || !app?.msg_channel_secret) {
      config = getAppChannel(type)
    } else {
      config = {
        channelAccessToken: app.msg_access_token,
        channelSecret: app.msg_channel_secret
      }
    }

    const client = new line.Client(config)
    await client.pushMessage(receiver, content)

    return true
  } catch (error) {
    console.log(error);
    return false
  }
}

app.post('/aec/updatePickingList', async (req, res) => {
  try {
    const {token, ids} = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const status = 'wait'
    const todo = parseInt('0001', 2)

    await models.orders.update({todo, status}, {where: {orderId: {[Op.in]: ids}}})

    return res.json({
      status: true,
      message: 'Update success'
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// [INFO] AEC Get Admins 管理者アカウント一覧取得                                  //
// ------------------------------------------------------------------------------//
app.get("/aec/admins", async (req, res) => {
  try {

    //データ取得
    const admins = await models.administrators.findAll({
      where: {
        deleteFlg: 0
      },
      order: [['adminId', 'asc']],
    })

    // Response 返却
    return res.json({ admins })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Create Admins 管理者アカウン追加                                     //
// ------------------------------------------------------------------------------//
app.post("/aec/admins/create", async (req, res) => {
  try {
    const {token, admin} = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) {
      return res.status(401).send('Unauthenticated error!')
    }

    // Create Admin
    const result = await models.administrators.create(admin)

    return res.status(201).json({
        record: result,
      status: true
    })

  } catch (err) {
    console.error(err)
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Update Admins 管理者アカウン更新                                     //
// ------------------------------------------------------------------------------//
app.post("/aec/admins/:adminId", async (req, res) => {
  try {
    const {token, admin} = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) {
      return res.status(401).send('Unauthenticated error!')
    }

    // Update Admin
    await models.administrators.update(admin, {
      where: {adminId: admin.adminId},
    });

    return res.json({
      record: await models.administrators.findByPk(admin.adminId),
      status: true
    })

  } catch (err) {
    console.error(err)
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})
// ------------------------------------------------------------------------------//
// [INFO] AEC Update Admins 管理者アカウン更新                                     //
// ------------------------------------------------------------------------------//
app.delete('/aec/admins/:adminId', async (req, res) => {
  try {
    const {token} = req.body

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    await models.administrators.update(
      {deleteFlg: 1},
      {where: {adminId: req.params.adminId}}
    );

    return res.json({
      status: true
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})
// ------------------------------------------------------------------------------//
// [INFO] AEC Get Apps for shipping                                              //
// ------------------------------------------------------------------------------//
app.get("/aec/postage/apps", async (req, res) => {
    try {
      const apps = await models.apps.findAll({
        where: {
          deleteFlg: 0,
        },
        attributes: ['shop_code', 'app_name']
      })

      // Response 返却
      return res.json({
        status: true,
        apps
      })
    } catch (err) {
      console.log(err);
    }
  }
)
// ------------------------------------------------------------------------------//
// [INFO] AEC Get postage                                                        //
// ------------------------------------------------------------------------------//
app.get('/aec/getpostage', async (req, res) => {
  try {
    const {shop_code} = req.query
    const result = await models.postages.findAll({
      where: {
        shop_code: shop_code
      },
      order: [
        ['pref_code', 'ASC'],
        ['size_code', 'DESC']
      ]
    })
    const postage = [];

    result.forEach(item => {
      const index = postage.findIndex(i => i.perf === item.pref_code);
      if(index === -1) {
        postage.push({
          perf: item.pref_code,
          flg: item.shipping_flg ? 1 : 0,
          fee: [item.shipping_fee]
        })
      } else {
        postage[index].fee.push(item.shipping_fee);
        if(!postage[index].flg && item.shipping_flg) {
          postage[index].flg = 1;
        }
      }
    });
    return res.json({
      status: true,
      postage: postage
    })
  } catch (err) {
    console.log(err);
  }}
)
// ------------------------------------------------------------------------------//
// [INFO] AEC Update postage                                                     //
// ------------------------------------------------------------------------------//
app.post("/aec/updatepostage", async (req, res) => {
  try {
    const token = req.body.token;
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const dataPostage = req.body.data.postage;
    const shop_code = req.body.data.shop;

    const sizes = ['S', 'M', 'L'];

    const dataConvert = [];

    dataPostage.forEach(obj => {
      const { perf, flg, fee } = obj;
      fee.forEach((feeValue, index) => {
        dataConvert.push({ pref_code: perf, shipping_flg: flg || false, shipping_fee: feeValue || null, size_code: sizes[index] , shop_code: shop_code});
      });
    });

    dataConvert.forEach(async (postage) => {
      const defaults = postage;
      const [result, created] = await models.postages.findOrCreate({
        where: { pref_code: postage.pref_code,  size_code: postage.size_code , shop_code: shop_code},
        defaults
      });
      if (!created) {
        await models.postages.update(postage, {
          where: { postage_id: result.postage_id },
        });
      }
    });

    const postages = await models.postages.findAll({
      where: {
        shop_code: shop_code
      },
      order: [
        ['pref_code', 'ASC'],
        ['size_code', 'DESC']
      ]
    })
    // Response 返却
    res.type("json")
    return res.status(200).send({
      status: true,
      postages: postages })
  } catch (err) {
    log.error(req, err)
    return res.status(500).send()
  }
})

// update or create tag
app.post('/aec/updatetag', async (req, res) => {
  try {
    const { token, data } = req.body;
    data.tagId = data.tagId ? data.tagId : null;
    data.tagValue = data.tagValue ? data.tagValue : null;

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    let existingTag = await models.tags.findOne({
      where: {
        tagValue: data.tagValue,
      },
    });

    if (!existingTag) {
      // If the tag content is not registered: add it
      const [instance, created] = await models.tags.upsert(data);
      existingTag = instance;
    } else if (existingTag.deleteFlg !== 0) {
      // If the tag content was deleted: set deleteFlg to 0 (in use)
      existingTag.deleteFlg = 0;
      await existingTag.save();
    }

    return res.status(200).send({tag: { tagId: existingTag.tagId, tagValue: existingTag.tagValue }});
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// delete tag
app.post('/aec/deletetag', async (req, res) => {
  try {
    const {token, data} = req.body
    
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    await models.tags.update({deleteFlg: 1}, {where: {tagId: data.tagId}})

    return res.status(200).send()
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// ------------------------------------------------------------------------------//
// [INFO] AEC Get Apps for sales                                              //
// ------------------------------------------------------------------------------//
app.get("/aec/sales/apps", async (req, res) => {
  try {
    const apps = await models.sequelize.query(`
      select shopId, app_id, app_name from apps join shops on shops.shopCode = apps.shop_code where apps.deleteFlg = 0;
    `, { type: models.sequelize.QueryTypes.SELECT })

    // Response 返却
    return res.json({ apps })
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }}
)

// get sales orders
app.get('/aec/sales/orders', async (req, res) => {
  try {
    const date = req.query.date || $dayjs().format('YYYY-MM')
    const app = +req.query.app || null

    const condition = app ? ` AND appId = ${app}` : ''

    const orders = await models.sequelize.query(`
      SELECT
        orders.orderId,
        DATE_FORMAT(orders.orderDate, '%Y-%m-%d') AS orderDate,
        shops.shopName AS orderShop,
        orders.userName AS orderUser,
        orders.payment,
        CAST(orders.salesChannel AS UNSIGNED) AS salesChannel,
        apps.app_name AS appName,
        shopUsers.userName AS shopUser,
        orders.deliveryMethod
      FROM orders
        LEFT JOIN users AS customers ON customers.userId = orders.userId
        LEFT JOIN shops ON shops.shopId = customers.shopId
        LEFT JOIN apps ON apps.app_id = orders.appId
        LEFT JOIN users AS shopUsers ON shopUsers.userId = orders.shopuserId
      WHERE
        orders.status != 'cancel'
        AND DATE_FORMAT(orders.orderDate, '%Y-%m') = '${date}'
        ${condition}
      ORDER BY orders.orderId DESC
    `, { type: models.sequelize.QueryTypes.SELECT })
    
    // Response 返却
    return res.json({ orders })
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

// delete limited
app.post('/aec/limiteds/deletelimited', async (req, res) => {
  const t = await models.sequelize.transaction()
  try {
    const {token, data} = req.body
    
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const {productId, shopId} = data

    await models.product_shops.destroy({where: {productId, shopId}}, { transaction: t })

    await models.product_prices.destroy({where: {productId, shopId}}, { transaction: t })

    await t.commit()
    return res.status(200).send()
  } catch (err) {
    await t.rollback()
    console.log(err)
    return res.status(500).send()
  }
})

// update limited
app.post('/aec/limiteds/updatelimited', async (req, res) => {
  const t = await models.sequelize.transaction()
  try {
    const {token, data} = req.body
    
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const {productId, shopId, limitedShop, limitedPrice} = data

    if (!limitedShop) await models.product_shops.destroy({where: {productId, shopId}}, { transaction: t })
    else {
      const productShop = await models.product_shops.findOne({where: {productId, shopId}})
      await models.product_shops.upsert({pid: productShop?.pid, productId, shopId}, { transaction: t })
    }

    if (!limitedPrice) await models.product_prices.destroy({where: {productId, shopId}}, { transaction: t })
    else {
      const productPrice = await models.product_prices.findOne({where: {productId, shopId}})
      await models.product_prices.upsert({pid: productPrice?.pid, productId, shopId, productPrice: limitedPrice}, { transaction: t })
    }

    await t.commit()
    return res.status(200).send()
  } catch (err) {
    await t.rollback()
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/limiteds/apps', async (req, res) => {
  try {
    const {token} = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const apps = await models.sequelize.query('SELECT shopId, app_name FROM apps JOIN shops ON shopCode = shop_code WHERE apps.deleteFlg = 0', { type: models.sequelize.QueryTypes.SELECT });
    return res.json({
      status: true,
      apps
    })
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }}
)

app.get('/aec/limiteds/products', async (req, res) => {
  try {
    const { token, shop } = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const shopId = +shop || 0;

    if(shopId <= 0 ) {
      return res.json({
        status: false,
        products: []
      })
    }

    // Set the shopId variable
    await models.sequelize.query(`SET @shopId = ${shopId}`);

    const products = await models.sequelize.query(`
      SELECT
        productId, productCode, productName, @shopId AS shopId,
        (SELECT app_name FROM apps JOIN shops ON shopCode = shop_code WHERE shops.shopId = @shopId) AS app_name,
        MAX(isLimitedShop) AS isLimitedShop, MAX(limitedShop) AS limitedShop,
        MAX(isLimitedPrice) AS isLimitedPrice, MAX(standardPrice) AS standardPrice, MAX(limitedPrice) AS limitedPrice
      FROM(
        SELECT
          products.productId, productCode, productName,
          shop AS isLimitedShop, null AS limitedShop,
          productPriceS AS isLimitedPrice, productPriceBC AS standardPrice, null AS limitedPrice
        FROM products
        WHERE deleteFlg = 0 AND NOT(productPriceS = 0 AND shop = 0)
        UNION
        SELECT
          products.productId, productCode, productName,
          shop AS isLimitedShop, shopId AS limitedShop,
          0 AS isLimitedPrice, 0 AS standardPrice, null AS limitedPrice
        FROM products
        JOIN product_shops ON product_shops.productId = products.productId
        WHERE deleteFlg = 0 AND NOT(productPriceS = 0 AND shop = 0) AND product_shops.shopId = @shopId
        UNION
        SELECT
          products.productId, productCode, productName,
          0 AS isLimitedShop, null AS limitedShop,
          productPriceS AS isLimitedPrice, productPriceBC AS standardPrice, productPrice AS limitedPrice
        FROM products
        JOIN product_prices ON product_prices.productId = products.productId
        WHERE deleteFlg = 0 AND NOT(productPriceS = 0 AND shop = 0) AND product_prices.shopId = @shopId
      ) AS limiteds
      GROUP BY limiteds.productId;
    `, {
      type: models.sequelize.QueryTypes.SELECT
    })

    return res.json({
      status: true,
      products
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/limiteds/product', async (req, res) => {
  try {
    const { token, shop, product } = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const shopId = +shop || 0;
    const productId = +product || 0;

    // Set the shopId variable
    await models.sequelize.query(`SET @shopId = ${shopId}`);

    // Set the productId variable
    await models.sequelize.query(`SET @productId = ${productId}`);

    // Execute the SELECT query
    const p = await models.sequelize.query(`
        SELECT
          @productId as productId, productCode, productName, @shopId AS shopId,
          (SELECT app_name FROM apps JOIN shops on shopCode = shop_code WHERE shops.shopId = @shopId) AS app_name,
          shop AS isLimitedShop, product_shops.shopId AS limitedShop,
          productPriceS AS isLimitedPrice, productPriceBC AS standardPrice, product_prices.productPrice AS limitedPrice
        FROM products
        LEFT JOIN product_shops ON product_shops.productId = products.productId AND product_shops.shopId = @shopId
        LEFT JOIN product_prices ON product_prices.productId = products.productId AND product_prices.shopId = @shopId
        WHERE products.productId = @productId;
      `,
      {type: models.sequelize.QueryTypes.SELECT}
    );

    if (p.length === 0) {
      return res.status(404).json({
        status: false,
        product: {}
      });
    }

    return res.json({
      status: true,
      product: p[0]
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})


/**
 * convert multicast message from
 * [{
      editor: {text: true, image: false, movie: false},
      text: '',
      originalContentUrl: '',
      previewImageUrl: '',
    }] to correct Line message type
 **/ 
const convert2LineMessages = (messages) => {
  return messages.map((message) => {
    const {editor, text, originalContentUrl, previewImageUrl} = message;
    switch (true) {
      case editor.text:
        return {
          type: 'text',
          text
        }
      case editor.image:
        return {
          type: 'image',
          originalContentUrl,
          previewImageUrl
        }
      case editor.movie:
        return {
          type:'video',
          originalContentUrl,
          previewImageUrl
        }
    }
  })
}

// sendline message
app.post('/aec/linemsg/sendline', async (req, res) => {
  try {
    const { token, data } = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const {send, msg} = data

    if (send === 'stop') {
      await models.messages.update({status: ''}, {where: {msgId: msg.messageId}})
      return res.status(200).send()
    }
    
    const to = send === 'test' ? (process.env.OPERATOR_MSG_TO?.split(',') || []) : data.to
    if (to.length == 0) return res.status(200).send();
    const messages = convert2LineMessages(msg.message)

    // get config of b2b channel
    // const b2bConfig = getAppChannel(channelTypes.B2B)
    // const b2bClient = new line.Client(b2bConfig)

    // get config of b2b spot channel
    const spotConfig = getAppChannel(channelTypes.SPOT)
    const spotClient = new line.Client(spotConfig)

    if (send === 'reserve') {
      // get milliseconds
      let time = new Date(msg.laterSend.id) - new Date()

      if (time <= 0) {
        return res.json({status: false, message: '指定時刻は未来の日時にしてください。'})
      }
    }
    else {
      if (send === 'now'){
        await  models.sequelize.query(`UPDATE messages SET lastSend = "${$dayjs().format('YYYY-MM-DD HH:mm:ss')}" WHERE msgId = ${msg.messageId}`, { type: sequelize.QueryTypes.UPDATE });
      }
      // send message to user add friend with b2b channel
      // await b2bClient.multicast(to, messages)
      // send message to user add friend with b2b spot channel
      await spotClient.multicast(to, messages)
    }

    return res.status(200).send()

  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/messages', async (req, res) => {
  try {
    const { token } = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    // Execute the SELECT query
    let messages = await models.sequelize.query(`
      SELECT *,
       DATE_FORMAT(laterSend, '%Y-%m-%d %H:%i') AS laterSend,
       DATE_FORMAT(lastSend, '%Y-%m-%d %H:%i') AS lastSend
      FROM messages
      ORDER BY msgId DESC`,
      {type: models.sequelize.QueryTypes.SELECT}
    );

    messages = messages.map(message => {
      let {msgId, status, message: messageContent, tag, laterSend, lastSend} = message;
      let messageObj = null;

      try {
        messageObj = (new Function( "return " + messageContent ) )() ;
      } catch (e) {
        messageObj = messageContent;
      }

      try {
        tag = JSON.parse(tag);
      } catch (e) {
        tag = [];
      }

      const transformedMessage = {
        messageId: msgId,
        status: status || '',
        message: messageObj,
        tag,
        laterSend:  laterSend || '',
        lastSend: lastSend || '',
      };
      return transformedMessage;
    });

    return res.json({
      status: true,
      messages
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

async function sendLater() {
  try {
    const currentTime = $dayjs().format('YYYY-MM-DD HH:mm')
    let messages = await models.sequelize.query(`
      SELECT *
      FROM messages 
      WHERE status = 'reserve' AND DATE_FORMAT(laterSend, '%Y-%m-%d %H:%i') = '${currentTime}'
    `, {type: models.sequelize.QueryTypes.SELECT})

    messages = messages.map(message => {
      let {msgId, message: messageContent, tag} = message;
      let messageObj = null;

      try {
        messageObj = (new Function( "return " + messageContent ) )() ;
      } catch (e) {
        messageObj = messageContent;
      }

      try {
        tag = JSON.parse(tag);
      } catch (e) {
        tag = [];
      }

      const transformedMessage = {
        messageId: msgId,
        messageContent: messageObj,
        tag,
      };
      return transformedMessage;
    });

    for (const message of messages) {
      const { messageContent, tag, messageId } = message;
      
      // const toB2B = await getDeliveries(tag, 0b0001);
      const toSpot = await getDeliveries(tag, 0b0010);

      const content = convert2LineMessages(messageContent)

      await models.sequelize.query(`UPDATE messages SET status = "later",  lastSend = "${$dayjs().format('YYYY-MM-DD HH:mm:ss')}" WHERE msgId = ${messageId}`, { type: sequelize.QueryTypes.UPDATE });
      // send message to user add friend with b2b channel
      // if (toB2B.length > 0) {
      //   const b2bConfig = getAppChannel(channelTypes.B2B)
      //   const b2bClient = new line.Client(b2bConfig)
      //   await b2bClient.multicast(toB2B, content)
      // }

      // send message to user add friend with b2b spot channel
      if (toSpot.length > 0) {
        const spotConfig = getAppChannel(channelTypes.SPOT)
        const spotClient = new line.Client(spotConfig)
        await spotClient.multicast(toSpot, content)
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getDeliveries(tags, type = null) { // type 0b0001: b2b normal, 0b0010: b2b spot
  try {
    let deliveries = []
    if (!tags?.length) return []

    let typeCondition = type ? ` AND (users.salesChannel & ${type}) > 0` : ''

    for (const tag of tags) {
      const t = await models.sequelize.query(`
        SELECT DISTINCT userLine
        FROM users 
        WHERE deleteFlg = 0 AND FIND_IN_SET('${tag}', SUBSTRING(tag, 2, LENGTH(tag) - 2)) > 0
        AND userLine IS NOT NULL AND LENGTH(userLine) > 0 ${typeCondition}
      `,
        {type: models.sequelize.QueryTypes.SELECT}
      );

      t.forEach(user => {
        deliveries.push(user.userLine)
      })
    }

    return [...new Set(deliveries)]
  } catch (error) {
    console.log(error);
  }
} 

app.get('/aec/delivery', async (req, res) => {
  try {
    const { token, tag } = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const tags = tag.split(',').map(tag=>+tag)
    const delivery = await getDeliveries(tags)

    return res.status(200).json({ delivery })
  } catch (error) {
    console.log(error);
    return res.status(500).send()
  }
})

app.get('/aec/message', async (req, res) => {
  try {
    const { token, id } = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const messageId = +id || 0;

    // Set the shopId variable
    await models.sequelize.query(`SET @msgId = ${messageId}`);

    // Execute the SELECT query
    let m = await models.sequelize.query(`
      SELECT *,
       DATE_FORMAT(laterSend, '%Y-%m-%d %H:%i') AS laterSend,
       DATE_FORMAT(lastSend, '%Y-%m-%d %H:%i') AS lastSend
      FROM messages
      WHERE msgId = @msgId`,
      {type: models.sequelize.QueryTypes.SELECT}
    );

    if (m.length === 0) {
      return res.status(404).json({
        status: false,
        message: {}
      });
    }

    let {msgId, status, message: messageContent, tag, laterSend, lastSend} = m[0];
    let messageObj = null;

    try {
      messageObj = (new Function( "return " + messageContent ) )() ;
    } catch (e) {
      messageObj = messageContent;
    }

    try {
      tag = JSON.parse(tag);
    } catch (e) {
      tag = [];
    }

    m = {
      messageId: msgId,
      status: status || '',
      message: messageObj,
      tag,
      laterSend:  laterSend || '',
      lastSend: lastSend || '',
    };

    return res.json({
      status: true,
      message: m
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.post('/aec/updatemsg', async (req, res) => {
  try {
    const { token, data } = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const messageData = {
      msgId: +data.messageId,
      status: data.status,
      message: data.message,
      tag: data.tag.filter(item => item !== null),
      laterSend: data.laterSend != '' ? getUTCDateTime(data.laterSend.trim()) : null,
      lastSend: data.status !== 'now' ? null : getUTCDateTime()
    };

    messageData.message = JSON.stringify(messageData.message);
    messageData.tag = JSON.stringify(messageData.tag);

    console.log(messageData)

    const [result, created] = await models.messages.upsert(messageData);

    return res.json({
      status: true,
      messageId: result.msgId || messageData.msgId
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// delete message
app.post('/aec/deletemessage', async (req, res) => {
  try {
    const { token, data } = req.body
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    const { msgId, deletable } = data

    if (!deletable) {
      return res.json({ status: false })
    }

    await models.messages.destroy({ where: { msgId }} )
    return res.json({
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// get login info
app.get('/aec/line', async (req, res) => {
  try {
    const { token } = req.query
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    // Set the shopId variable
    const id = req.query.id || null
    const name =  req.query.name || ''
    log.aecUser(`Name: ${name}, UserId: ${id}, AccessDateTime: ${new Date()}`)

    await models.sequelize.query(`SET @lineId = '${id}'`);

    // Execute the SELECT query
    let loginInfo = await models.sequelize.query(`
      SELECT
      TRUE AS adminUser, adminId AS userId, IF(adminName IS NOT NULL AND LENGTH(TRIM(adminName)) > 0, TRIM(adminName), '${name}') AS name,
        NULL AS shopId, privilege AS role, adminLine AS line, FALSE AS shopManager
      FROM
        administrators
      WHERE
        deleteFlg = 0 AND adminLine = @lineId
      UNION
      SELECT
      FALSE AS adminUser, userId AS userId, IF(ordererName IS NOT NULL AND LENGTH(TRIM(ordererName)) > 0, TRIM(ordererName), IF(userName IS NOT NULL AND LENGTH(TRIM(userName)) > 0, TRIM(userName), '${name}')) AS name,
        shopId AS shopId, isParent AS role, userLine AS line, isParent AS shopManager
      FROM
        users
      WHERE
        deleteFlg = 0 AND userLine = @lineId;`,
      {type: models.sequelize.QueryTypes.SELECT}
    );

    if (loginInfo.length === 0)
      return res.status(404).json({ status: false, loginInfo: {} })

    // convert number to boolean
    loginInfo = {
      adminUser: !!loginInfo[0].adminUser,
      userId: loginInfo[0].userId,
      name: loginInfo[0].name,
      shopId: loginInfo[0].shopId,
      role: loginInfo[0].role,
      line: id,
      shopManager: !!loginInfo[0].shopManager,
    }
    
    return res.status(200).json({ status: true, loginInfo })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// ユーザーチェック
app.get( '/checkUser/*' , async (req, res) => {
  try {
    const token = await req.params[0] || ''
    const verify = await verifyToken( token )

    const query  = `
      SELECT
        users.userId                  AS uid,
        users.userLine                AS user_id,
        shops.shopCode                AS shop_code,
        ( SELECT
            userId 
          FROM 
            users 
          WHERE 
            shopId IN (SELECT shopId FROM users WHERE userLine='${verify.sub}' AND deleteFlg = 0) 
            AND
              isParent=1
            AND
              deleteFlg = 0
          LIMIT 1
        )                             AS parent_uid,
        users.userName                AS display_name,
        IF(users.deleteFlg=0, 1, 0)   AS available,
        users.active
      FROM
        users
      LEFT JOIN
        shops ON users.shopId = shops.shopId
      WHERE
        users.userLine = '${verify.sub}' AND users.active = 1 AND users.deleteFlg = 0;
    `
    const users = await models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT })

    if ( users.length > 0 ) {
      if (!users[0].active) return res.json({ status: 'error', message: 'ユーザーが登録されていません', user: [] })
      return res.json({ status: 'success', user: users[0] })
    }
    return res.json({ status: 'error', message: '利用登録を確認し、ログインしてご利用ください。', user: [] })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// 購入履歴の取得
app.get('/histories', async (req, res) => {
  try {
    const auth = req.headers.authorization?.replace('Bearer ','') || null

    const user = await models.users.findOne({ where: { userLine: auth, deleteFlg: 0 }, include: [{
      model: models.shops,
      required: true
    }] })
    
    if (!user) {
      return res.json({ status: 'error', message: '不正なアクセスです' })
    }

    const orders = await models.sequelize.query(`
      SELECT
        orders.orderId AS order_id,
        orders.userId AS user_id,
        '${user.shop?.shopCode || null}' AS shop_code,
        orders.status,
        DATE_FORMAT(orders.preferredDate, '%Y-%m-%d') AS deliv_date,
        orders.orderMemo AS order_memo,
        DATE_FORMAT(orders.orderDate, '%Y-%m-%d %H:%i') AS order_date
      FROM
        orders
      WHERE
        orders.userId IN (
          SELECT DISTINCT user2.userLine FROM users AS user1, users AS user2 WHERE user1.userLine = '${auth}' AND user1.shopId = user2.shopId
        )
        AND (orders.salesChannel & b'0001') > 0
      ORDER BY
        order_date DESC, deliv_date DESC
    `, { type: models.sequelize.QueryTypes.SELECT })

    let results = []
    for (let order of orders) {
      const cart = await models.sequelize.query(`
        SELECT
          carts.productId AS product_id,
          carts.orderId AS order_id,
          '${order.user_id}' AS user_id,
          carts.price,
          products.productGroup AS group_code,
          carts.productCode AS product_code,
          carts.productName AS product_name,
          carts.quantity,
          IF(
            products.productId IS NOT NULL 
            AND products.isOnsale = 1
            AND products.deleteFlg = 0
            AND (products.salesChannel & b'0001') > 0,
            1,
            0) AS available,
          '${user.shop?.shopCode || null}' AS shop_code
        FROM
          carts
        LEFT JOIN
          products ON carts.productId = products.productId
        WHERE
          carts.orderId = '${order.order_id}'
      `, { type: models.sequelize.QueryTypes.SELECT })
      order.cart = cart
      order.popup = false
      results.push(order)
    }

    return res.json({ status: 'success', message: '履歴を取得しました', histories: results } )
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// 商品リストの取得
app.get('/b2b/products/*', async (req, res) => {
  try {
    const shop_code = req.params[0] || ''
    const search = req.query.search || ''
    const productIds = req.query.productIds || ''
    const paging = req.query?.paging ?? true;

    let searchCondition = ''
    if (search) {
      searchCondition += ` AND (products.productName like '%${search}%' OR products.productOrign like '%${search}%' OR FIND_IN_SET('${search}', products.productTag))`
    }

    if (productIds.length > 0) {
      searchCondition += ` AND products.productId IN (${productIds})`
    }

    const getAll = req.query.getAll == 'true'

    const perPage = +req.query.perPage || process.env.B2B_PER_PAGE || 15
    const currentPage = +req.query.currentPage || 1
    
    const offset = (currentPage - 1) * perPage
    const limit = getAll ? '' : `LIMIT ${offset},${perPage}`

    const serverUrl = `${req.protocol}://${req.get('host')}`

    const query = `
      SELECT
        '${shop_code}' AS shop_code, 
        null AS shop_name, 
        products.productGroup AS group_code, 
        products.deleteFlg AS del_flg, 
        products.productCode AS product_code,
        products.productCode AS p_code, 
        products.productPriceB AS now_price, 
        null AS new_price_date, 
        products.productPriceB AS new_price, 
        products.productId AS product_id, 
        0 AS priority, 
        products.productName AS product_name, 
        products.unit AS unit_code,
        products.productPriceB AS base_price, 
        products.productOrign AS origin, 
        products.productTag,
        IF(products.productPhoto1 > 0, CONCAT('${serverUrl}/aec/product-images/', products.productPhoto1, '/file?type=origin'), '') AS product_image_origin,
        IF(products.productPhoto1 > 0, CONCAT('${serverUrl}/aec/product-images/', products.productPhoto1, '/file?type=thumb'), '') AS product_image_thumb
      FROM products
      WHERE (products.salesChannel & b'0001') > 0 AND products.isOnsale = 1 AND products.deleteFlg = 0 ${searchCondition}
      ORDER BY products.productId DESC
      ${limit};
    `
    let products = await models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT })

    //get total
    const query_count = `
      SELECT
        COUNT(products.productId) AS count_product
      FROM products
      WHERE (products.salesChannel & b'0001') > 0 
        AND products.isOnsale = 1 AND products.deleteFlg = 0 
        ${searchCondition};
    `
    let counts = await models.sequelize.query(query_count, { type: models.sequelize.QueryTypes.SELECT })

    products = products.map(product => {
      let productTag = product.productTag || ''
      productTag += ',,,,,,,,,,'

      const tags = productTag.split(',')

      for (let i = 0; i < 10; i++) {
        product[`tag0${i}`] = tags[i] || null
      }
      
      product.popup    =  false
      product.view     =  true
      product.lock     =  false
      product.quantity =  0

      if(!product.product_image_origin) {
        product.product_image_origin = `${serverUrl}/aec/product-images/null/file`
      }

      if(!product.product_image_thumb) {
        product.product_image_thumb = `${serverUrl}/aec/product-images/null/file`
      }

      const extract = [...product.product_name, product.origin, tags.join('')]
      product.extract = extract.join('')

      delete product.productTag

      return product
    })
    if(getAll){
      return res.json({ status: 'success', products, totalProduct: counts[0].count_product })
    }
    return res.json({ status: 'success', products, perPage, currentPage, totalProduct: counts[0].count_product })
  } catch (e) {
    console.log(e)
    return res.json({ status: 'error', message: `商品リストが取得できませんでした(${e.message})` })
  }
})

const formatUser = users => {
  if(!users){
    return null;
  }
  const formatObj = user => ({
    userId: user.userLine,
    regist: user.regist,
    bizName: user.shop?.bizName,
    shopName: user.shop?.shopName,
    ordererName: user.ordererName,
    shop_tel: user.shop?.shopTel,
    manager: null,
    user_tel: user.userTel,
    displayName: user.userName,
    flg_active: user.active,
    flg_1: 0,
    flg_2: 0,
    flg_3: 0,
    flg_4: 0,
    flg_5: user.purchase,
    shopCode: user.shop?.shopCode,
    isParent: user.isParent,
  });

  if (Array.isArray(users)) {
    return users.map(formatObj);
  }

  return formatObj(users);
};

app.put('/checkShopUser', async function (req, res) {
  try {
    let {userId, channel, shopCode} = req.body

    if (!userId || !channel || !shopCode) {
      return res.status(400).json({ status: 'error', message: 'Invalid request. Please provide userId, channel, and shopCode.' });
    }

    channel = (channel === 's') ? '0010' : (channel === 'b') ? '0001' : '0000';

    const shop = await models.shops.findOne({
      where: {
        shopCode: shopCode,
        deleteFlg: 0,
      }
    });

    if(!shop){
      return res.json({status: 'shopNotExist', message: `Shop code is not exist or not avaiable`, data: null})
    }

    const { count, rows } = await models.users.findAndCountAll({
      include: [{
        model: models.shops,
        required: true,
      }],
      where: {
        [Op.and]: [
          models.sequelize.literal(`(salesChannel & b'${channel}') > 0`),
          { isParent: 1 },
          { deleteFlg: 0 },
          { '$shop.shopCode$': { [Op.eq]: shopCode } }
        ]
      },
    });

    const verify = await models.users.findOne({
      include: [{
        model: models.shops,
        required: true,
      }],
      where: {
        userLine: userId,
        deleteFlg: 0,
      }
    });

    if (verify) {
      if(verify?.shop?.shopCode != shopCode){
        return res.json({status: 'exist', message: 'User is exist in other shop', data: {
            ...formatUser(verify),
            otherShop: shop,
          }})
      }else{
        return res.json({status: 'user', message: `This is your info`, data: formatUser(verify)})
      }
    }else{
      if (count === 1) {
        return res.json({status: 'already', message: 'Parent user is already, this is parent info', data: formatUser(rows[0])})
      }

      if (count > 1) {
        return res.status(400).json({status: 'count', message: `Exist ${count} parent user in system, this is parents info`, data: formatUser(rows)})
      }
    }

    return res.status(400).json({status: 'error', message: `Parent user is not exist`, data: null})

  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.put('/saveShopUser', async function (req, res) {
  const t = await models.sequelize.transaction()
  try {

    let {token, userId, channel, shopCode, setUser} = req.body;

    if (token !== process.env.INFO_TOKEN) return res.status(401).send()

    if (!userId || !channel || !shopCode) {
      return res.status(400).json({ status: 'error', message: 'Invalid request. Please provide userId, channel, and shopCode.' });
    }

    let user;

    channel = (channel === 's') ? '0010' : (channel === 'b') ? '0001' : '0000';

    const parent = await models.users.findOne({
      include: [{
        model: models.shops,
        required: true,
      }],
      where: {
        [Op.and]: [
          models.sequelize.literal(`(salesChannel & b'${channel}') > 0`),
          { isParent: 1 },
          {
            [Op.or]: [
              { userLine: { [Op.ne]: userId } },
              models.sequelize.literal(`users.userLine IS NULL`),
            ]
          },
          { deleteFlg: 0 },
          { '$shop.shopCode$': { [Op.eq]: shopCode } }
        ]
      },
    });

    const shop = await models.shops.findOne({
      where: {
        [Op.and]: [
          {shopCode: shopCode},
          models.sequelize.literal(`NULLIF(shopCode, ' ') IS NOT NULL`),
          {deleteFlg: 0},
        ]
      },
    });

    if(!shop){
      return res.status(400).json({ status: 'error', message: 'Shop is not exist' });
    }

    shop.bizName = setUser.bizName;
    shop.shopTel = setUser.shop_tel;

    await shop.save({ transaction: t });

    if(parent && !parent.userLine?.trim()){
      parent.userLine = userId;
      parent.userName = setUser.displayName;
      parent.ordererName = setUser.ordererName;
      parent.userTel = setUser.user_tel;
      parent.shop.bizName = setUser.bizName;
      parent.shop.shopTel = setUser.shop_tel;
      parent.regist = 1;

      if(channel === '0010'){
        parent.purchase = 1;
      }

      if(channel === '0001'){
        parent.active = 1;
      }
      
      await parent.save({ transaction: t });
      user = parent;
    }else{
      user = await models.users.findOne({
        include: [{
          model: models.shops,
          required: true,
        }],
        where: {
          [Op.and]: [
            { userLine: { [Op.eq]: userId } },
            { deleteFlg: 0 },
            { '$shop.shopCode$': { [Op.eq]: shopCode } }
          ]
        },
      });

      if(!user){
        user = await models.users.create({
          isParent: 0,
          userCode: new Date().getTime().toString(),
          userLine: userId,
          userName: setUser.displayName,
          ordererName: setUser.ordererName,
          userTel: setUser.user_tel,
          shopId: shop.shopId,
          salesChannel: parseInt(channel, 2),
          regist: 1,
          active: channel === '0010' ? 0 : 1,
          purchase: channel === '0010' ? 1 : 0,
          deleteFlg: 0
        }, { transaction: t});
      }else{
        // Update existing user properties
        if (setUser.displayName) {
          user.set({ userName: setUser.displayName });
        }

        if (setUser.ordererName) {
          user.set({ ordererName: setUser.ordererName });
        }

        if (setUser.user_tel) {
          user.set({ userTel: setUser.user_tel });
        }

        await user.save({ transaction: t });
      }
    }

    await t.commit();

    user = await models.users.findOne({
      include: [{
        model: models.shops,
        required: true,
      }],
      where: {
        [Op.and]: [
          { userId: user.userId },
        ]
      },
    });

    user = formatUser(user)

    return res.json({ user})
  } catch (err) {
    await t.rollback()
    log.error(req, err)
    console.log(err);
    return res.status(500).send()
  }
})

/*
* ID 連携
*************************************************************/
app.put('/addShopUser', async function (req, res) {
  const t = await models.sequelize.transaction()
  try {
    let { userId, channel, shopCode} = req.body
    let user = null;
    let already = false;

    channel = (channel === 's') ? 2 : (channel === 'b') ? 1 : 0;

    const verify = await models.users.findOne({
      include: [{
        model: models.shops,
        required: true,
      }],
      where: {
        userLine: userId,
        deleteFlg: 0,
      },
    }, {transaction: t});

    // ユーザー登録がない場合
    if (!verify) {
      const parent = await models.users.findOne({
        include: [{
          model: models.shops,
          required: true,
          where: {
            shopCode: shopCode,
          },
        }],
        where: {
          isParent: 1,
          deleteFlg: 0,
        },
      }, {transaction: t});

      let shop = await models.shops.findOne({where: {shopCode}},  {transaction: t})

      if (!shop) {
        // create address default for shop
        const address = await models.addresses.create({
          zip: 0,
          prefCode: null,
          perf: null,
          city: '',
          street: '',
          address: '',
          addition: null,
          tel1: null,
          tel2: null,
          tel3: null,
          name: ''
        }, {transaction: t})

        shop = await models.shops.create({
          shopCode,
          shopName: '',
          shopTel: null,
          bizName: '',
          shopGroupId: null,
          addressId: address.addressId,
          shopPickup: 0,
          closing: null,
          tag: '[]',
          deleteFlg: 0
        }, {transaction: t})
      }

      user = await models.users.create({
        isParent: parent ? 0 : 1,
        userCode: new Date().getTime().toString(),
        userLine: userId,
        userName: '',
        shopId: shop.shopId,
        salesChannel: channel,
        userTel: null,
        regist: 1,
        active: 0,
        purchase: 0,
        deleteFlg: 0
      }, { transaction: t});
    } else {
      const salesChannel = bitsToArray(Array.from(verify.salesChannel)[0])
      if (verify.shop?.shopCode == shopCode && salesChannel.includes(channel)) {
        if(verify.isParent == 0){
          verify.isParent = 1;
          verify.save();
        }
      }else{
        // ユーザー登録がある場合
        already = true;
      }
      user = verify;
    }

    await t.commit()

    if(user){

      user = await models.users.findOne({
        include: [{
          model: models.shops,
          required: true,
        }],
        where: {
          userId: user.userId,
        },
      }, {transaction: t});

      user = {
        userId: user.userLine,
        regist: user.regist,
        bizName: user.shop?.bizName,
        shopName: user.shop?.shopName,
        ordererName: user.ordererName,
        shop_tel: user.shop?.shopTel,
        manager: null,
        user_tel: user.userTel,
        displayName: user.userName,
        flg_active: user.active,
        flg_1: 0,
        flg_2: 0,
        flg_3: 0,
        flg_4: 0,
        flg_5: user.purchase,
        shopCode: user.shop?.shopCode,
        isParent: user.isParent,
      }
    }

    if(already){
      return res.json({status: 'already', message: 'User is exist', data: user})
    }

    return res.json({status: 'success', message: `success`, data: user})
  } catch (err) {
    await t.rollback()
    console.log(err)
    return res.status(500).send()
  }
})

//APP 設定読み込み
app.get('/appConfig/*', async (req, res) => {
  try {
    const app = await req.params[0] || null
    const query = `
      SELECT
        app_id,
        app_name,
        app_code,
        msg_channel_secret,
        msg_access_token,
        theme_id,
        logo_gid,
        null AS logo_file_id,
        liff_id,
        logo_gid AS file_id,
        null AS file_url,
        null AS origin_name,
        null AS thumb_url,
        law_prices,
        law_method,
        law_returned,
        law_service,
        law_other,
        law_about,
        privacy_header,
        privacy_information,
        privacy_purpose,
        privacy_consign,
        privacy_furnishing,
        privacy_line,
        privacy_contact,
        terms,
        shops.shopId AS shop_id
      FROM
        apps
      LEFT JOIN shops ON shops.shopCode = apps.shop_code
      WHERE app_name = '${app}' OR app_code = '${app}'`

    const appSetting = await models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT })

    return res.json( appSetting )
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// アプリ設定関連
// 送料テーブルの取得
app.post('/getPrefShipping', async (req, res, next) => {
  try {
    const app_id = req.body.app_id || null

    const results = await models.sequelize.query(`
      SELECT
        apps.app_id  AS app_id, 
        CAST(postages.pref_code AS UNSIGNED) AS pref_code, 
        postages.shipping_flg AS shipping_flg, 
        postages.shipping_fee AS shipping_fee,  
        postages.size_code    AS size_code, 
        const_pref.jp         AS pref_jp, 
        const_pref.en         AS pref_en
      FROM
        apps
      LEFT JOIN
        postages ON apps.shop_code = postages.shop_code
      INNER JOIN
        const_pref ON postages.pref_code = const_pref.pref_code
      WHERE app_id = ${app_id} AND shipping_flg = 1
      ORDER BY pref_code ASC;
    `, { type: models.sequelize.QueryTypes.SELECT })

    return res.json(results)
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})
// ユーザー設定関連

// ユーザー情報関係処理
// ユーザー登録
app.post('/initUser', async ( req, res , next) => {
  try {
    log.user(req)
    const userProfile = JSON.parse( req.body.userProfile ) 
    const app_id      = req.body.app_id

    const checkUser = await models.consumers.findOne({ where: { consumerId: userProfile.userId } })

    if (!checkUser) {
      // create user
      await models.consumers.create({
        consumerId: userProfile.userId,
        consumerName: escapeQuery(userProfile.displayName), 
        addressId: null, 
        appId: app_id
      })
    }
    return res.json([{
      userId: userProfile.userId,
      displayName: escapeQuery(userProfile.displayName),
      createdDate: null,
      app_id
    }])
  } catch (err) {
    console.log(err)
    return res.json([])
  }
})

// ユーザーの登録した配送状況を取得
app.post('/getUserShipping', async (req, res, next) => {
  try {
    const userProfile = JSON.parse(req.body.userProfile)
    
    const user = await models.consumers.findOne({ where: { consumerId: userProfile.userId } })

    if (!user) return res.json([])

    const masterAddressId = user.addressId || null

    const addresses = await models.sequelize.query(`
      SELECT
        addresses.addressId                                    AS shipping_id,
        '${userProfile.userId}'                                AS userId,
        addresses.zip                                          AS zip,
        addresses.perf                                         AS pref,
        addresses.prefCode                                     AS pref_code,
        addresses.city                                         AS city,
        addresses.street                                       AS street,
        addresses.address                                      AS address,
        addresses.addition                                     AS addition,
        addresses.tel1                                         AS tel_1,
        addresses.tel2                                         AS tel_2,
        addresses.tel3                                         AS tel_3,
        addresses.name                                         AS name,
        IF (${masterAddressId} = addresses.addressId, 1, 0)    AS is_master,
        null                                                   AS last_update,
        0                                                      AS is_delete
      FROM
        shipping_addresses
      LEFT JOIN
        addresses ON shipping_addresses.addressId = addresses.addressId
      WHERE
        shipping_addresses.consumerId = '${userProfile.userId}'
    `, { type: models.sequelize.QueryTypes.SELECT })

    return res.json(addresses)
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// ユーザーの購入履歴取得
app.post('/getUserHistory', async (req, res , next) => {
  try {
    const userProfile = JSON.parse(req.body.userProfile) 

    const results = await models.sequelize.query(`
      SELECT
        orderId AS order_id,
        userId,
        userName AS displayName,
        DATE_FORMAT(orderDate, '%Y-%m-%d %H:%i') AS order_date,
        payment AS order_price,
        cartPrice AS cart_price,
        shippingFee AS shipping_fee,
        0 AS shipping_charge,
        paymentMethod AS payment_method,
        null AS session_id,
        appId AS order_app_id,
        status,
        DATE_FORMAT(IF (deliveryDay != NULL OR deliveryDay != '', deliveryDay, orderDate), '%Y-%m-%d %H:%i') AS last_update,
        shipNumber AS slip_number
      FROM
        orders
      WHERE
        userId = '${userProfile.userId}' AND appId = ${req.body.app_id}
      ORDER BY order_id DESC;
    `, { type: models.sequelize.QueryTypes.SELECT })

    let userHistory = []
    for (let order of results) {
      const serverUrl = `${req.protocol}://${req.get('host')}`

      const cart = await models.sequelize.query(`
        SELECT
          carts.cartId AS cart_id,
          carts.orderId AS order_id,
          '${userProfile.userId}' AS userId,
          carts.productId AS product_id,
          carts.productCode AS product_code,
          carts.productName AS product_name,
          carts.price,
          carts.quantity,
          null AS session_id,
          p.productPhoto1 AS product_main,
          IF(
            p.productId IS NOT NULL
            AND p.isOnsale = 1
            AND p.deleteFlg = 0
            AND (p.salesChannel & b'1100') > 0,
            1,
            0) AS in_sales,
          p.quantity AS in_limitedquantity,
          p.end AS in_limitedtime,
          DATE_FORMAT(p.start, '%Y-%m-%d %H:%i') AS sales_start,
          DATE_FORMAT(p.end, '%Y-%m-%d %H:%i') AS sales_end,
          p.deleteFlg AS delete_flg,
          p.stock AS product_stock,
          p.unit AS product_unit,
          IF(p.productPhoto1 > 0,CONCAT_WS('/', '${serverUrl}/aec/product-images', p.productPhoto1, 'file?type=origin'),'${serverUrl}/aec/product-images/null/file') AS file_url,
          pm.fileName AS origin_name,
          IF(p.productPhoto1 > 0,CONCAT_WS('/', '${serverUrl}/aec/product-images', p.productPhoto1, 'file?type=thumb'),'${serverUrl}/aec/product-images/null/file?type=thumb') AS thumb_url
        FROM
          carts
        LEFT JOIN
          products AS p ON carts.productId = p.productId
        LEFT JOIN
          product_images as pm ON p.productPhoto1 = pm.gid
        WHERE
          carts.orderId = ${order.order_id}
      `, { type: models.sequelize.QueryTypes.SELECT })
      order.cart = cart
      userHistory.push(order)
    }
    
    return res.json( userHistory )
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// sss住所データの保存
app.post('/saveShipping', async (req, res , next) => {
  const t = await models.sequelize.transaction()
  try {
    const shipping     = JSON.parse( req.body.shipping )

    let [address, created] = await models.addresses.upsert({
      addressId: shipping.shipping_id || null,
      zip: shipping.zip,
      prefCode: shipping.pref_code || null,
      perf: escapeQuery(shipping.pref),
      city: escapeQuery(shipping.city),
      street: escapeQuery(shipping.street),
      address: escapeQuery(shipping.address),
      addition: escapeQuery(shipping.addition),
      tel1: shipping.tel_1,
      tel2: shipping.tel_2,
      tel3: shipping.tel_3,
      name: escapeQuery(shipping.name)
    }, { transaction: t })

    if (created) {
      await models.shipping_addresses.create({ consumerId: shipping.userId, addressId: address.addressId }, { transaction: t })
    }

    await t.commit()

    return res.json({insertId: created ? address.addressId : 0, affectedRows: 1})
  } catch (err) {
    await t.rollback()
    console.log(err)
    return res.status(500).send()
  }
})

// shippingDataを削除
app.post('/deleteShipping', async (req, res , next) => {
  const t = await models.sequelize.transaction()
  try {
    const address = JSON.parse(req.body.shipping)

    await models.addresses.destroy({ where: { addressId: address.shipping_id }, transaction: t })

    await models.shipping_addresses.destroy({ where: { addressId: address.shipping_id, consumerId: address.userId }, transaction: t })
    
    await t.commit()
    return res.json({ insertId: 0, affectedRows: 1 })
  } catch (err) {
    await t.rollback()
    console.log(err)
    return res.status(500).send()
  }
})

// 県データ取得
app.post('/getConstPref', async (req, res , next) => {
  try {
    const results = await models.const_pref.findAll()

    return res.json( results )
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

////////////////////////////////////////////////////////////////////////////////////////////
////////// 注文処理 /////////////////////////////////////////////////////////////////////////

/* オーダー情報登録
*****************************************************/
app.post('/registOrder', async function (req, res, next) {

  const t = await models.sequelize.transaction()

  try {
    const userProfile = JSON.parse(req.body.userProfile)
    const shipping = req.body.shipping != 'undefined' ? JSON.parse(req.body.shipping) : null
    const cart = req.body.cart ? JSON.parse(req.body.cart) : []
    const orderMethod = JSON.parse(req.body.orderMethod)
    const orderDetail = JSON.parse(req.body.orderDetail)
    const appConfig = JSON.parse(req.body.appConfig)

    if (!cart?.length) return res.json({ order_id: 0, error: 'カートに商品がありません。' })

    const orderData = {
      todo: null,
      status:'prep',
      orderDate: getUTCDateTime(),
      salesChannel: 12,
      userId: userProfile.userId,
      ordererId: null,
      userName: userProfile.displayName,
      orderNum: cart.length,
      cartPrice: orderDetail.cartPrice,
      discount: 0,
      shippingFee: orderDetail.shippingPrice,
      orderFee: 0,
      payment: orderDetail.fullCartPrice,
      paymentMethod: orderMethod.paymentMethod,
      order_stripe_id: null,
      orderMemo: null,
      addressId: shipping.shipping_id,
      deliveryMethod: '宅配',
      preferredDate: null,
      preferredTime: (orderMethod.delivTime == '') ? 'none' : orderMethod.delivTime,
      deliveryDay: null,
      shipNumber: null,
      appId: appConfig.app_id,
      shopuserId: null
    }

    const createdOrder = await models.orders.create(orderData, {
      transaction: t,
    })

    const carts = cart.map((item) => ({
      orderId: createdOrder.orderId,
      productId: item.product_id,
      productCode: item.product_code,
      productName: item.product_name,
      price: item.price,
      quantity: item.quantity,
      userId: userProfile.userId,
      session_id: orderDetail.session_id,
    }));

    await models.carts.bulkCreate(carts, {
      transaction: t,
    })

    // Commit transaction
    await t.commit();
    console.log("Update successful");
    res.json({order_id: createdOrder.orderId})
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
})

app.post('/completeOrder', async function (req, res, next) {

  const t = await models.sequelize.transaction()

  try {
    const userId = req.body.userId
    const order_id = req.body.order_id
    const stripeToken = JSON.parse( req.body.stripeToken )

    // STRIPE 決済情報の保存 ///////////////////////////
    const stripe_columns = `(
            orderId,
            id,
            amount, 
            capture_method,
            client_secret,
            confirmation_method,
            created,
            currency,
            object,
            payment_method,
            payment_method_types,
            status,
            userId
        )`

    const stripe_values = `(
                        ${order_id} , 
                        '${stripeToken.id}' , 
                        ${stripeToken.amount} , 
                        '${stripeToken.capture_method}' , 
                        '${stripeToken.client_secret}' , 
                        '${stripeToken.confirmation_method}' , 
                        ${stripeToken.created} , 
                        '${stripeToken.currency}' , 
                        '${stripeToken.object}' , 
                        '${stripeToken.payment_method}' , 
                        '${stripeToken.payment_method_types[0]}' , 
                        '${stripeToken.status}' , 
                        '${userId}'
        )`

    const [stripeId, status] = await models.sequelize.query(`INSERT INTO order_stripes ${stripe_columns} VALUES ${stripe_values}`, { type: sequelize.QueryTypes.INSERT,  transaction: t });
    console.log(stripeId)
    await models.orders.update(
      { status: 'new', order_stripe_id: stripeId, todo: 0 },
      { where: { orderId: order_id, userId: userId } , transaction: t}
    );

    await models.sequelize.query(`
      DELETE FROM order_cart WHERE userId = '${userId}';
    `, { type: models.sequelize.QueryTypes.DELETE, transaction: t })

    await t.commit();
    console.log("Update successful");
    return res.json({order_id: order_id})
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.json( { status : false, error : err } )
  }
})

/* IDからオーダー情報を取得
*****************************************************/
app.post('/getOrder', async function (req, res, next) {

  const order_id = req.body.order_id
  console.log(req)

  try {
    if(order_id){
      const order = await models.sequelize.query(`
          SELECT orders.orderId AS order_id,
                 orders.userId AS userId,
                 orders.userName AS displayName,
                 orders.orderDate AS order_date,
                 orders.payment AS order_price,
                 orders.cartPrice AS cart_price,
                 orders.shippingFee AS shipping_fee,
                 0 AS shipping_charge,
                 orders.paymentMethod AS payment_method,
                 carts.session_id AS session_id,
                 addresses.zip AS zip,
                 addresses.prefCode AS pref_code,
                 addresses.perf AS pref,
                 addresses.city AS city,
                 addresses.street AS street,
                 addresses.address AS address,
                 addresses.addition AS addition,
                 addresses.tel1 AS tel_1,
                 addresses.tel2 AS tel_2,
                 addresses.tel3 AS tel_3,
                 addresses.\`name\` AS \`name\`,
                 orders.preferredTime AS deliv_time,
                 orders.orderMemo AS note,
                 orders.shipNumber AS shipping_id,
                 order_stripes.id AS stripe_id,
                 order_stripes.amount AS stripe_amount,
                 order_stripes.created AS stripe_created,
                 order_stripes.currency AS stripe_currency,
                 order_stripes.capture_method AS stripe_capture_method,
                 order_stripes.client_secret AS stripe_client_secret,
                 order_stripes.confirmation_method AS stripe_confirmation_method,
                 order_stripes.object AS stripe_object,
                 order_stripes.payment_method AS stripe_payment_method,
                 order_stripes.payment_method_types AS stripe_payment_method_types,
                 order_stripes.\`status\` AS stripe_status,
                 carts.productId AS product_id,
                 carts.productName AS product_name,
                 carts.productCode AS product_code,
                 products.unit AS product_unit,
                 carts.price AS price,
                 carts.quantity AS quantity,
                 orders.orderDate AS last_update,
                 orders.\`status\` AS order_status,
                 orders.appId AS order_app_id
          FROM orders
          LEFT JOIN carts ON orders.orderId = carts.orderId
          LEFT JOIN order_stripes ON orders.orderId = order_stripes.orderId AND orders.order_stripe_id = order_stripes.order_stripe_id
          LEFT JOIN addresses ON orders.addressId = addresses.addressId
          LEFT JOIN products ON carts.productId = products.productId
          WHERE orders.orderId = ${order_id}
        `, {type: models.sequelize.QueryTypes.SELECT})
      return res.json(order);
    }
    return res.status(404).json( { status : false, error : null } )
  } catch (err) {
    console.log(err);
    return res.status(500).json( { status : false, error : err } )
  }
})

async function getArticle(id, serverUrl) {
  const articleImage = await models.article_images.findByPk(id);
  return {
    file_id: articleImage?.gid,
    origin_name: '',
    file_url: `${serverUrl}/aec/article-images/${articleImage?.gid}/file`,
    thumb_url: `${serverUrl}/aec/article-images/${articleImage?.gid}/file?type=thumb`,
  }
}

async function getCDN(id, serverUrl) {
  const productImage = await models.product_images.findByPk(id);
  return {
    file_id: productImage?.gid,
    origin_name: productImage?.fileName,
    file_url: `${serverUrl}/aec/product-images/${productImage?.gid}/file`,
    thumb_url: `${serverUrl}/aec/product-images/${productImage?.gid}/file?type=origin`,
  }
}

async function getCDNForNull(serverUrl) {
  return {
    file_id: null,
    origin_name: null,
    file_url: `${serverUrl}/aec/product-images/null/file`,
    thumb_url: `${serverUrl}/aec/product-images/null/file?type=origin`,
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////
////////// 商品関係処理 /////////////////////////////////////////////////////////////////////

/**************************************************************************
 * 商品リストの取得
 **************************************************************************/
app.get('/ec/products/*', async function( req, res , next){

  try {
    const app_id = req.params[0] || null

    let perPage = +req.query.perPage || process.env.EC_PER_PAGE || 15
    const currentPage = +req.query.currentPage || 1
    const productIds = req.query.productIds || ''
    let offset = (currentPage - 1) * perPage

    let searchCondition = ''

    if (productIds.length > 0) {
      searchCondition += ` AND products.productId IN (${productIds})`
      offset = 0;
      perPage = productIds.split(",").length;
    }

    const products = await models.sequelize.query(`
        SELECT
          products.productId AS product_id,
          products.productCode AS product_code, 
          CONCAT(products.productName, ' ', IF(const_sizes.size_name IS NULL,'',const_sizes.size_name)) AS product_name,
          products.productName AS product_name_no_size,
          products.productSubname AS product_subname,
          products.productDetail AS product_description,
          products.productPhoto1 AS product_main,
          products.productPhoto2 AS product_pict2,
          products.productPhoto3 AS product_pict3,
          products.unit AS product_unit,
          products.stock AS product_stock,
          products.isOnsale AS in_sales,
          products.maxNum AS in_limitedquantity,
          products.period AS in_limitedtime,
          products.start AS sales_start,
          products.end AS sales_end,
          products.deleteFlg AS delete_flg,
          products.productArticle AS article_id,
          products.size AS size_code, 
          NULL AS price_id,
          ${app_id} AS app_id,
          IF(product_prices.productPrice IS NULL, GREATEST(IF(products.productPriceC IS NULL, 0, products.productPriceC), IF(products.productPriceBC IS NULL, 0, products.productPriceBC)), product_prices.productPrice) AS price,
          products.taxRate AS tax_rate,
          products.isOnsale AS active_flg
        FROM products
        LEFT JOIN product_shops ON products.productId = product_shops.productId
        LEFT JOIN product_prices ON products.productId = product_prices.productId
        LEFT JOIN const_sizes ON products.size = const_sizes.size_code
        WHERE (salesChannel & b'1100') 
          AND (products.shop = 0 OR (products.shop = 1 
          AND product_shops.shopId IN (
            SELECT shopId FROM shops INNER JOIN apps ON apps.shop_code = shops.shopCode WHERE apps.app_id = ${app_id}
          )))
          AND products.isOnsale = 1 
          AND products.deleteFlg = 0
          ${searchCondition}
        ORDER BY products.productId DESC
        LIMIT ${offset},${perPage};
    `, {type: models.sequelize.QueryTypes.SELECT})


    // get total
    const counts = await models.sequelize.query(`
        SELECT
         COUNT(products.productId) AS count_products
        FROM products
        LEFT JOIN product_shops ON products.productId = product_shops.productId
        LEFT JOIN const_sizes ON products.size = const_sizes.size_code
        WHERE (salesChannel & b'1100') 
          AND (products.shop = 0 OR (products.shop = 1 AND product_shops.shopId IN (
            SELECT shopId FROM shops INNER JOIN apps ON apps.shop_code = shops.shopCode WHERE apps.app_id = ${app_id}
          )))
          AND products.isOnsale = 1 
          AND products.deleteFlg = 0;
    `, {type: models.sequelize.QueryTypes.SELECT})

    const serverUrl = `${req.protocol}://${req.get('host')}`

    const result = await Promise.all(products.map(async (p) => {

      p.in_limitedtime = (p.in_limitedtime == null || p.in_limitedtime == 0) ? false : true
      p.in_limitedquantity = (p.in_limitedquantity == null || p.in_limitedquantity == 0) ? false : true
      p.in_sales = (p.in_sales == null || p.in_sales == 0) ? false : true
      p.view = true

      if (p.article_id != null && p.article_id > 0) {
        p.article = await getArticle(p.article_id, serverUrl);
      }

      p.main = p.product_main != null? await getCDN(p.product_main, serverUrl) : await getCDNForNull(serverUrl);
      p.pict2 = p.product_pict2 != null? await getCDN(p.product_pict2, serverUrl) : await getCDNForNull(serverUrl);
      p.pict3 = p.product_pict3 != null? await getCDN(p.product_pict3, serverUrl) : await getCDNForNull(serverUrl);

      return p
    }));

    return res.json({ products: result, currentPage, perPage, totalProduct: counts[0].count_products});

  } catch (error) {
    console.log(error)
    res.json({status: 'error', message: 'エラーが発生しました'});
  }
})

//
app.get('/ec/checkOnPrefectureCode', async (req, res) => {
  try {
    const {token, app_id, pref_code} = req.query

    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')

    const postages = await models.sequelize.query(
      `
      SELECT DISTINCT
        postages.shop_code,
        postages.pref_code,
        postages.shipping_flg
      FROM postages
      INNER JOIN apps ON postages.shop_code = apps.shop_code
      WHERE apps.deleteFlg = 0
        AND apps.app_id = ${app_id}
        AND postages.pref_code = ${pref_code}
    `, { type: models.sequelize.QueryTypes.SELECT });

    return res.json({postages})
  } catch (error) {
    return res.json({status: 'error', message: 'エラーが発生しました'});
  }
})

app.post('/getCartSession', async function (req, res, next) {

  const userProfile = JSON.parse(req.body.userProfile)

  const carts = await models.sequelize.query(`
  SELECT oc.*, p.unit
  FROM order_cart oc
  LEFT JOIN products p ON oc.product_id = p.productId
  WHERE oc.userId = '${userProfile.userId}' AND oc.is_active = 1
  ORDER BY oc.product_id ASC
    `, {type: models.sequelize.QueryTypes.SELECT})

  res.json(carts)
})

app.put('/ordering', async function (req, res) {
  const t = await models.sequelize.transaction()
  try {
    const auth = req.headers.authorization.replace('Bearer ', '') || null

    let order = req.body.order ? JSON.parse(req.body.order) : null;

    const verify = await userVerify(order?.userId || auth);

    if (verify) {
      const cart = JSON.parse(req.body.cart);
      const deliv_date = JSON.parse(req.body.deliv_date);
      const memo = JSON.parse(req.body.order_memo);
      const user = JSON.parse(req.body.user);

      const userDb = await models.users.findOne({
        where: {
          userLine: order?.userId || auth,
          deleteFlg: 0,
        },
        include: [
          {
            model: models.shops,
            required: true,
            where: { deleteFlg: 0 },
          },
        ],
      })

      let totalProductPrice = 0;
      cart.forEach(item => {
        totalProductPrice += item.price * item.quantity;
      });

      order = {
        orderId: order?.orderId || null,
        todo: order?.todo || 0,
        status: order?.status || 'new',
        orderDate: getUTCDateTime(order?.orderDate || null),
        salesChannel: 1,
        userId: order?.userId || auth,
        ordererId: userDb.userId,
        userName: userDb.ordererName || userDb.userName,
        orderNum: cart.length,
        cartPrice: totalProductPrice || order?.cartPrice,
        discount: order?.discount || 0,
        shippingFee: order?.shippingFee || 0,
        orderFee: order?.orderFee || 0,
        payment: totalProductPrice || order?.payment,
        paymentMethod: order?.paymentMethod || 'card',
        order_stripe_id: order?.order_stripe_id || null,
        orderMemo: order?.orderMemo || memo,
        addressId: userDb.shop.addressId,
        deliveryMethod: order?.deliveryMethod || '宅配',
        preferredDate: order?.preferredDate || (deliv_date !== '' ? deliv_date : null),
        preferredTime: order?.preferredTime || null,
        deliveryDay: order?.deliveryDay || null,
        shipNumber: order?.shipNumber || null,
        appId: order?.appId || null,
        shopuserId: order?.shopuserId || null,
      };

      let [createdOrder, created] = await models.orders.upsert(order, {
        transaction: t,
      })

      // delete all carts of this order
      await models.carts.destroy({
        where: { orderId: createdOrder.orderId },
        transaction: t
      })

      let carts = [];

      for (const item of cart) {
        carts.push({
          cartId: item?.cartId || null,
          orderId: createdOrder.orderId,
          productId: item.product_id,
          productCode: item.product_code,
          productName: item.product_name,
          price: item.price,
          quantity: item.quantity,
        });
      }

      await models.carts.bulkCreate(carts, {
        updateOnDuplicate: ['productName', 'price', 'quantity'],
        transaction: t,
      })

      await models.temp_cart.destroy({
        where: {
          user_id: {
            [Op.eq]: auth
          }
        },
        transaction: t,
      })

      t.commit();
      
      createdOrder = await findOrder(createdOrder.orderId);

      createdOrder = {
        orderId: createdOrder.orderId,
        todo: createdOrder.todo,
        status: createdOrder.status,
        orderDate: createdOrder.orderDate,
        salesChannel: createdOrder.salesChannel.split(',').map((item, index) => item > 0 ? index : -1).filter((channel) => channel > -1),
        userName: createdOrder.userName,
        payment: createdOrder.payment,
        preferred: createdOrder.preferredDate,
        arrivalDay: createdOrder.arrivalDay,
        ordererName: createdOrder.shopuser?.ordererName || null,
        shopCode: createdOrder.shopuser?.shop?.shopCode || null,
        shopName: createdOrder.shopuser?.shop?.shopName || null,
        closing: createdOrder.shopuser?.shop?.closing || null,
      }

      return res.json({status: 'success', message: '注文を送信しました', order_id: createdOrder.orderId, order: createdOrder});
    }
    return res.json({status: 'error', message: '不正なアクセスです'});
  } catch (error) {
    console.log(error)
    await t.rollback();
    return res.json({status: 'error', message: 'エラーが発生しました'});
  }
});

app.put('/cartin', async function (req, res) {
  const t = await models.sequelize.transaction()
  try {
    const auth = req.headers.authorization.replace('Bearer ', '') || null
    const verify = await userVerify(auth);

    if (verify) {
      const cart = JSON.parse(req.body.cart);

      // Clear cart information
      await models.temp_cart.destroy({
        where: {
          user_id: auth
        },
        transaction: t,
      });

      const values = cart.map((c) => {
        return {
          product_id: c.product_id,
          user_id: c.user_id,
          price: c.price,
          group_code: c.group_code,
          product_code: c.product_code,
          product_name: c.product_name,
          quantity: c.quantity,
          shop_code: c.shop_code
        };
      });

      await models.temp_cart.bulkCreate(values, { transaction: t});

      res.json({ status: 'success', message: 'カートを更新しました' });
    } else {
      res.json({ status: 'error', message: '不正なアクセスです' });
    }
    await t.commit();
  } catch (error) {
    console.log(error)
    await t.rollback();
    res.json({ status: 'error', message: 'カートの更新に失敗しました' });
  }
});

/* 一時カートデータの取得
*****************************************************/
app.get('/cart', async function (req, res) {
  const auth = req.headers.authorization.replace('Bearer ', '') || null
  const verify = await userVerify(auth);
  if (verify) {
    try {
      const cart = await models.temp_cart.findAll({
        where: {
          user_id: auth,
        },
      });

      res.json({ status: 'success', message: 'データを取得しました', cart: cart });
    } catch (error) {
      console.log(error);
      res.json({ status: 'error', message: 'データの取得に失敗しました' });
    }
  } else {
    res.json({ status: 'error', message: '不正なアクセスです' });
  }
});

/* 一時カートデータの取得
*****************************************************/
app.get('/receipt/*', async function (req, res) {
  try {
    const auth = await req.headers.authorization.replace('Bearer ', '') || null
    const token = req.query.token || null
    const verify = await userVerify(auth)
    if (verify) {
      const order_id = await req.params[0]
      const receipt = await createReceipt(order_id, auth, token)
      return res.json({status: 'success', message: 'データを取得しました', receipt: receipt})
    } else {
      return res.json({status: 'error', message: '不正なアクセスです'})
    }
  }catch (e) {
    console.log(e)
    return res.json({status: 'error', message: '不正なアクセスです'})
  }
})

/**
 * api send line message to many users
 */
app.post('/send-multiple-messages/*', async function (req, res) {
  try {
    const auth = await req.headers.authorization.replace('Bearer ', '');
    const { token } = req.body;

    const verify = await userVerify(auth);

    if (verify) {
      const shops = await models.shops.findAll({
        attributes: ['shopId'],
        include: [
          {
            model: models.users,
            required: true,
            where: {
              userLine: auth,
              deleteFlg: 0,
            },
          },
        ],
        where: {
          deleteFlg: 0,
        },
      });

      const shopIds = shops.map((item) => item.shopId);
      console.log(shopIds);

      const order_id = req.params[0];
      const receipt = await createReceipt(order_id, auth, token);

      await sendMultipleMessages(shopIds, receipt);

      res.json({
        status: 'success',
        message: 'データを取得しました',
      });
    } else {
      res.json({
        status: 'error',
        message: '不正なアクセスです',
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: 'error',
      message: '注文は作成されましたが、LINEメッセージの送信に失敗しました。',
    });
  }
});


// 商品リストの取得
app.get('/deliveryConfig', async function(req, res) {
  try {
    const auth = req.headers.authorization?.replace('Bearer ','') || null
    const verify = await userVerify( auth )

    if (!verify) return res.json({ status: 'error', message: '不正なアクセスです' })

    const deliv = await models.m_delivery.findAll()

    return res.json({ status: 'success', message: '取得しました', data: deliv })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// 単位の取得
app.get('/units', async function (req, res) {
  try {
    const units = await models.m_units.findAll()

    if (!units.length) return res.json({ status: 'error', message: '単位が取得できませんでした' })

    return res.json({ status: 'success', message: '単位を取得しました', units })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// お気に入りリストの取得
app.get('/favorites', async function (req, res) {
  try {
    const auth = req.headers.authorization?.replace('Bearer ','') || null
    const product_id =  Number( req.params[0] )
    const verify = await userVerify( auth )

    if (!verify) return res.json({ status: 'error', message: '不正なアクセスです' })

    let results = await models.user_favorites.findAll({ attributes: ['product_id'], where: { user_id: auth } })
    results = results.map(r => r.product_id)

    return res.json({ status: 'success', message: 'お気に入りに追加しました', data: results })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// マイリストの追加
app.put('/addMyList', async function (req, res) {
  const transaction = await models.sequelize.transaction()
  try {
    const auth = req.headers.authorization?.replace('Bearer ','') || null
    const verify = await userVerify( auth )

    if (!verify) return res.json({ status: 'error', message: '不正なアクセスです' })


    let carts = JSON.parse( req.body.cart || '[]')
    const list_name = req.body.list_name || ''

    if (!list_name) return res.json({ status: 'error', message: 'マイリスト名を入力してください' })

    const list = await models.user_mylist.create({
      user_id: auth,
      list_name: list_name,
      mylistDateCreated: getUTCDateTime()
    }, { transaction })

    if (!list) return res.json({ status: 'error', message: 'マイリスト追加に失敗しました' })

    const list_id = list.list_id

    carts = carts.map(c => {
      return `('${c?.product_id}', ${list_id}, '${c?.user_id}', ${c?.price}, '${c?.group_code}', '${c?.product_code}', '${c?.product_name}', ${c?.quantity}, '${c?.shop_code}')`
    })

    const values = carts.join(',')
    await models.sequelize.query(`
      INSERT INTO user_mylist_cart 
      (product_id, list_id, user_id, price, group_code, product_code, product_name, quantity, shop_code) 
      VALUES ${values}
    `, { type: models.sequelize.QueryTypes.INSERT, transaction })

    await transaction.commit()
    return res.json({ status: 'success', message: `「${list_name}」をマイリストに追加しました`, data: list_id })
  } catch (err) {
    await transaction.rollback()
    console.log(err)
    return res.json({ status: 'error', message: 'マイリスト追加に失敗しました' })
  }
})

//delete mylist
app.post('/deleteMylist', async (req, res) => {
  const transaction = await models.sequelize.transaction()
  try {
    const auth = req.headers.authorization?.replace('Bearer ','') || null
    console.log('auth', auth);
    const verify = await userVerify( auth )

    if (!verify) return res.json({ status: 'error', message: '不正なアクセスです' })

    const list_name = req.body.list_name || ''
    const list_id = req.body.list_id || null
    const user_id = req.body.user_id || null

    // delete user_mylist by list_id
    await models.user_mylist.destroy({ where: { list_id }, transaction })

    // delete user_mylist_cart by list_id and user_id
    await models.sequelize.query(`DELETE FROM user_mylist_cart WHERE list_id = ${list_id} AND user_id = '${user_id}';`, {
      type: models.sequelize.QueryTypes.DELETE,
      transaction
    })

    await transaction.commit()
    return res.json({ status: 'success', message: `マイリスト「${list_name}」が削除されました。`})
  } catch (err) {
    await transaction.rollback()
    console.log(err)
    return res.json({ status: 'error', message: '削除に失敗しました' })
  }
})

// マイリストの取得
app.get('/mylist', async function (req, res) {
  try {
    const auth = req.headers.authorization?.replace('Bearer ','') || null
    const verify = await userVerify( auth )

    if (!verify) return res.json({ status: 'error', message: '不正なアクセスです' })

    const results = await models.user_mylist.findAll({
      where: { user_id: auth },
      attributes: {
        include: [
          [models.sequelize.literal("DATE_FORMAT(mylistDateCreated, '%Y-%m-%d %H:%i')"), 'mylistDateCreated']
        ],
        exclude: ['mylistDateCreated']
      },
      order: [['mylistDateCreated','DESC']]
    })

    let mylist = []

    for (let list of results) {
      const cart = await models.user_mylist_cart.findAll({
        where: {
          user_id: auth,
          list_id: list.list_id
        },
        attributes: {
          include: [
            [
              models.sequelize.literal(`IF(
                product.productId IS NOT NULL AND
                product.isOnsale = 1 AND
                product.deleteFlg = 0 AND
                (product.salesChannel & b'0001') > 0,
                1,
                0
              )`),
              'available'
            ]
          ]
        },
        include: [
          {
            model: models.products,
            attributes: [],
            as: 'product' 
          }
        ]
      });
      const convertList = {
        list_id: list.list_id,
        user_id: list.user_id,
        list_name: list.list_name,
        mylistDateCreated: list.mylistDateCreated,
        cart,
        popup: false
      }
      mylist.push(convertList)
    }

    return res.json({ status: 'success', message: 'データを取得しました', mylist })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/optinfo1', async function (req, res) {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()

    let data = await models.opt_info1.findAll();
    data = data.map(item => {
      return {optInfo1: item.infoText}
    });
    return res.json({optInfo1: data})
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/optinfo2', async function (req, res) {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()

    let data = await models.opt_info2.findAll();
    data = data.map(item => {
      return {optInfo2: item.infoText}
    });
    return res.json({optInfo2: data})
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/optinfo3', async function (req, res) {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()

    let data = await models.opt_info3.findAll();
    data = data.map(item => {
      return {optInfo3: item.infoText}
    });
    return res.json({optInfo2: data})
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get('/aec/sizes', async function (req, res) {
  try {
    // Token 確認
    if (req.query.token !== process.env.INFO_TOKEN) return res.status(401).send()

    let data = await models.sizes.findAll();
    data = data.map(item => {
      return {size: item.size_code}
    });
    return res.json({sizes: data})
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// get config of line message channel
function getAppChannel(type = channelTypes.B2B) { //1: b2b, 2: spot, 3: ec
  if (type === channelTypes.SPOT) return {
    channelAccessToken: process.env.SPOT_ACCESS_TOKEN,
    channelSecret: process.env.SPOT_CHANNEL_SECRET
  }

  if (type === channelTypes.EC) return {
    channelAccessToken: process.env.EC_ACCESS_TOKEN,
    channelSecret: process.env.EC_CHANNEL_SECRET
  }
  return {
    channelAccessToken: process.env.B2B_ACCESS_TOKEN,
    channelSecret: process.env.B2B_CHANNEL_SECRET
  };
}

// EC オーダー情報キャンセル（確定前情報を削除
app.post('/cancelOrder', async (req, res) => {
  const transaction = await models.sequelize.transaction()
  try {
    const orderId = req.body.order_id || null

    await models.sequelize.query(`
      DELETE FROM orders WHERE orderId = ${orderId};
    `, { type: models.sequelize.QueryTypes.DELETE, transaction })

    await models.sequelize.query(`
      DELETE FROM carts WHERE orderId = ${orderId};
    `, { type: models.sequelize.QueryTypes.DELETE, transaction })

    await transaction.commit()
    return res.json({ order_id: orderId })
  } catch (err) {
    await transaction.rollback()
    console.log(err);
    return res.status(500).send()
  }
})

/* カートセッションの保存
*****************************************************/
app.post('/setCartSession', async (req, res , next) => {
  const transaction = await models.sequelize.transaction()
  try {
    const time        = helper.unixTime() 
    const now         = helper.getNow()
    const cart        = JSON.parse( req.body.cart )
    const userProfile = JSON.parse( req.body.userProfile )
    const session_id  = ( req.body.session_id == null || req.body.session_id == '' )? userProfile.userId + '___' + time : req.body.session_id

    const insert = `(
      userId,
      product_id,
      product_name,
      product_code,
      price,
      quantity,
      update_date,
      session_id,
      is_active,
      size_code
    )`

    let values = ''
    cart.forEach( v => {
      values += `(
        '${userProfile.userId}',
        ${v.product_id}, 
        '${escapeQuery(v.product_name)}',
        '${v.product_code}',  
        ${v.price}, 
        ${v.quantity}, 
        '${now}', 
        '${session_id}',
        1,
        '${v.size_code}'
      ),`
    })

    values = values.slice(0, -1)

    const insertCart = `INSERT INTO order_cart ${insert} VALUES ${values}`

    const deleteQuery = `DELETE FROM order_cart WHERE userId = '${userProfile.userId}'`

    await models.sequelize.query(deleteQuery, { type: models.sequelize.QueryTypes.DELETE, transaction })
    await models.sequelize.query(insertCart, { type: models.sequelize.QueryTypes.INSERT, transaction })

    await transaction.commit()
    return res.json( session_id )
  } catch (err) {
    await transaction.rollback()
    console.log(err);
    return res.status(500).send()
  }
})


// STRIPE 決済
app.post('/createPaymentIntents', async (req, res, next) => {
  try {
    await paymentService.createPaymentIntents(req, res, next)
  } catch (err) {
    console.log(err);
  }
})

// カートセッションから商品を削除
app.post('/deleteCartSession', async (req, res , next) => {
  const transaction = await models.sequelize.transaction()
  try {
    const cart = JSON.parse( req.body.cart )
    const userProfile = JSON.parse( req.body.userProfile )
    const session_id  = req.body.session_id
    const now = helper.getNow()

    for (const c of cart) {
      await models.sequelize.query(`
        DELETE FROM order_cart
        WHERE
          product_id = ${c.product_id} AND
          session_id = '${session_id}' AND
          userId     = '${userProfile.userId}'
      `, { type: models.sequelize.QueryTypes.DELETE, transaction })
    }

    await transaction.commit()
    return res.json( session_id )
  } catch (err) {
    await transaction.rollback()
    console.log(err);
    return res.status(500).send()
  }
})

app.get("/aec/shopusers", async (req, res) => {
  try {
    const shopusers = await models.sequelize.query(`
  SELECT users.shopId,
         shopCode,
         shopName,
         userId,
         userLine,
         ordererName,
         isParent,
         salesChannel
  FROM users
  JOIN shops ON shops.shopId = users.shopId
  WHERE purchase = 1
    AND salesChannel & 0b0011 <> 0
  ORDER BY shopName;
`, {
      type: models.sequelize.QueryTypes.SELECT
    });
    await res.json( { status : 'success' , message : 'success' , shops: shopusers } )
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }}
)

app.put("/ordering/:order_id", async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const data = req.body.params.put;
    const orderId = req.params.order_id;

    //Update order cart
    let order = await models.orders.findOne({
      where: {
        orderId: orderId,
        userId: data.user.user_id,
        [Op.and]: [
          models.sequelize.literal(`salesChannel & b'0001' > 0`),
        ]
      },
    });

    if (order) {

      let orderNum = 0;

      // Create new cart items with orderId
      const cartItems = data.cart.map(item => {
        orderNum += +item.quantity;
        return {
          orderId: order.orderId,
          productId: item.product_id,
          productCode: item.product_code,
          productName: item.product_name,
          price: item.price,
          quantity: item.quantity,
          userId: data.user.user_id,
          session_id: data.session_id
        };
      });

      // Update order info
      await models.orders.update({
        deliveryDay: getUTCDateTime(data.deliv_date),
        orderMemo: data.order_memo,
        orderNum: orderNum
      }, {where: {orderId: order.orderId}, transaction: t})

      // Delete existing cart items with the orderId
      await models.carts.destroy({
        where: { orderId },
        transaction: t
      });

      await models.carts.bulkCreate(cartItems, { transaction: t });

      await t.commit();

      order = await findOrder(orderId);
    }

    await res.json( { status : 'success' , message : 'success' , order: order} )
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(500).send()
  }}
)

app.post("/editInfoOrder", async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send()

    const data = req.body.edit_info_order;
    const orderId = data.orderId;

    let orderNum = 0;

    //Update order cart
    let order = await models.orders.findOne({
      where: {
        orderId: orderId,
        userId: data.userId,
        [Op.and]: [
          models.sequelize.literal(`salesChannel & b'0010' > 0`),
        ]
      },
    });

    if (order) {
      // Create new cart items with orderId
      const cartItems = data.orderArray.map(item => {
        orderNum += +item.quantity;
        return {
          orderId: order.orderId,
          productId: item.productId,
          productName: item.productName,
          price: item.productPrice,
          quantity: item.quantity,
          userId: data.userId,
        };
      });

      // Update order info
      await models.orders.update({
        orderDate: getUTCDateTime(data.orderDate),
        deliveryDay: getUTCDateTime(data.deliveryDate),
        orderNum: orderNum
      }, {where: {orderId: order.orderId}, transaction: t})

      // Delete existing cart items with the orderId
      await models.carts.destroy({
        where: { orderId },
        transaction: t
      });

      await models.carts.bulkCreate(cartItems, { transaction: t });

      await t.commit();

      order = await findOrder(orderId);
    }

    await res.json( { status : 'success' , message : 'success' , order: order} )
  } catch (err) {
    await t.rollback();
    console.log(err);
    return res.status(500).send()
  }}
)

app.post("/aec/linemsg/notification", async (req, res) => {
  try {

    if (req.body.token !== process.env.INFO_TOKEN) return res.status(401).send();

    const {text, user} = req.body.msg;

    const msg = {
      type: 'text',
      text: text
    }

    const userDb = await models.users.findOne({ where: { userLine: user, deleteFlg: 0 } })

    if(userDb){

      const salesChannel = bitsToArray(Array.from(userDb.salesChannel)[0])

      // get config of b2b channel
      // const b2bConfig = getAppChannel(channelTypes.B2B)
      // const b2bClient = new line.Client(b2bConfig)

      // get config of b2b spot channel
      const spotConfig = getAppChannel(channelTypes.SPOT)
      const spotClient = new line.Client(spotConfig)

      // if (salesChannel.includes(1)) {
      //   // send message to user add friend with b2b channel
      //   await b2bClient.multicast([user], msg)
      // }

      if (salesChannel.includes(2)) {
        // send message to user add friend with b2b spot channel
        await spotClient.multicast([user], msg)
      }

      await res.json({status: 'success', message: 'success', data: true})
    }

    await res.json({status: 'error', message: 'User not found', data: false})
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }}
)

const getDayoffsConfig = async (month, year, multiple = false) => {
  try {
    const start = $dayjs(`${year}-${month}`)
    const month1 = start.format('YYYY-MM')
    const month2 = start.add(1, 'month').format('YYYY-MM')

    let dateCondition = ` DATE_FORMAT(date, '%Y-%m') `
    dateCondition += multiple ? ` IN ('${month1}', '${month2}')` : ` = '${month1}'` 
    // get dayoffs
    let dayoffs = await models.sequelize.query(`
      SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM dayoffs WHERE shipping = 0 AND ${dateCondition};
    `, { type: models.sequelize.QueryTypes.SELECT });

    // get holiday not off
    let holidayNotOffs = await models.sequelize.query(`
      SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date FROM dayoffs WHERE shipping = 1 AND ${dateCondition};
    `, { type: models.sequelize.QueryTypes.SELECT });

    // get not deliveries
    let notDeliveries = await models.sequelize.query(`
      SELECT id FROM m_delivery WHERE shipping = 0;
    `, { type: models.sequelize.QueryTypes.SELECT });

    // convert to array
    dayoffs = dayoffs.map(day => day.date);
    holidayNotOffs = holidayNotOffs.map(day => day.date);
    notDeliveries = notDeliveries.map(d => d.id);

    return { dayoffs, holidayNotOffs, notDeliveries };
  } catch (err) {
    console.log(err);
    return { dayoffs: [], holidayNotOffs: [], notDeliveries: [] };
  }
}

app.get('/aec/dayoffs/getDaysByMonth', async (req, res) => {
  try {
    const month = +req.query.month || null
    const year = +req.query.year || null
    
    const dayoffsConfig = await getDayoffsConfig(month, year)

    return res.json( dayoffsConfig )
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

app.post('/aec/dayoffs/createDate', async (req, res) => {
  try {
    const date = req.query.date || null
    const shipping = +req.query.shipping || 0
    await models.sequelize.query(`
      insert into dayoffs (date, shipping)
      values ('${date}', ${shipping})
      on duplicate key update shipping = ${shipping}
    `, { type: models.sequelize.QueryTypes.INSERT })
    return res.send(`Update ${date} successfully!`)
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

app.post('/aec/dayoffs/deleteDate', async (req, res) => {
  try {
    const date = req.query.date || null
    await models.sequelize.query(`
      delete from dayoffs where DATE_FORMAT(date, '%Y-%m-%d') = '${date}';
    `, { type: models.sequelize.QueryTypes.DELETE })
    return res.send(`Delete ${date} successfully!`)
  } catch (err) {
    console.log(err);
    return res.status(500).send()
  }
})

app.get('/aec/getNotDeliveries', async function(req, res) {
  try {
    let notDeliveries = await models.sequelize.query(`
      SELECT id FROM m_delivery WHERE shipping = 0;
    `, { type: models.sequelize.QueryTypes.SELECT })

    notDeliveries = notDeliveries.map(d => d.id)
    return res.json({ notDeliveries })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})


app.get('/b2b/deliveryList', async (req, res) => {
  try {
    const data = fs.readFileSync('./config/closing.json')
    const closing = JSON.parse(data)?.closing || '23:00'
    const limit = $dayjs().format(`YYYY-MM-DD ${closing}`)

    let start = $dayjs().add(1, 'day').format('YYYY-MM-DD')

    // 23時を過ぎているか
    if (!$dayjs().isBefore( limit )) {
      start = $dayjs().add(2, 'day').format('YYYY-MM-DD')
    }

    const month = $dayjs().month() + 1
    const year = $dayjs().year()
    
    const { dayoffs, holidayNotOffs, notDeliveries } = await getDayoffsConfig(month, year, true)

    let list = []
    for (let i = 0; i < 30; i++ ) {
      const t = $dayjs(start).add(i, 'day')
      const date = t.format('YYYY-MM-DD')
      const dayInWeek = t.day()

      if (!notDeliveries.includes(dayInWeek)) {
        if (!dayoffs.includes(date)) {
          list.push(date)
        }
      } else if (holidayNotOffs.includes(date)) {
        list.push(date)
      }
      if (list.length >= 7) break;
    }

    return res.json({ list })
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// get closing config
app.get(`/aec/getClosingConfig`, async (req, res) => {
  try {
    const data = fs.readFileSync('./config/closing.json')
    const closing = JSON.parse(data)?.closing || '23:00'
    return res.json({ closing })
  } catch (err) {
    console.log(err)
    return res.json({ closing: '23:00' })
  }
})

// update closing config
app.post('/aec/updateClosingConfig', async (req, res) => {
  try {
    const closing = req.query.closing || '23:00'
    const minClosing = req.query.minClosing || '17:00'
    const maxClosing = req.query.maxClosing || '23:45'

    const data = { closing, minClosing, maxClosing }
    fs.writeFileSync('./config/closing.json', JSON.stringify(data))
    return res.send('Update closing config successfully')
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.get(`/getAdmin`, async (req, res) => {
  try {
    const userId = req.query.userId
    const admin = await models.administrators.findOne({
      where: {adminLine: userId, deleteFlg: 0},
      attributes: { exclude: ['password'] },
    });
    return res.json({admin})
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

app.post('/addNewAdminUser', async function( req, res , next){
  try {
    const addUser = JSON.parse(req.body.addUser)
    const admin = {
      adminName: addUser.displayName,
      adminLine: addUser.userId,
      privilege: 2,
      deleteFlg: 0,
    }

    const existAdmin = await models.administrators.findOne({
      where: {adminLine: addUser.userId, deleteFlg: 0},
    })

    if (existAdmin) {
      await models.administrators.update(admin, {where: {adminLine: addUser.userId, deleteFlg: 0}});
    }else{
      await models.administrators.create(admin);
    }

    return res.json({msg: '追加しました'})
  } catch (err) {
    console.log(err)
    return res.status(500).send()
  }
})

// Check shop
app.get('/aec/checkShopCodeAndSalesChannel', async (req, res) => {
  try {
    const {token, shopCode, salesChannel, userCode} = req.query
    const userId = req.query.userId || null
    // Token 確認
    if (token !== process.env.INFO_TOKEN) return res.status(401).send('Unauthenticated error!')
    const check = await models.sequelize.query(`
      SELECT shops.shopId
      FROM shops
      LEFT JOIN users ON shops.shopId = users.shopId
      WHERE shops.shopCode = '${shopCode}' AND shops.deleteFlg = 0
        AND users.salesChannel & ${salesChannel} AND users.userId = ${userId} AND users.deleteFlg = 0;
    `, { type: models.sequelize.QueryTypes.SELECT })

    return res.json({ result: check.length > 0 })
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.get('/qrcode', async (req, res) => {
  const link = req.query.link;
  const size = parseInt(req.query.size, 10); // Parse the size parameter as an integer
  const margin = parseInt(req.query.margin, 10); // Parse the margin parameter as an integer

  // Validate link
  if (!link) {
      return res.status(400).send('No link provided');
  }

  // Validate size, set default if invalid or not provided
  const qrSize = isNaN(size) || size <= 0 ? 200 : size; // Default size is 200 if not specified or invalid

  // Validate margin, set default if invalid or not provided
  const qrMargin = isNaN(margin) || margin < 0 ? 4 : margin; // Default margin is 4 if not specified or invalid

  try {
      // Generate QR code as a buffer with dynamic size and margin
      let qrBuffer = await QRCode.toBuffer(link, {
          type: 'image/png',
          width: qrSize, // Use the size parameter to set the QR code size
          margin: qrMargin // Use the margin parameter to set the QR code margin
      });
      
      // Set the content type to PNG image
      res.type('png');
      
      // Send the image content directly
      res.send(qrBuffer);
  } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).send('Error generating QR code');
  }
});

module.exports = {
  app,
  convertProducts,
  convertParentUsers,
  convertUser,
  getChildUsers,
  convertInfoOrders,
  convertMessages,
  resizeImage,
  generateToken,
  isValidToken,
  getUtcDate,
  getJstDate,
  getFormattedDate,
  getPlainObjectArray,
}

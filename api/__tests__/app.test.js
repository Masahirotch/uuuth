// HTTP 経由テスト用モジュール
const request = require("supertest")
// ファイル操作用モジュール
const fs = require("fs")
// 暗号化処理用モジュール
const crypto = require("crypto")
// テスト対象アプリケーション
const app = require("../src/app")
// DB 操作用モジュール
const models = require("../models")

// ランダム日付取得
const getRandomDate = () => {
  const date = new Date()
  date.setTime(date.getTime() * (Math.random() + 0.5))
  return date.toISOString().replace("T", " ").substring(0, 19)
}

// ランダム文字列取得
const getRandomString = () => Math.random().toString(32).substring(2)

// ランダム数値取得（min 以上、max 以下）
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max + 1 - min) + min)

// ランダムビット取得
const getRandomBit = () => Math.floor(Math.random() * 2)

// ランダム真偽値取得
const getRandomBoolean = () => !!getRandomBit()

// 商品種別
const ProductKind = {
  info: 0,
  ouentai: 1,
}

// 商品ID種別
const ProductIdKind = {
  random: -1,
  any: 0,
  fixed: 1,
}

// 商品オブジェクト生成
const getRandomProduct = (productKind, productIdKind, fixedId, isMaxFalse) => {
  let productId = null
  switch (productIdKind) {
    case ProductIdKind.random:
      productId = getRandomNumber(10000, 100000)
      break
    case ProductIdKind.any:
      productId = expect.anything()
      break
    default:
      productId = fixedId
      break
  }
  const randomProduct = {
    productId,
    productCode: getRandomString(),
    productName: getRandomString(),
    productDetail: getRandomString(),
    productPhoto: getRandomString(),
    productPrice: getRandomNumber(1, 10000),
    isOnSale: getRandomBoolean(),
    quantity: getRandomNumber(1, 1000),
    maxNum: getRandomNumber(1, 100),
    isMax: isMaxFalse ? false : getRandomBoolean(),
    isPeriod: getRandomBoolean(),
    start: getRandomDate(),
    end: getRandomDate(),
    unit: getRandomString(),
  }
  if (productKind === ProductKind.ouentai) {
    delete randomProduct.productCode
    delete randomProduct.unit
  }
  return randomProduct
}

// 商品情報入力用 Sequelize 互換オブジェクト
const createInputProduct = (data, sequelizeFlg) => {
  const inputProduct = {}
  Object.assign(inputProduct, data)
  if (sequelizeFlg) {
    inputProduct.start = new Date(new Date(data.start).getTime())
    inputProduct.end = new Date(new Date(data.end).getTime())
    inputProduct.get = function get() {
      return {
        end: this.end,
        isMax: this.isMax,
        isOnSale: this.isOnSale,
        isPeriod: this.isPeriod,
        maxNum: this.maxNum,
        productCode: this.productCode,
        productDetail: this.productDetail,
        productId: this.productId,
        productName: this.productName,
        productPhoto: this.productPhoto,
        productPrice: this.productPrice,
        quantity: this.quantity,
        start: this.start,
        unit: this.unit,
      }
    }
  } else {
    inputProduct.start = new Date(new Date(data.start).getTime() + 9 * 60 * 60 * 1000)
    inputProduct.end = new Date(new Date(data.end).getTime() + 9 * 60 * 60 * 1000)
  }
  return inputProduct
}

// expected -> input 変換
const getInputProduct = (expectedProduct) => {
  const inputProduct = createInputProduct(JSON.parse(JSON.stringify(expectedProduct)), false)
  inputProduct.isOnSale = inputProduct.isOnSale ? 1 : 0
  inputProduct.isMax = inputProduct.isMax ? 1 : 0
  inputProduct.isPeriod = inputProduct.isPeriod ? 1 : 0
  inputProduct.start = new Date(inputProduct.start)
  inputProduct.end = new Date(inputProduct.end)
  return inputProduct
}

// ユーザ種別
const UserKind = {
  parent: 0,
  child: 1,
}

const expectedExistingUser = {
  ID: 44,
  userId: "U46178fcc5f1bf5c8508fe3a3876475b3",
  regist: 1,
  bizName: "リストランテヨシザワ",
  shop_tel: "09088889999",
  manager: "よしざわたかゆき",
  user_tel: "08012345678",
  displayName: "Ryukyu Blue",
  flg_active: true,
  flg_1: true,
  flg_2: true,
  flg_3: true,
  flg_4: true,
  flg_5: true,
  shopCode: "9999-111",
  isParent: 1,
  parentID: null,
  child: [
    {
      ID: 51,
      userId: "Ubadf9cc6e557293fc414a1fffa7b8095",
      regist: 1,
      bizName: "リストランテヨシザワ",
      shop_tel: "0352097151",
      manager: "テスト端末",
      user_tel: "08099998888",
      displayName: "android10",
      flg_active: true,
      flg_1: true,
      flg_2: true,
      flg_3: true,
      flg_4: true,
      flg_5: true,
      shopCode: null,
      isParent: 0,
      parentID: 44,
    },
  ],
  isView: true,
}

// plain -> input 変換
const getInputUser = (plainUser) => {
  const inputUser = JSON.parse(JSON.stringify(plainUser))
  inputUser.flg_active = inputUser.flg_active ? 1 : 0
  inputUser.flg_1 = inputUser.flg_1 ? 1 : 0
  inputUser.flg_2 = inputUser.flg_2 ? 1 : 0
  inputUser.flg_3 = inputUser.flg_3 ? 1 : 0
  inputUser.flg_4 = inputUser.flg_4 ? 1 : 0
  inputUser.flg_5 = inputUser.flg_5 ? 1 : 0
  delete inputUser.child
  delete inputUser.isView
  return inputUser
}

// 新規ユーザオブジェクト生成
const getNewUser = (userKind, parentID) => {
  const newUser = {
    ID: expect.anything(),
    userId: getRandomString(),
    regist: false,
    bizName: null,
    shop_tel: null,
    manager: null,
    user_tel: null,
    displayName: getRandomString(),
    flg_active: !(userKind === UserKind.parent),
    flg_1: false,
    flg_2: false,
    flg_3: false,
    flg_4: false,
    flg_5: false,
    shopCode: null,
    isParent: userKind === UserKind.parent,
    parentID,
  }
  return newUser
}

// ランダムユーザオブジェクト生成
const getRandomUser = () => {
  const randomUser = {
    ID: expect.anything(),
    userId: getRandomString(),
    regist: getRandomBit(),
    bizName: getRandomString(),
    shop_tel: getRandomString(),
    manager: getRandomString(),
    user_tel: getRandomString(),
    displayName: getRandomString(),
    flg_active: getRandomBit(),
    flg_1: getRandomBit(),
    flg_2: getRandomBit(),
    flg_3: getRandomBit(),
    flg_4: getRandomBit(),
    flg_5: getRandomBit(),
    shopCode: getRandomString(),
    isParent: getRandomBit(),
    parentID: getRandomNumber(1, 1000),
  }
  return randomUser
}

// ランダムオーダオブジェクト生成
const getRandomInfoOrder = (product) => {
  const randomInfoOrder = {
    order_id: expect.anything(),
    userId: getRandomBit() ? expectedExistingUser.userId : expectedExistingUser.child[0].userId,
    orderNum: getRandomNumber(1, 100),
    orderDate: getRandomDate(),
    deliveryDate: getRandomDate(),
  }
  const length = getRandomNumber(2, 10)
  const addProductArray = []
  for (let i = 0; i < length; i += 1) {
    addProductArray.push(getRandomProduct(ProductKind.info, ProductIdKind.random, null, true))
  }
  randomInfoOrder.orderArray = [product, ...addProductArray]
  return randomInfoOrder
}

// メッセージ情報入力用 Sequelize 互換オブジェクト
const createInputMessage = (data) => {
  const inputMessage = {}
  inputMessage.ID = data.ID
  inputMessage.createDate = new Date(new Date(data.createDate).getTime() + 18 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)
  inputMessage.sendDate = data.sendDate
  inputMessage.inputDate = data.inputDate
  inputMessage.messages = data.messages
  inputMessage.destinationTo = data.destinationTo
  inputMessage.lastSendDate = new Date(new Date(data.lastSendDate).getTime() + 18 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)
  inputMessage.reservation = new Date(new Date(data.reservation).getTime() + 18 * 60 * 60 * 1000)
    .toISOString()
    .replace("T", " ")
    .substring(0, 19)
  inputMessage.delFlg = data.delFlg
  inputMessage.inputTime = data.inputTime
  return inputMessage
}

// ランダムメッセージオブジェクト生成
const getRandomMessage = (ID) => {
  const randomMessage = {
    ID,
    createDate: getRandomDate(),
    sendDate: getRandomString(),
    inputDate: getRandomDate().slice(0, 10),
    inputTime: getRandomDate().slice(11, 16),
    lastSendDate: getRandomDate(),
    reservation: getRandomDate(),
    delFlg: getRandomBit(),
  }
  const lengthM = getRandomNumber(1, 3)
  randomMessage.messages = []
  for (let i = 0; i < lengthM; i += 1) {
    randomMessage.messages.push({
      text: getRandomString(),
      editor: {
        text: getRandomBoolean(),
        image: getRandomBoolean(),
        movie: getRandomBoolean(),
      },
      main: getRandomString(),
      originalContentUrl: getRandomString(),
      previewImageUrl: getRandomString(),
    })
  }
  const lengthD = getRandomNumber(1, 5)
  randomMessage.destinationTo = []
  for (let i = 0; i < lengthD; i += 1) {
    randomMessage.destinationTo.push(i + 1)
  }
  return randomMessage
}

// テスト本体
describe("WebAPIによる情報処理", () => {
  describe("商品情報処理", () => {
    describe("[INFO] products", () => {
      test("[INFO] 商品一覧取得", async () => {
        const expected = {
          productId: 140,
          productCode: "12610",
          productName: "トマト（ツブシ用）",
          productDetail:
            "遠藤農園のトマトを格安で販売しちゃいます。\nトマト、ジュース、付け合わせ。何にでも使い勝手がいい!\n限定20箱売り切れ次第終了!\nサイズは不揃いになります。予めご了承ください。\n",
          productPhoto: "https://hiyoshi.api.line.cx/image/main_1659335509.jpg",
          productPrice: 780,
          isOnSale: true,
          quantity: 0,
          maxNum: 1,
          isMax: true,
          isPeriod: true,
          start: "2022-08-01 10:00:00",
          end: "2022-08-07 23:59:59",
          unit: "cs",
        }
        const res = await request(app.app)
          .post("/getProducts")
          .send({
            token: "hiyoshi.info.token",
            order_by: { order: [["productId", "DESC"]] },
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.products[res.body.products.length - 95]).toEqual(expected)
      })

      test("[INFO] 商品追加", async () => {
        const expected = getRandomProduct(ProductKind.info, ProductIdKind.any, null, false)
        const newProduct = JSON.parse(JSON.stringify(expected))
        delete newProduct.productId
        newProduct.isOnSale = newProduct.isOnSale ? 1 : 0
        newProduct.isMax = newProduct.isMax ? 1 : 0
        newProduct.isPeriod = newProduct.isPeriod ? 1 : 0
        const res = await request(app.app)
          .post("/addProduct")
          .send({
            token: "hiyoshi.info.token",
            new_product: newProduct,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.products[res.body.products.length - 1]).toEqual(expected)
      })

      test("[INFO] 商品更新", async () => {
        const expected = getRandomProduct(ProductKind.info, ProductIdKind.fixed, 139, false)
        const setProduct = JSON.parse(JSON.stringify(expected))
        delete setProduct.productId
        const res = await request(app.app)
          .post("/updateProduct")
          .send({
            token: "hiyoshi.info.token",
            product_id: expected.productId,
            set_product: setProduct,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.products[93]).toEqual(expected)
      })
    })

    describe("[応援隊] ouentaiProducts", () => {
      test("[応援隊] 商品一覧取得", async () => {
        const expected = {
          productId: 4,
          productName: "特盛きのこセット",
          productDetail:
            "好評につき復活！！\n花びら茸が仲間入り☺シャキシャキ歯ごたえが癖になります！！\nエリンギ3PC・マイタケ3PC・しめじ3PC・椎茸1PC・花びら茸1PC、11PCで1,080円！\n\n3月11日（木）、3月12日（金）の2日間　計20セット限定！！\n※3月13日（土）、3月15日（月）の納品になります。\n",
          productPhoto: "https://hiyoshi.liff.cloud/API/images/product_004.jpg",
          productPrice: 1080,
          isOnSale: false,
          quantity: 0,
          maxNum: 9,
          isMax: true,
          isPeriod: false,
          start: "2021-03-11 10:00:00",
          end: "2021-03-12 23:59:59",
        }
        const res = await request(app.app)
          .post("/getOuentaiProducts")
          .send({
            token: "hiyoshi.api.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.ouentaiProducts[3]).toEqual(expected)
      })

      test("[応援隊] 商品追加", async () => {
        const expected = getRandomProduct(ProductKind.ouentai, ProductIdKind.any, null, false)
        const newOuentaiProduct = JSON.parse(JSON.stringify(expected))
        delete newOuentaiProduct.productId
        newOuentaiProduct.isOnSale = newOuentaiProduct.isOnSale ? 1 : 0
        newOuentaiProduct.isMax = newOuentaiProduct.isMax ? 1 : 0
        newOuentaiProduct.isPeriod = newOuentaiProduct.isPeriod ? 1 : 0
        const res = await request(app.app)
          .post("/addOuentaiProduct")
          .send({
            token: "hiyoshi.api.token",
            new_ouentai_product: newOuentaiProduct,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.ouentaiProducts[res.body.ouentaiProducts.length - 1]).toEqual(expected)
      })

      test("[応援隊] 商品更新", async () => {
        const expected = getRandomProduct(ProductKind.ouentai, ProductIdKind.fixed, 1, false)
        const setOuentaiProduct = JSON.parse(JSON.stringify(expected))
        delete setOuentaiProduct.productId
        const res = await request(app.app)
          .post("/updateOuentaiProduct")
          .send({
            token: "hiyoshi.api.token",
            ouentai_product_id: expected.productId,
            set_ouentai_product: setOuentaiProduct,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.ouentaiProducts[0]).toEqual(expected)
      })
    })

    describe("商品処理共通", () => {
      test("商品情報に対する変換処理", () => {
        const length = getRandomNumber(1, 100)
        const expectedArray = []
        const inputArray = []
        let expectedProduct
        for (let i = 0; i < length; i += 1) {
          expectedProduct = getRandomProduct(ProductKind.info, ProductIdKind.random, null, false)
          expectedArray.push(expectedProduct)
          inputArray.push(getInputProduct(expectedProduct))
        }
        const received = app.convertProducts(inputArray)
        expect(received).toEqual(expectedArray)
      })
    })
  })

  describe("ユーザ情報処理", () => {
    describe("users", () => {
      test("親ユーザ一覧取得", async () => {
        const res = await request(app.app)
          .post("/getParentUsers")
          .send({
            token: "hiyoshi.info.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.parentUsers[2]).toEqual(expectedExistingUser)
      })

      describe("ユーザ取得または追加", () => {
        test("既存ユーザ取得", async () => {
          const plainExistingUser = JSON.parse(JSON.stringify(expectedExistingUser))
          plainExistingUser.isParent = !!plainExistingUser.isParent
          plainExistingUser.regist = !!plainExistingUser.regist
          delete plainExistingUser.child
          delete plainExistingUser.isView
          const res = await request(app.app)
            .post("/findUser")
            .send({
              token: "hiyoshi.info.token",
              userId: "U46178fcc5f1bf5c8508fe3a3876475b3",
              displayName: "Ryukyu Blue",
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.user).toEqual(plainExistingUser)
        })

        test("新規ユーザ追加（親）", async () => {
          const newUser = getNewUser(UserKind.parent, null)
          const res = await request(app.app)
            .post("/findUser")
            .send({
              token: "hiyoshi.info.token",
              userId: newUser.userId,
              displayName: newUser.displayName,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.user).toEqual(newUser)
        })

        test("新規ユーザ追加（子）", async () => {
          const newUser = getNewUser(UserKind.child, 16)
          const res = await request(app.app)
            .post("/findUser")
            .send({
              token: "hiyoshi.info.token",
              userId: newUser.userId,
              displayName: newUser.displayName,
              parentID: newUser.parentID,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.user).toEqual(newUser)
        })
      })

      describe("該当ユーザ取得", () => {
        test("userId 指定", async () => {
          const plainExistingUser = JSON.parse(JSON.stringify(expectedExistingUser))
          plainExistingUser.flg_active = plainExistingUser.flg_active ? 1 : 0
          plainExistingUser.flg_1 = plainExistingUser.flg_1 ? 1 : 0
          plainExistingUser.flg_2 = plainExistingUser.flg_2 ? 1 : 0
          plainExistingUser.flg_3 = plainExistingUser.flg_3 ? 1 : 0
          plainExistingUser.flg_4 = plainExistingUser.flg_4 ? 1 : 0
          plainExistingUser.flg_5 = plainExistingUser.flg_5 ? 1 : 0
          delete plainExistingUser.child
          delete plainExistingUser.isView
          const res = await request(app.app)
            .post("/getUsers")
            .send({
              token: "hiyoshi.info.token",
              where: { userId: "U46178fcc5f1bf5c8508fe3a3876475b3" },
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.foundUsers[0]).toEqual(plainExistingUser)
        })

        test("フラグ指定", async () => {
          const plainExistingUser = JSON.parse(JSON.stringify(expectedExistingUser))
          plainExistingUser.flg_active = plainExistingUser.flg_active ? 1 : 0
          plainExistingUser.flg_1 = plainExistingUser.flg_1 ? 1 : 0
          plainExistingUser.flg_2 = plainExistingUser.flg_2 ? 1 : 0
          plainExistingUser.flg_3 = plainExistingUser.flg_3 ? 1 : 0
          plainExistingUser.flg_4 = plainExistingUser.flg_4 ? 1 : 0
          plainExistingUser.flg_5 = plainExistingUser.flg_5 ? 1 : 0
          delete plainExistingUser.child
          delete plainExistingUser.isView
          const res = await request(app.app)
            .post("/getUsers")
            .send({
              token: "hiyoshi.info.token",
              where_flg: {
                flg_active: 1,
                $or: [{ flg_1: 1 }, { flg_2: 1 }, { flg_3: 1 }, { flg_4: 1 }, { flg_5: 1 }],
              },
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.foundUsers[2]).toEqual(plainExistingUser)
        })
      })

      describe("ユーザ更新", () => {
        test("ID 指定", async () => {
          const expected = getRandomUser()
          expected.ID = 145
          const setUser = JSON.parse(JSON.stringify(expected))
          const res = await request(app.app)
            .post("/updateUser")
            .send({
              token: "hiyoshi.info.token",
              ID: expected.ID,
              set_user: setUser,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.user).toEqual(expected)
        })

        test("userId 指定", async () => {
          const expected = getRandomUser()
          expected.ID = 146
          expected.userId = "U1dbb6152fef79881dece2204a5caed68"
          const setUser = JSON.parse(JSON.stringify(expected))
          const res = await request(app.app)
            .post("/updateUser")
            .send({
              token: "hiyoshi.info.token",
              userId: expected.userId,
              set_user: setUser,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.user).toEqual(expected)
        })
      })

      test("ユーザ削除", async () => {
        // 新規ユーザ追加
        const newUser = getNewUser(UserKind.parent, null)
        const resAdd = await request(app.app)
          .post("/findUser")
          .send({
            token: "hiyoshi.info.token",
            userId: newUser.userId,
            displayName: newUser.displayName,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
        newUser.ID = resAdd.body.user.ID
        expect(resAdd.body.user).toEqual(newUser)
        // 追加したユーザを削除
        const resDelete = await request(app.app)
          .post("/deleteUser")
          .send({
            token: "hiyoshi.info.token",
            ID: newUser.ID,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        // 削除対象ユーザが存在しないことを確認
        resDelete.body.parentUsers.forEach((parentUser) => {
          expect(parentUser.ID).not.toBe(newUser.ID)
          if (parentUser.child) {
            parentUser.child.forEach((child) => {
              expect(child.ID).not.toBe(newUser.ID)
            })
          }
        })
      })
    })

    describe("ユーザ処理共通", () => {
      test("親ユーザに対する変換処理", async () => {
        const parentUsers = [getInputUser(expectedExistingUser)]
        const receivedParentUsers = await app.convertParentUsers(parentUsers, true)
        expect(receivedParentUsers[0]).toEqual(expectedExistingUser)
      })

      test("user の 1/0 を true/false に変換", () => {
        const expectedUser = getRandomUser()
        const inputUser = JSON.parse(JSON.stringify(expectedUser))
        expectedUser.flg_active = !!expectedUser.flg_active
        expectedUser.flg_1 = !!expectedUser.flg_1
        expectedUser.flg_2 = !!expectedUser.flg_2
        expectedUser.flg_3 = !!expectedUser.flg_3
        expectedUser.flg_4 = !!expectedUser.flg_4
        expectedUser.flg_5 = !!expectedUser.flg_5
        expectedUser.regist = !!expectedUser.regist
        expectedUser.isParent = !!expectedUser.isParent
        const receivedUser = app.convertUser(inputUser, true)
        expect(receivedUser).toEqual(expectedUser)
      })

      test("親ユーザに属する子を取得", async () => {
        const inputUser = JSON.parse(JSON.stringify(expectedExistingUser))
        delete inputUser.child
        const receivedUser = await app.getChildUsers(inputUser)
        expect(JSON.parse(JSON.stringify(receivedUser))).toEqual(expectedExistingUser.child)
      })
    })
  })

  describe("オーダ情報処理", () => {
    const expectedExistingInfoOrder = {
      isView: true,
      order_id: 859,
      user: {
        ID: 355,
        userId: "U851814afbe0de7a0b5b8721ec5e3a0b0",
        regist: 1,
        bizName: "MODERN Catalan SPANISH BIKiNi",
        shop_tel: "0351148500",
        manager: "土田　裕明",
        user_tel: "08050479059",
        displayName: "ブレイズ",
        flg_active: 1,
        flg_1: 1,
        flg_2: 0,
        flg_3: 1,
        flg_4: 0,
        flg_5: 1,
        shopCode: null,
        isParent: 0,
        parentID: 211,
      },
      parent: {
        ID: 211,
        userId: "U8fc3d6e973dfaf7228d6d4ebd7e1c75c",
        regist: 1,
        bizName: "MODERN Catalan SPANISH BIKiNi",
        shop_tel: "0351148500",
        manager: "河原井",
        user_tel: "09027610650",
        displayName: "河原井美希",
        flg_active: 1,
        flg_1: 1,
        flg_2: 0,
        flg_3: 1,
        flg_4: 0,
        flg_5: 1,
        shopCode: "3042-004",
        isParent: 1,
        parentID: null,
      },
      orderArray: {
        product_63: {
          productId: 63,
          productName: "紅しぐれ大根",
          productCode: 23443,
          productPrice: 308,
          quantity: 2,
        },
      },
      orderNum: 2,
      orderDate: "2022-01-01 20:17:06",
      deliveryDate: null,
    }

    describe("info_orders", () => {
      test("オーダ一覧取得", async () => {
        const res = await request(app.app)
          .post("/getInfoOrders")
          .send({
            token: "hiyoshi.info.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.infoOrders["2022-01"][0]).toEqual(expectedExistingInfoOrder)
      })

      describe("オーダ追加", () => {
        test("成功", async () => {
          // 1) /addProduct を叩いてテスト用商品を追加
          const newProduct = getRandomProduct(ProductKind.info, ProductIdKind.any, null, false)
          delete newProduct.productId
          newProduct.isOnSale = newProduct.isOnSale ? 1 : 0
          newProduct.isMax = 1
          newProduct.isPeriod = newProduct.isPeriod ? 1 : 0
          const resNewProduct = await request(app.app)
            .post("/addProduct")
            .send({
              token: "hiyoshi.info.token",
              new_product: newProduct,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)

          // 2) /addInfoOrder を叩いてオーダを追加
          const expected = getRandomInfoOrder(newProduct)
          const newInfoOrder = JSON.parse(JSON.stringify(expected))
          delete newInfoOrder.order_id
          newInfoOrder.orderArray[0].productId =
            resNewProduct.body.products[resNewProduct.body.products.length - 1].productId
          newInfoOrder.orderArray[0].quantity = newProduct.maxNum
          const res = await request(app.app)
            .post("/addInfoOrder")
            .send({
              token: "hiyoshi.info.token",
              new_info_order: newInfoOrder,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.result).toBe(1)
          res.body.products.forEach((product) => {
            if (product.productId === newInfoOrder.orderArray[0].productId) {
              expect(product.maxNum).toEqual(0)
            }
          })

          // 3) Sequelize で直接取得して追加したオーダ情報を確認
          await models.info_orders
            .findOne({ order: [["order_id", "DESC"]] })
            .then(async (infoOrder) => {
              expect(JSON.parse(infoOrder.orderArray)[0].productId).toEqual(
                resNewProduct.body.products[resNewProduct.body.products.length - 1].productId
              )
              await models.products
                .findOne({
                  where: {
                    productId:
                      resNewProduct.body.products[resNewProduct.body.products.length - 1].productId,
                  },
                })
                .then((product) => {
                  expect(product.maxNum).toEqual(0)
                })
            })
        })

        test("失敗", async () => {
          // 1) /addProduct を叩いてテスト用商品を追加
          const newProduct = getRandomProduct(ProductKind.info, ProductIdKind.any, null, false)
          delete newProduct.productId
          newProduct.isOnSale = newProduct.isOnSale ? 1 : 0
          newProduct.isMax = 1
          newProduct.isPeriod = newProduct.isPeriod ? 1 : 0
          const resNewProduct = await request(app.app)
            .post("/addProduct")
            .send({
              token: "hiyoshi.info.token",
              new_product: newProduct,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)

          // 2) /addInfoOrder を叩いてオーダを追加
          const expected = getRandomInfoOrder(newProduct)
          const newInfoOrder = JSON.parse(JSON.stringify(expected))
          delete newInfoOrder.order_id
          newInfoOrder.orderArray[0].productId =
            resNewProduct.body.products[resNewProduct.body.products.length - 1].productId
          newInfoOrder.orderArray[0].quantity = newProduct.maxNum + 1
          const res = await request(app.app)
            .post("/addInfoOrder")
            .send({
              token: "hiyoshi.info.token",
              new_info_order: newInfoOrder,
            })
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .expect(200)
          expect(res.body.message).toContain(
            `注文数「${newProduct.maxNum + 1}」に対して在庫数「${
              newProduct.maxNum
            }」のため、在庫不足で注文に失敗しました。カートを閉じて最新の在庫数をご確認ください。`
          )
          res.body.products.forEach((product) => {
            if (product.productId === newInfoOrder.orderArray[0].productId) {
              expect(product.maxNum).toEqual(newProduct.maxNum)
            }
          })

          // 3) Sequelize で直接取得して追加した商品情報を確認
          await models.products
            .findOne({
              where: {
                productId:
                  resNewProduct.body.products[resNewProduct.body.products.length - 1].productId,
              },
            })
            .then((product) => {
              expect(product.maxNum).toEqual(newProduct.maxNum)
            })
        })
      })
    })

    describe("オーダ処理共通", () => {
      test("オーダ情報に対する変換処理", async () => {
        // input オーダ生成
        const inputInfoOrder = await models.info_orders.findOne({ where: { order_id: 859 } })
        const Mm = `0${inputInfoOrder.orderDate.getMonth() + 1}`.slice(-2)
        const expectedYyyyMm = `${inputInfoOrder.orderDate.getFullYear()}-${Mm}`
        // 変換処理実行
        const receivedArray = await app.convertInfoOrders([inputInfoOrder])
        const received = receivedArray[expectedYyyyMm][0]
        expect(received).toEqual(expectedExistingInfoOrder)
      })
    })
  })

  describe("メッセージ情報処理", () => {
    const expectedExistingMessage = {
      ID: 113,
      createDate: "2021-07-15 15:24:54",
      sendDate: "sendNow",
      inputDate: null,
      inputTime: "",
      messages: [
        {
          text: "市場カレンダーのフラグにテスト配信しています。\n動画や画像も同時配信テストです。",
          editor: {
            text: true,
            image: false,
            movie: false,
          },
          originalContentUrl: "",
          previewImageUrl: "",
        },
        {
          text: "",
          editor: {
            text: false,
            image: true,
            movie: false,
          },
          main: "",
          originalContentUrl: "https://hiyoshi.api.line.cx/image/origin_1626330255.jpg",
          previewImageUrl: "https://hiyoshi.api.line.cx/image/thumb_1626330255.jpg",
        },
        {
          text: "",
          editor: {
            text: false,
            image: false,
            movie: true,
          },
          main: "",
          originalContentUrl: "https://hiyoshi.api.line.cx/image/movie_1626330286.mp4",
          previewImageUrl: "https://hiyoshi.api.line.cx/image/thumb_1626330285.jpg",
        },
      ],
      destinationTo: [4],
      lastSendDate: "2021-07-15 15:24:54",
      reservation: null,
      delFlg: 0,
    }

    describe("messages", () => {
      test("メッセージ一覧取得", async () => {
        const res = await request(app.app)
          .post("/getMessages")
          .send({
            token: "hiyoshi.info.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(res.body.messages[68]).toEqual(expectedExistingMessage)
      })

      test("メッセージ追加", async () => {
        const setMessage = JSON.parse(JSON.stringify(expectedExistingMessage))
        delete setMessage.ID
        const res = await request(app.app)
          .post("/addMessage")
          .send({
            token: "hiyoshi.info.token",
            set_message: setMessage,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        setMessage.ID = expect.anything()
        expect(res.body.message).toEqual(setMessage)
      })

      test("メッセージ更新", async () => {
        const setMessage = getRandomMessage(300)
        const res = await request(app.app)
          .post("/updateMessage")
          .send({
            token: "hiyoshi.info.token",
            message_id: setMessage.ID,
            set_message: setMessage,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        setMessage.createDate = "2022-03-06 16:00:49"
        expect(res.body.message).toEqual(setMessage)
      })
    })

    describe("messages 処理共通", () => {
      test("メッセージ情報に対する変換処理", async () => {
        // 期待値メッセージ生成
        const expectedMessage = getRandomMessage(getRandomNumber(1, 1000))
        // input メッセージ生成
        const inputMessage = createInputMessage(expectedMessage)
        // 変換処理実行
        const received = await app.convertMessages([inputMessage], false)
        expect(received[0]).toEqual(expectedMessage)
      })
    })

    describe("LINE Messaging API", () => {
      test("LINE 複数ユーザにメッセージ送信", async () => {
        const resToken = await request(app.app)
          .post("/getToken")
          .send({
            token: "hiyoshi.info.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        const resMessage = await request(app.app)
          .post("/PUSH/multicast")
          .send({
            token: resToken.body.token,
            config: {
              channelAccessToken:
                "8DkTpFuaJ31z3/lIAC0te+xjROb6eMIi/147zV4kg6JCymDlwdSPNUzcu0asuZz/JHy+qLE6nCvhGg+x5cldeOir2AGn0JWHWbz3tZT/FO8AmBXUyGqvmbODsItzAvtYR9jtJavk/U9rQ5wdeKjiqgdB04t89/1O/w1cDnyilFU=",
              channelSecret: "27b604a8f14849f87bbaabd6c247a6cd",
            },
            userId: ["Ucca44d36d9c6f7536b47bc420cde2b6f"],
            messages: [
              {
                type: "text",
                text: expectedExistingMessage.messages[0].text,
              },
              {
                type: "image",
                originalContentUrl: expectedExistingMessage.messages[1].originalContentUrl,
                previewImageUrl: expectedExistingMessage.messages[1].previewImageUrl,
              },
              {
                type: "video",
                originalContentUrl: expectedExistingMessage.messages[2].originalContentUrl,
                previewImageUrl: expectedExistingMessage.messages[2].previewImageUrl,
              },
            ],
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(resMessage.body).toEqual({ result: "OK" })
      })
    })

    describe("CDN 処理", () => {
      test("画像をアップロード", async () => {
        const resToken = await request(app.app)
          .post("/getToken")
          .send({
            token: "hiyoshi.info.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        const resMessage = await request(app.app)
          .post("/uploadFileCDN")
          .send({
            token: resToken.body.token,
            imageBase64: `data:image/png;base64,${fs.readFileSync("./__tests__/test.png", {
              encoding: "base64",
            })}`,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(resMessage.body.files).toEqual({
          main: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/main_[0-9a-zA-Z\-_]{24,28}\.png/
          ),
          orgn: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/orgn_[0-9a-zA-Z\-_]{24,28}\.png/
          ),
          thmb: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/thmb_[0-9a-zA-Z\-_]{24,28}\.png/
          ),
          vdeo: expect.stringMatching(/^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/null/),
        })
      })

      test("動画をアップロード", async () => {
        const resToken = await request(app.app)
          .post("/getToken")
          .send({
            token: "hiyoshi.info.token",
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        const resMessage = await request(app.app)
          .post("/uploadFileCDN")
          .send({
            token: resToken.body.token,
            imageBase64: `data:image/png;base64,${fs.readFileSync("./__tests__/test.png", {
              encoding: "base64",
            })}`,
            videoBase64: `data:video/mp4;base64,${fs.readFileSync("./__tests__/test.mp4", {
              encoding: "base64",
            })}`,
          })
          .set("Content-Type", "application/json")
          .set("Accept", "application/json")
          .expect(200)
        expect(resMessage.body.files).toEqual({
          main: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/main_[0-9a-zA-Z\-_]{24,28}\.png/
          ),
          orgn: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/orgn_[0-9a-zA-Z\-_]{24,28}\.png/
          ),
          thmb: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/thmb_[0-9a-zA-Z\-_]{24,28}\.png/
          ),
          vdeo: expect.stringMatching(
            /^https:\/\/127\.0\.0\.1:[0-9]{3,5}\/vdeo_[0-9a-zA-Z\-_]{24,28}\.mp4/
          ),
        })
      })

      describe("CDN 処理共通", () => {
        test("画像サイズ変更", async () => {
          const newImagePath = `./__tests__/${getRandomString()}.png`
          await app.resizeImage("./__tests__/test.png", newImagePath, getRandomNumber(100, 1500))
          expect(fs.existsSync(newImagePath)).toBeTruthy()
          // テスト後のファイルを削除
          fs.unlinkSync(newImagePath)
        })
      })
    })
  })

  describe("共通処理", () => {
    test("トークンを取得", async () => {
      const res = await request(app.app)
        .post("/getToken")
        .send({
          token: "hiyoshi.info.token",
        })
        .set("Content-Type", "application/json")
        .set("Accept", "application/json")
        .expect(200)
      // 分またぎを考慮
      expect(
        res.body.token === app.generateToken(new Date()) ||
          res.body.token === app.generateToken(new Date(Date.now() - 60 * 1000))
      ).toBeTruthy()
    })

    test("トークンを生成", () => {
      const now = new Date()
      const result = app.generateToken(now)
      expect(result).toBe(
        crypto
          .createHash("md5")
          .update(
            new Date(now.getTime() + 9 * 60 * 60 * 1000)
              .toISOString()
              .replace("T", "@")
              .substring(0, 16)
          )
          .digest("hex")
      )
    })

    test("トークンを判定（分またぎを考慮）true:真正トークン／false:不正トークン", () => {
      const token = app.generateToken(new Date())
      const result = app.isValidToken(token)
      expect(result).toBeTruthy()
    })

    test("JST を UTC に変換", () => {
      const now = new Date()
      const result = app.getUtcDate(now.toISOString())
      expect(result).toEqual(new Date(now.getTime() + 9 * 60 * 60 * 1000))
    })

    test("UTC を JST に変換", () => {
      const now = new Date()
      const result = app.getJstDate(now.toISOString())
      expect(result).toEqual(new Date(now.getTime() - 9 * 60 * 60 * 1000))
    })

    test("Date オブジェクトを指定フォーマットに変換", () => {
      const now = new Date()
      const result = app.getFormattedDate(now, "yyyy-MM-ddThh:mm:ss.SSSZ")
      expect(result).toEqual(new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString())
    })

    test("SequelizeInstance 配列をプレーンなオブジェクト配列に変換", async () => {
      const expectedProduct = getRandomProduct(ProductKind.info, ProductIdKind.random, null, false)
      const result = await app.getPlainObjectArray([createInputProduct(expectedProduct, true)])
      expectedProduct.start = new Date(expectedProduct.start)
      expectedProduct.end = new Date(expectedProduct.end)
      delete result.get
      expect(result).toEqual([expectedProduct])
    })
  })
})

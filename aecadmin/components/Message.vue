<template></template>
<script>
import axios from "axios";

export default {
  props: {
    orders: {
      type: Array,
      default: [],
    },
    dialogSendMessage: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    cartPriceDetail: [],
  }),
  watch: {
    dialogSendMessage: {
      handler: function (val) {
        if (val) this.sendMessage();
      },
      deep: true,
    },
  },
  methods: {
    /*******************************************************
     * send line message
     * ユーザー（注文者）のLINEに、作成したメッセージを送信する
     *
     ********************************************************/
    async sendMessage() {
      await this.orders.forEach((order) => {
        this.sendLineMessage(order);
      });
      this.$emit("on-success");
    },

    async sendLineMessage(order) {
      const content = await this.createLineContent(order);
      this.cartPriceDetail = [];
      const { data } = await axios.post(
        `${process.env.API}/aec/sendLineMessage`,
        {
          token: process.env.INFO_TOKEN,
          content,
          receiver: order.userId,
          order,
        }
      );
      console.log(data.message);
      if (!data.status) return data.message;
    },

    async createLineContent(order) {
      const { app, carts } = order;

      this.cartPriceDetail = [
        {
          type: "text",
          text: "注文内容",
          size: "xs",
        },
      ];
      carts.forEach((cart) => {
        const msg = {
          type: "text",
          wrap: true,
          text: `${cart.productName}　${this.numberFormat(cart.price)}円×${
            cart.quantity
          }個　小計：${this.numberFormat(cart.price * cart.quantity)}円`,
          size: "xs",
          weight: "bold",
        };
        this.cartPriceDetail = [...this.cartPriceDetail, msg];
      });

      const content = {
        type: "flex",
        altText: '発送完了のお知らせ',
        contents: {
          type: "bubble",
          header: {
            type: "box",
            layout: "horizontal",
            contents: [],
            paddingBottom: "5px",
          },
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "発送完了のお知らせ",
                    size: "xs",
                    weight: "bold"
                  },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                paddingTop: "16px",
                contents: [
                  {
                    type: "text",
                    contents: [
                      {
                        type: "span",
                        text: `注文番号「 ${this.appCodeFormat(
                          app?.app_code,
                          order.orderId
                        )} 」の商品を本日発送いたしました。`,
                        size: "xs",
                      },
                    ],
                    wrap: true,
                  },
                ],
              },
              {
                type: "box",
                layout: "vertical",
                contents: [...this.shipNumberText(order.shipNumber)],
                paddingTop: "16px",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  ...this.cartPriceDetail,
                  ...[
                    {
                      type: "text",
                      wrap: true,
                      text: `【送料 : ${this.numberFormat(
                        order.shippingFee
                      )}円 / 合計金額 : ${this.numberFormat(
                        order.payment
                      )}円】`,
                      size: "xs",
                      weight: "bold",
                    },
                  ],
                ],
                paddingTop: "16px",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "下記のリンクより配送状況を確認できます。",
                    size: "xs",
                    wrap: true,
                  },
                  {
                    type: "text",
                    text: "https://toi.kuronekoyamato.co.jp/cgi-bin/tneko",
                    wrap: true,
                    size: "xs",
                    color: "#007bff",
                    weight: "bold",
                    action: {
                      type: "uri",
                      label: "action",
                      uri: "https://toi.kuronekoyamato.co.jp/cgi-bin/tneko",
                    },
                  },
                ],
                paddingTop: "16px",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "「発送完了のお知らせ」メッセージ配信直後などはご注文いただいた商品の配送状況が「伝票番号未登録」表示となっている場合がございます。",
                    size: "xs",
                    wrap: true,
                  },
                  {
                    type: "text",
                    text: "ヤマト運輸の配送状況によっては伝票番号の反映までに数時間から1日ほどお時間がかかる場合がございます。",
                    size: "xs",
                    wrap: true,
                  },
                  {
                    type: "text",
                    text: "予めご了承ください。",
                    size: "xs",
                    wrap: true,
                  },
                ],
                paddingTop: "16px",
              },
            ],
          },
          styles: {
            header: {
              backgroundColor: "#ffffff",
            },
            hero: {
              backgroundColor: "#000000",
            },
            body: {
              backgroundColor: "#ffffff",
            },
          },
        },
      };

      return content;
    },

    numberFormat: function (value) {
      return new Intl.NumberFormat("ja-JP").format(value);
    },

    shipNumberText: function (shipNumber) {
      return [
          {
            type: "text",
            text: "発送の伝票番号は",
            size: "xs",
          },
          {
            type: "text",
            text: shipNumber ?`「${shipNumber}」` : "「********」",
            size: "xs",
            weight: "bold",
          },
          {
            type: "text",
            text: "となります。",
            size: "xs",
          },
        ];
    },

    appCodeFormat: function (app_code, orderId) {
      if (app_code == undefined || app_code == null) {
        return orderId;
      } else {
        return app_code + "-" + orderId;
      }
    },
  },
};
</script>

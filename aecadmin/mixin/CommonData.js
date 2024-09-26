import config from "../constants/config.js";
export const commonData = {
  data() {
    return {
      icons: {
        channel: {
          0: { icon: config.BtoB, text: process.env.TOOLTIP_B2B, iconActive: config.BtoBActive },
          1: { icon: config.BtoBspot, text: process.env.TOOLTIP_SPOT, iconActive: config.BtoBspotActive },
          2: { icon: config.BtoC, text: process.env.TOOLTIP_B2C, iconActive: config.BtoCActive },
          3: { icon: config.BtoBtoC, text: process.env.TOOLTIP_B2B2C, iconActive: config.BtoBtoCActive },
        },
        channelBit: {
          1: { icon: config.BtoB, text: process.env.TOOLTIP_B2B },
          2: { icon: config.BtoBspot, text: process.env.TOOLTIP_SPOT },
          4: { icon: config.BtoC, text: process.env.TOOLTIP_B2C },
          8: { icon: config.BtoBtoC, text: process.env.TOOLTIP_B2B2C },
        },
        task: {
          1: { icon: "mdi-human-dolly", text: "ピッキングリスト出力" },
          2: { icon: "mdi-truck-outline", text: "案件CSV出力" },
          4: { icon: "mdi-page-previous-outline", text: "発送リスト取込" },
          8: { icon: "mdi-email-outline", text: "出荷済LINE通知" },
          16: { icon: "mdi-check-all", text: "全選択" },
          32: {
            icon: "mdi-truck-outline",
            text: process.env.CUSTOMIZED_CSV_DOWNLOAD_NAME,
          },
        },
      },
    };
  },
}

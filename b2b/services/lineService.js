const line = require('@line/bot-sdk');

const lineConfig = {
  channelAccessToken: `${process.env.MSG_ACCESS_TOKEN}`,
  channelSecret: `${process.env.MSG_CHANNEL_SECRET}`,
};

/**
 * Line Service
 */
module.exports = class LineService {
  /**
   * Constructor
   */
  constructor() {
    this.client = new line.Client(lineConfig);
  }

  /**
   * Create line middleware
   * @return {any} Middleware
   */
  makeMiddleware() {
    return line.middleware(lineConfig);
  }

  /**
   * send multiple line message
   * 
   * @param {string[]} uuid to
   * @param {any} receipt Message 
   * @return {Promise<any>} Response
   */
  async sendMultipleMessages(users, receipt) {
    return await this.client.multicast(users, receipt)
  }
};

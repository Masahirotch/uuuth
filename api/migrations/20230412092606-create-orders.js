'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      orderId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      todo: {
        type: Sequelize.TINYINT(2),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(12),
        allowNull: true,
      },
      orderDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      userId: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      userName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      orderNum: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      cartPrice: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      discount: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      shippingFee: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      orderFee: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      payment: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      order_stripe_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      orderMemo: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      addressId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      deliveryMethod: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      preferredDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      preferredTime: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      deliveryDay: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      shipNumber: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      appId: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
      shopuserId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.sequelize.query('ALTER TABLE `orders` ADD COLUMN `salesChannel` BIT(4) DEFAULT NULL AFTER `orderDate`;');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
  },
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_discounts', {
      orderDiscountId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      couponId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      discount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.addIndex('order_discounts', ['orderId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('order_discounts', ['orderId']);
    await queryInterface.dropTable('order_discounts');
  }
};

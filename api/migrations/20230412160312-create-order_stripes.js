'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_stripes', {
      order_stripe_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.addIndex('order_stripes', ['orderId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('order_stripes', ['orderId']);
    await queryInterface.dropTable('order_stripes');
  }
};

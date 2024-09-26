'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_cart', {
      cart_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING(64),
      },
      product_id: {
        type: Sequelize.BIGINT(20),
      },
      product_name: {
        type: Sequelize.STRING(255),
      },
      product_code: {
        type: Sequelize.STRING(255),
      },
      price: {
        type: Sequelize.INTEGER(11),
      },
      quantity: {
        type: Sequelize.INTEGER(11),
      },
      update_date: {
        type: Sequelize.DATE,
      },
      session_id: {
        type: Sequelize.STRING(255),
      },
      is_active: {
        type: Sequelize.INTEGER(1),
        defaultValue: 1,
      },
      size_code: {
        type: Sequelize.STRING(10),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('order_cart');
  }
};

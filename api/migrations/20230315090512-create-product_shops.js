'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_shops', {
      pid: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
      },
      shopId: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_shops');
  }
};

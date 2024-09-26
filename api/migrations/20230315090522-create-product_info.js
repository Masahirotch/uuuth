'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_info', {
      productId: {
        type: Sequelize.BIGINT(20).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      effectiveDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      productPriceB: {
        type: Sequelize.INTEGER(7),
        allowNull: false,
      },
      productPriceC: {
        type: Sequelize.INTEGER(7),
        allowNull: false,
      },
      productPriceBC: {
        type: Sequelize.INTEGER(7),
        allowNull: false,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_info');
  }
};


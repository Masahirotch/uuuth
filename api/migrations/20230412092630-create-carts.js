'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('carts', {
      cartId: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      productId: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      productCode: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      productName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.addIndex('carts', ['orderId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('carts', ['orderId']);
    await queryInterface.dropTable('carts');
  }
};

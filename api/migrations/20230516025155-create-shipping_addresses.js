'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipping_addresses', {
      shippingAddressesId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT(20)
      },
      consumerId: {
        allowNull: false,
        type: Sequelize.STRING(64),
      },
      addressId: {
        allowNull: false,
        type: Sequelize.BIGINT(20),
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shipping_addresses');
  }
};

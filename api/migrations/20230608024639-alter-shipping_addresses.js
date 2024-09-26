'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Modify the 'shipping_addresses' table columns to allow null values
    await queryInterface.changeColumn(
        'shipping_addresses',
        'consumerId',
        {
          type: Sequelize.STRING(64),
          allowNull: true,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'shipping_addresses',
        'addressId',
        {
          type: Sequelize.BIGINT(20),
          allowNull: true,
        }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes made to the 'shipping_addresses' table columns
    await queryInterface.changeColumn(
        'shipping_addresses',
        'consumerId',
        {
          type: Sequelize.STRING(64),
          allowNull: false,
          collate: 'utf8mb4_unicode_ci',
        }
    );

    await queryInterface.changeColumn(
        'shipping_addresses',
        'addressId',
        {
          type: Sequelize.BIGINT(20),
          allowNull: false,
        }
    );
  },
};

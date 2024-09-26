'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_groups', {
      productGroup: {
        type: Sequelize.STRING(16),
        allowNull: false,
        primaryKey: true,
      },
      groupName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('product_groups');
  }
};

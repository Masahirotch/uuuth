'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shop_groups', {
      shopGroupId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      groupName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shop_groups');
  }
};

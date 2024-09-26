'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sizes', {
      size_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        primaryKey: true,
      },
      size_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sizes');
  }
};
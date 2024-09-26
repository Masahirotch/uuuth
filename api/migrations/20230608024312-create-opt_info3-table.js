'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('opt_info3', {
      infoId: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.BIGINT(20),
      },
      infoText: {
        allowNull: true,
        type: Sequelize.STRING(255),
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('opt_info3');
  }
};
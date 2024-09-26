'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consumers', {
      consumerId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(64)
      },
      consumerName: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      addressId: {
        allowNull: false,
        type: Sequelize.BIGINT(20)
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consumers');
  }
};

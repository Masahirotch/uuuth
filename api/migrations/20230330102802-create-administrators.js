'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('administrators', {
      adminId: {
        type: Sequelize.STRING(128),
        primaryKey: true,
        allowNull: false,
      },
      adminName: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      privilege: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('administrators');
  }
};

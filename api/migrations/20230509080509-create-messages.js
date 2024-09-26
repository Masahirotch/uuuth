'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      msgId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tag: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      laterSend: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastSend: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
  },
};

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      isParent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 1
      },
      userCode: {
        allowNull: false,
        type: Sequelize.STRING(20),
        unique: true
      },
      userLine: {
        type: Sequelize.STRING(128),
        defaultValue: null
      },
      userName: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      shopId: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'shops',
          key: 'shopId'
        }
      },
      userTel: {
        type: Sequelize.STRING(16),
        defaultValue: null
      },
      regist: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      purchase: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      deleteFlg: {
        type: Sequelize.INTEGER(1),
        defaultValue: 0,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.sequelize.query('ALTER TABLE `users` ADD COLUMN `salesChannel` BIT(4) NOT NULL AFTER `shopId`;');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};

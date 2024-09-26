'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shops', {
      shopId: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      shopCode: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: true
      },
      shopName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      bizName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      shopGroupId: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        references: {
          model: 'shop_groups',
          key: 'shopGroupId'
        }
      },
      addressId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'addresses',
          key: 'addressId'
        }
      },
      shopPickup: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      closing: {
        type: Sequelize.TIME,
        allowNull: true
      },
      tag: {
        type: Sequelize.BIGINT(64),
        defaultValue: 0,
        allowNull: false
      },
      deleteFlg: {
        type: Sequelize.INTEGER(1),
        defaultValue: 0,
        allowNull: false
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shops');
  }
};
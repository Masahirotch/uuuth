'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      productId: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      productGroup: {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      productCode: {
        type: Sequelize.STRING(16),
        allowNull: false,

      },
      productName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      productTag: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      productSubname: {
        type: Sequelize.STRING(255),
        allowNull: true,

      },
      productOrign: {
        type: Sequelize.STRING(255),
        allowNull: true,

      },
      productDetail: {
        type: Sequelize.TEXT,
        allowNull: true,

      },
      productArticle: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      productPhoto1: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      productPhoto2: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      productPhoto3: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      productPriceB: {
        type: Sequelize.INTEGER(7),
        allowNull: false
      },
      productPriceC: {
        type: Sequelize.INTEGER(7),
        allowNull: false
      },
      productPriceBC: {
        type: Sequelize.INTEGER(7),
        allowNull: false
      },
      productPriceM: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      productPriceS: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
      },
      taxRate: {
        type: Sequelize.INTEGER(3),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(16),
        allowNull: false,

      },
      size: {
        type: Sequelize.STRING(10),
        allowNull: true,

      },
      shop: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0
      },
      quantity: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0
      },
      maxNum: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      },
      stock: {
        type: Sequelize.INTEGER(11),
        allowNull: true
      },
      period: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0
      },
      start: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isOnsale: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 1
      },
      deleteFlg: {
        type: Sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.sequelize.query('ALTER TABLE `products` ADD COLUMN `salesChannel` BIT(4) NOT NULL AFTER `productPhoto3`;');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
}

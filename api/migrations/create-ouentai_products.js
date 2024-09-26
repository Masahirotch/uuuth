'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ouentai_products', {
      productId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED,
      },
      productName: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      productDetail: {
        type: Sequelize.TEXT,
        defaultValue: null,
      },
      productPhoto: {
        type: Sequelize.STRING(255),
        defaultValue: null,
      },
      productPrice: {
        type: Sequelize.INTEGER(6),
        defaultValue: null,
      },
      isOnSale: {
        type: Sequelize.INTEGER(1),
        defaultValue: 1,
      },
      quantity: {
        type: Sequelize.INTEGER(1),
        defaultValue: 0,
      },
      maxNum: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0,
      },
      isMax: {
        type: Sequelize.INTEGER(1),
        defaultValue: 0,
      },
      isPeriod: {
        type: Sequelize.INTEGER(1),
        defaultValue: 0,
      },
      start: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
      end: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "productId" }],
      },
      ],
      initialAutoIncrement: 29,
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ouentai_products');
  }
};
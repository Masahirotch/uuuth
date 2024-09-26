'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('temp_cart', {
      product_id: {
        type: Sequelize.INTEGER(10),
        allowNull: false,
        comment: '商品ID'
      },
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: '注文者のLINE User ID',
      },
      price: {
        type: Sequelize.INTEGER(10),
        defaultValue: 0,
        comment: '注文時の単価',
        allowNull: true
      },
      group_code: {
        type: Sequelize.STRING(20),
        defaultValue: null,
        comment: '商品化価格適用店舗グループ',
        allowNull: true,
      },
      product_code: {
        type: Sequelize.STRING(20),
        defaultValue: null,
        comment: '商品コード',
        allowNull: true,
      },
      product_name: {
        type: Sequelize.STRING(64),
        defaultValue: null,
        comment: '商品名',
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER(10),
        defaultValue: 0,
        comment: 'カート数量',
        allowNull: true
      },
      shop_code: {
        type: Sequelize.STRING(20),
        defaultValue: null,
        comment: '店舗コード',
        allowNull: true,
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });

    await queryInterface.addIndex('temp_cart', ['product_id', 'user_id'], {
      name: 'cart_id',
      unique: true,
      using: 'BTREE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('temp_cart');
  }
};
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_mylist_cart', {
      product_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
        comment: '商品ID'
      },
      list_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
        comment: 'My List ID'
      },
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        comment: '注文者のLINE User ID'
      },
      price: {
        type: Sequelize.INTEGER(10),
        allowNull: true,
        defaultValue: 0,
        comment: '注文時の単価'
      },
      group_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '商品化価格適用店舗グループ'
      },
      product_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '商品コード'
      },
      product_name: {
        type: Sequelize.STRING(64),
        allowNull: true,
        comment: '商品名'
      },
      quantity: {
        type: Sequelize.INTEGER(10),
        allowNull: true,
        defaultValue: 0,
        comment: 'カート数量'
      },
      shop_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '店舗コード'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_mylist_cart');
  }
};

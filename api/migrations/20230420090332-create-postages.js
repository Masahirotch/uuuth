'use strict';
const Sequelize = require("sequelize");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('postages', {
      postage_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      shop_code: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      pref_code: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      shipping_flg: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      size_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      shipping_fee: {
        allowNull: true,
        type: Sequelize.INTEGER(11)
      }
    },{
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('postages');
  }
};
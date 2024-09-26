'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_mylist', {
      list_id: {
        type: Sequelize.INTEGER(10).UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      list_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'list'
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_mylist');
  }
};
